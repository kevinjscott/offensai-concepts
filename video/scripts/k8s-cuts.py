import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'public/video'
SOURCE = OUTPUT / 'offensai-k8s-impersonate-reel-v5.mov'
FFMPEG = os.environ.get('FFMPEG_BINARY', 'ffmpeg')
FONT_DIR = ROOT / 'video/public/mono'

# Keep the execution order intact; accelerate only the waiting intervals.
SEGMENTS = [
    (0, 2, 1, 'null'),
    (2, 3, 1, 'crop=640:360:570:110,scale=1280:720'),
    (3, 15, 1, 'null'),
    (15, 25, 8, 'null'),
    (25, 30, 2, 'null'),
    (30, 49, 8, 'null'),
    (49, 52, 1, 'null'),
    (52, 55, 1, 'crop=640:360:620:300,scale=1280:720'),
    (55, 59, 1, 'null'),
]
DURATION = sum((end - start) / speed for start, end, speed, _ in SEGMENTS) + 4


def run(args):
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-filter_complex_threads', '2', '-y', *args], check=True)


def timestamp(seconds):
    centiseconds = round(seconds * 100)
    return f'{centiseconds // 360000}:{centiseconds // 6000 % 60:02}:{centiseconds // 100 % 60:02}.{centiseconds % 100:02}'


def subtitles(path, executive=False):
    opening = ('Three identities from the crown jewel.\\NWhich findings actually connect?' if executive else
               'A restricted service account.\\NOne working path to system:masters.')
    cues = [
        (0, 3, opening),
        (3, 9, 'Local AI. No cloud model APIs.\\NAutonomous. Within deterministic guardrails.'),
        (9, 15, 'RECON / 52 RBAC rules.\\NA continuity token connects the next identity.'),
        (15, 16.25, '8x SPEED / LOCAL MODEL REASONING'),
        (16.25, 18.75, '2x SPEED / The path reaches group impersonation.'),
        (18.75, 21.125, '8x SPEED / LOCAL MODEL REASONING'),
        (21.125, 24.125, 'THE PIVOT / system:masters\\NGroup impersonation on a read request.'),
        (24.125, 27.125, 'GOAL MET / Secret accessed.\\NNo persistent server objects created.'),
        (27.125, 31.125, 'No persistent objects is not no audit trail.\\NKubernetes audit logs may record the request.'),
        (31.125, DURATION, 'Stop patching lists.\\NStart breaking chains.' if executive else
         'Scanners give you findings.\\NOFFENSAI proves the working path.'),
    ]
    header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Geist Mono,40,&H00F0E8E2,&H00F0E8E2,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,1,0,2,28,28,24,1
Style: End,Geist Mono,46,&H00F0E8E2,&H00F0E8E2,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,5,60,60,0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    events = [f'Dialogue: 0,{timestamp(a)},{timestamp(b)},{"End" if a >= 31.125 else "Default"},,0,0,0,,{text}' for a, b, text in cues]
    path.write_text(header + '\n'.join(events) + '\n')


def main():
    run(['-i', str(SOURCE), '-c:v', 'libx264', '-preset', 'fast', '-crf', '21', '-threads', '2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', str(OUTPUT / 'k8s-original.mp4')])
    with tempfile.TemporaryDirectory() as directory:
        directory = Path(directory)
        font_config = directory / 'fonts.conf'
        font_config.write_text(f'<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>{FONT_DIR}</dir><cachedir>{directory / "font-cache"}</cachedir></fontconfig>')
        os.environ['FONTCONFIG_FILE'] = str(font_config)
        filters = []
        for index, (start, end, speed, transform) in enumerate(SEGMENTS):
            filters.append(f'[0:v]trim=start={start}:end={end},setpts=(PTS-STARTPTS)/{speed},{transform},setsar=1,fps=30[v{index}]')
        filters.append('color=c=black:s=1280x720:r=30:d=4[end]')
        labels = ''.join(f'[v{i}]' for i in range(len(SEGMENTS)))
        filters.append(f'{labels}[end]concat=n={len(SEGMENTS) + 1}:v=1:a=0[cut]')
        for name, executive in [('technical', False), ('executive', True)]:
            caption_file = directory / f'{name}.ass'
            subtitles(caption_file, executive)
            graph = ';'.join(filters) + f";[cut]drawbox=x=0:y=580:w=iw:h=140:color=black:t=fill,ass=filename='{caption_file}':fontsdir='{FONT_DIR}'[out]"
            pulse = '0.055*sin(2*PI*55*t)*exp(-5*mod(t,0.5))+0.018*sin(2*PI*82.4*t)*exp(-3*mod(t,1))+0.012*sin(2*PI*1100*t)*exp(-100*mod(t,0.5))'
            run(['-i', str(SOURCE), '-f', 'lavfi', '-i', f"aevalsrc='{pulse}':s=48000:d={DURATION}", '-filter_complex', graph,
                 '-map', '[out]', '-map', '1:a', '-af', f'afade=t=in:d=0.5,afade=t=out:st={DURATION - 2}:d=2',
                 '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-threads', '2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k',
                 '-t', str(DURATION), '-movflags', '+faststart', str(OUTPUT / f'k8s-{name}.mp4')])
            run(['-i', str(OUTPUT / f'k8s-{name}.mp4'), '-ss', '2.5', '-frames:v', '1', '-update', '1', str(OUTPUT / f'k8s-{name}-poster.jpg')])
    print(f'Rendered two {DURATION:.2f}s caption-led cuts and a browser-compatible original.')


if __name__ == '__main__':
    main()
