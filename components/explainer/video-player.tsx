'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Download, Maximize, Minimize, Pause, Play, RotateCcw, Volume1, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

const SRC = '/video/offensai-explainer.mp4'
const POSTER = '/video/poster.jpg'
const SPEEDS = [0.75, 1, 1.25, 1.5]

export const chapters = [
  { t: 0, label: 'The problem' },
  { t: 6, label: 'Findings flood' },
  { t: 13, label: 'The chain' },
  { t: 23, label: 'Machine speed' },
  { t: 27.4, label: 'Agents' },
  { t: 31.6, label: 'Compose' },
  { t: 37.8, label: 'Validate' },
  { t: 42.4, label: 'Prioritize' },
  { t: 48.1, label: 'Break the chain' },
  { t: 51.2, label: 'Evidence' },
  { t: 54.1, label: 'Close' },
]

const fmt = (s: number) => {
  const v = Math.max(0, Math.floor(s))
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`
}

const chapterIndexAt = (t: number) => {
  let idx = 0
  chapters.forEach((c, i) => {
    if (t >= c.t - 0.05) idx = i
  })
  return idx
}

export function VideoPlayer({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(60)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [speedOpen, setSpeedOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null)
  const [scrubbing, setScrubbing] = useState(false)

  const current = chapterIndexAt(time)

  const wake = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2600)
  }, [])

  const seek = useCallback((t: number) => {
    const v = videoRef.current
    if (!v) return
    const next = Math.min(Math.max(0, t), v.duration || 60)
    v.currentTime = next
    setTime(next)
    setEnded(false)
  }, [])

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setStarted(true)
    wrapRef.current?.focus({ preventScroll: true })
    if (v.ended) v.currentTime = 0
    if (v.paused) void v.play()
    else v.pause()
  }, [])

  const playFrom = useCallback(
    (t: number) => {
      const v = videoRef.current
      if (!v) return
      setStarted(true)
      wrapRef.current?.focus({ preventScroll: true })
      seek(t)
      void v.play()
    },
    [seek],
  )

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    let raf = 0
    const tick = () => {
      setTime(v.currentTime)
      raf = requestAnimationFrame(tick)
    }
    const onPlay = () => {
      setPlaying(true)
      setEnded(false)
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    const onPause = () => {
      setPlaying(false)
      cancelAnimationFrame(raf)
      setTime(v.currentTime)
    }
    const onEnded = () => {
      setPlaying(false)
      setEnded(true)
      setControlsVisible(true)
      cancelAnimationFrame(raf)
    }
    const onMeta = () => setDuration(v.duration || 60)
    const onProgress = () => {
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1))
    }
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', onEnded)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('progress', onProgress)
    onMeta()
    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('progress', onProgress)
    }
  }, [])

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrapRef.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    if (!playing) {
      setControlsVisible(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    } else {
      wake()
    }
  }, [playing, wake])

  const timeFromPointer = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect()
    if (!r) return 0
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * duration
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return
    const target = e.target as HTMLElement
    if (target.closest('[data-speed-menu]')) return
    const k = e.key.toLowerCase()
    if (k === ' ' || k === 'k') {
      if (target.tagName === 'BUTTON' && k === ' ') return
      e.preventDefault()
      toggle()
    } else if (k === 'arrowleft') {
      e.preventDefault()
      seek(time - 5)
    } else if (k === 'arrowright') {
      e.preventDefault()
      seek(time + 5)
    } else if (k === 'j') seek(time - 10)
    else if (k === 'l') seek(time + 10)
    else if (k === 'm') toggleMute()
    else if (k === 'f') toggleFullscreen()
    else if (k === ',') seek(chapters[Math.max(0, current - 1)].t)
    else if (k === '.') seek(chapters[Math.min(chapters.length - 1, current + 1)].t)
    wake()
  }

  const pct = (time / duration) * 100
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <section aria-label="OFFENSAI explainer video" className={cn('w-full', className)}>
      <div
        ref={wrapRef}
        role="group"
        aria-roledescription="video player"
        aria-label="OFFENSAI 60 second explainer. Space to play or pause, arrow keys to seek, M to mute, F for fullscreen."
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseMove={wake}
        onMouseLeave={() => playing && setControlsVisible(false)}
        className={cn(
          'group/player relative isolate overflow-hidden rounded-2xl border border-border bg-black shadow-2xl shadow-black/40 outline-none focus-visible:ring-2 focus-visible:ring-primary',
          fullscreen && 'rounded-none border-0',
          playing && !controlsVisible && 'cursor-none',
        )}
      >
        <video
          ref={videoRef}
          src={SRC}
          poster={POSTER}
          playsInline
          preload="metadata"
          className={cn('block w-full bg-black', fullscreen ? 'h-screen object-contain' : 'aspect-video')}
          onClick={toggle}
          aria-label="OFFENSAI explainer video"
        />

        {!started && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Play the 60 second explainer"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/70 via-black/20 to-black/30 transition-colors hover:from-black/60"
          >
            <span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover/player:scale-105 md:size-24">
              <Play className="ml-1 size-8 fill-current md:size-10" aria-hidden />
            </span>
            <span className="rounded-full bg-black/70 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-white">
              Watch the 60 second explainer
            </span>
          </button>
        )}

        {ended && (
          <button
            type="button"
            onClick={() => playFrom(0)}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 text-white backdrop-blur-sm"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <RotateCcw className="size-7" aria-hidden />
            </span>
            <span className="text-sm font-semibold">Watch again</span>
          </button>
        )}

        <div
          className={cn(
            'z-20 px-3 text-white transition-opacity duration-300 md:px-5',
            fullscreen
              ? 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent pb-3 pt-14 md:pb-4'
              : 'relative border-t border-white/10 bg-[#05070d] pb-2 pt-3',
            fullscreen && started && !ended && !controlsVisible && !scrubbing && 'pointer-events-none opacity-0',
          )}
        >
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/70">
            <span className="truncate">
              {String(current + 1).padStart(2, '0')} / {chapters.length} &middot; <span className="text-white">{chapters[current].label}</span>
            </span>
          </div>

          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${fmt(time)} of ${fmt(duration)}, ${chapters[current].label}`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              setScrubbing(true)
              seek(timeFromPointer(e.clientX))
            }}
            onPointerMove={(e) => {
              const t = timeFromPointer(e.clientX)
              const r = trackRef.current!.getBoundingClientRect()
              setHover({ x: e.clientX - r.left, t })
              if (scrubbing) seek(t)
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId)
              setScrubbing(false)
            }}
            onPointerLeave={() => !scrubbing && setHover(null)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.stopPropagation()
                e.preventDefault()
                seek(time + (e.key === 'ArrowRight' ? 5 : -5))
              }
            }}
            className="group/track relative flex h-5 cursor-pointer touch-none items-center outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {hover && (
              <div
                className="pointer-events-none absolute bottom-6 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-black/90 px-2 py-1 font-mono text-[11px]"
                style={{ left: Math.min(Math.max(hover.x, 56), (trackRef.current?.clientWidth ?? 0) - 56) }}
              >
                {fmt(hover.t)} &middot; {chapters[chapterIndexAt(hover.t)].label}
              </div>
            )}
            <div className="relative h-1 w-full rounded-full bg-white/20 transition-[height] group-hover/track:h-1.5">
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: `${(buffered / duration) * 100}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${pct}%` }} />
              {chapters.slice(1).map((c) => (
                <span key={c.t} className="absolute inset-y-0 w-0.5 bg-black/70" style={{ left: `${(c.t / duration) * 100}%` }} aria-hidden />
              ))}
              <span
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform group-hover/track:scale-125"
                style={{ left: `${pct}%` }}
                aria-hidden
              />
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1 md:gap-2">
            <ControlButton onClick={toggle} label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause className="size-5 fill-current" aria-hidden /> : <Play className="size-5 fill-current" aria-hidden />}
            </ControlButton>

            <div className="group/vol flex items-center">
              <ControlButton onClick={toggleMute} label={muted ? 'Unmute' : 'Mute'}>
                <VolumeIcon className="size-5" aria-hidden />
              </ControlButton>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                aria-label="Volume"
                onChange={(e) => {
                  const v = videoRef.current
                  const next = Number(e.target.value)
                  setVolume(next)
                  setMuted(next === 0)
                  if (v) {
                    v.volume = next
                    v.muted = next === 0
                  }
                }}
                className="hidden h-1 w-0 cursor-pointer accent-primary opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 focus-visible:w-20 focus-visible:opacity-100 md:block"
              />
            </div>

            <span className="ml-1 font-mono text-xs tabular-nums text-white/80 md:text-sm">
              {fmt(time)} <span className="text-white/50">/ {fmt(duration)}</span>
            </span>

            <div className="ml-auto flex items-center gap-1 md:gap-2">
              <div className="relative" data-speed-menu>
                <button
                  type="button"
                  onClick={() => setSpeedOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={speedOpen}
                  aria-label={`Playback speed, ${speed}x`}
                  className="h-9 rounded-md px-2 font-mono text-xs transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {speed}x
                </button>
                {speedOpen && (
                  <div role="menu" className="absolute bottom-11 right-0 min-w-24 rounded-lg border border-white/15 bg-black/95 p-1 shadow-xl">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        role="menuitemradio"
                        aria-checked={speed === s}
                        type="button"
                        onClick={() => {
                          setSpeed(s)
                          if (videoRef.current) videoRef.current.playbackRate = s
                          setSpeedOpen(false)
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left font-mono text-xs hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
                      >
                        {s}x {speed === s && <Check className="size-3.5 text-primary" aria-hidden />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <a
                href={SRC}
                download
                aria-label="Download MP4"
                className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Download className="size-5" aria-hidden />
              </a>
              <ControlButton onClick={toggleFullscreen} label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {fullscreen ? <Minimize className="size-5" aria-hidden /> : <Maximize className="size-5" aria-hidden />}
              </ControlButton>
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Video chapters" className="mt-3">
        <ol className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {chapters.map((c, i) => {
            const active = i === current && started
            return (
              <li key={c.t} className="shrink-0">
                <button
                  type="button"
                  onClick={() => playFrom(c.t)}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    active
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground',
                  )}
                >
                  <span className="font-mono text-[10px] tabular-nums opacity-70">{fmt(c.t)}</span>
                  {c.label}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </section>
  )
}

function ControlButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </button>
  )
}
