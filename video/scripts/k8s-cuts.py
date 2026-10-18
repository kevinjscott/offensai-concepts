import json
import math
import os
from pathlib import Path
import re
import subprocess
import tempfile
import textwrap

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'public/video'
SOURCE = OUTPUT / 'offensai-k8s-impersonate-reel-v5.mov'
FFMPEG = os.environ.get('FFMPEG_BINARY', 'ffmpeg')
FONT_DIR = ROOT / 'video/public/mono'
STORIES = json.loads((Path(__file__).parent / 'k8s-storyboard.json').read_text())


def run(args):
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-filter_complex_threads', '2', '-y', *args], check=True)


def audio_duration(path):
    result = subprocess.run([FFMPEG, '-i', str(path)], capture_output=True, text=True)
    match = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', result.stderr)
    if not match:
        raise RuntimeError(f'Could not measure {path}')
    h, m, s = map(float, match.groups())
    return h * 3600 + m * 60 + s


def timestamp(seconds, vtt=False):
    if vtt:
        milliseconds = round(seconds * 1000)
        return f'{milliseconds // 3600000:02}:{milliseconds // 60000 % 60:02}:{milliseconds // 1000 % 60:02}.{milliseconds % 1000:03}'
    cs = round(seconds * 100)
    return f'{cs // 360000}:{cs // 6000 % 60:02}:{cs // 100 % 60:02}.{cs % 100:02}'


def caption_schedule(beat, length):
    weights = [len(text.split()) for text in beat['captions']]
    cursor = 0.08
    result = []
    for text, weight in zip(beat['captions'], weights):
        end = cursor + (length - 0.15) * weight / sum(weights)
        result.append((cursor, end, text))
        cursor = end
    return result


def subtitles(path, beat, duration):
    header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Brand,Geist Mono,36,&H00F2EDE9,&H00F2EDE9,&H00100D0B,&H00100D0B,1,0,0,0,100,100,2,0,1,0,0,7,0,0,0,1
Style: Tag,Geist Mono,28,&H00E0D667,&H00E0D667,&H00100D0B,&H00100D0B,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Head,Geist Mono,76,&H00F2EDE9,&H00F2EDE9,&H00100D0B,&H00100D0B,1,0,0,0,100,100,-2,0,1,0,0,7,0,0,0,1
Style: Evidence,Geist Mono,58,&H00E0D667,&H00E0D667,&H00100D0B,&H00100D0B,1,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Proof,Geist Mono,34,&H00B5A497,&H00B5A497,&H00100D0B,&H00100D0B,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Caption,Geist Mono,62,&H00F2EDE9,&H00F2EDE9,&H00100D0B,&H00100D0B,1,0,0,0,100,100,-1,0,1,0,0,5,0,0,0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    events = []

    def event(style, x, y, text, start=0, end=duration):
        text = text.replace('\n', r'\N')
        events.append(f'Dialogue: 0,{timestamp(start)},{timestamp(end)},{style},,0,0,0,,{{\\pos({x},{y})}}{text}')

    event('Brand', 72, 150, 'OFFENSAI / KUBERNETES')
    event('Tag', 72, 235, beat['tag'])
    event('Head', 72, 335, beat['headline'])
    event('Evidence', 72, 560, beat['evidence'])
    event('Proof', 72, 1270, beat['proof'])
    event('Proof', 72, 1660, 'RECORDED DEMO / EDITED FOR PACE')
    for start, end, text in caption_schedule(beat, duration):
        event('Caption', 520, 1465, '\n'.join(textwrap.wrap(text, width=24)), start, end)
    path.write_text(header + '\n'.join(events) + '\n')


def main():
    manifest = {}
    with tempfile.TemporaryDirectory() as directory:
        directory = Path(directory)
        config = directory / 'fonts.conf'
        config.write_text(f'<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>{FONT_DIR}</dir><cachedir>{directory / "font-cache"}</cachedir></fontconfig>')
        os.environ['FONTCONFIG_FILE'] = str(config)
        for variant, beats in STORIES.items():
            clips, transcript, vtt, cursor = [], [], ['WEBVTT\n'], 0
            for index, beat in enumerate(beats):
                voice = OUTPUT / f'k8s-{variant}-voice-{index}.mp3'
                duration = math.ceil((audio_duration(voice) + 0.2) * 30) / 30
                ass = directory / f'{variant}-{index}.ass'
                subtitles(ass, beat, duration)
                w, h, x, y = beat['crop']
                transform = (f'crop={w}:{h}:{x}:{y},scale=1080:540:flags=lanczos,setsar=1,fps=30,'
                             f'tpad=stop_mode=clone:stop_duration={duration},trim=duration={duration},'
                             f'pad=1080:1920:0:690:color=0x0b0d10,'
                             'drawbox=x=72:y=646:w=936:h=3:color=0x67d6e0:t=fill,'
                             f"ass=filename='{ass}':fontsdir='{FONT_DIR}'")
                clip = directory / f'{variant}-{index}.mp4'
                pulse = '0.018*sin(2*PI*55*t)*exp(-7*mod(t,0.5))+0.006*sin(2*PI*110*t)*exp(-6*mod(t,1))'
                graph = (f'[0:v]{transform}[v];'
                         f'[1:a]adelay=80:all=1,apad,atrim=duration={duration}[vo];'
                         f'[2:a]afade=t=in:d=0.04,afade=t=out:st={duration - 0.2}:d=0.2[bed];'
                         '[vo][bed]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]')
                run(['-ss', str(beat['start']), '-t', str(beat['end'] - beat['start']), '-i', str(SOURCE),
                     '-i', str(voice), '-f', 'lavfi', '-i', f"aevalsrc='{pulse}':s=48000:d={duration}",
                     '-filter_complex', graph, '-map', '[v]', '-map', '[a]', '-t', str(duration),
                     '-c:v', 'libx264', '-preset', 'fast', '-crf', '21', '-threads', '2', '-pix_fmt', 'yuv420p',
                     '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', str(clip)])
                clips.append(clip)
                transcript.append({'time': f'{int(cursor) // 60}:{int(cursor) % 60:02}', 'text': beat['voice']})
                for start, end, text in caption_schedule(beat, duration):
                    vtt.append(f'{timestamp(cursor + start, True)} --> {timestamp(cursor + end, True)}\n{text}\n')
                cursor += duration
                print(f'{variant}: beat {index + 1}/{len(beats)} rendered', flush=True)
            playlist = directory / f'{variant}.txt'
            playlist.write_text('\n'.join(f"file '{clip}'" for clip in clips))
            destination = OUTPUT / f'k8s-{variant}-portrait.mp4'
            run(['-f', 'concat', '-safe', '0', '-i', str(playlist), '-c:v', 'copy', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9',
                 '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', str(destination)])
            run(['-ss', '0.5', '-i', str(destination), '-frames:v', '1', '-update', '1', str(OUTPUT / f'k8s-{variant}-portrait.jpg')])
            (OUTPUT / f'k8s-{variant}-portrait.vtt').write_text('\n'.join(vtt))
            manifest[variant] = {'seconds': round(cursor, 2), 'duration': f'{round(cursor) // 60}:{round(cursor) % 60:02}', 'script': transcript}
            print(f'Exported {variant}: {cursor:.2f}s / 1080 × 1920 / narrated', flush=True)
    (OUTPUT / 'k8s-portrait-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')


if __name__ == '__main__':
    main()
