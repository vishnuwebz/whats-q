import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, Volume2 } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  duration?: number;
  waveform?: number[];
  isOutgoing?: boolean;
  senderAvatar?: string;
  senderName?: string;
}

// Generate realistic voice note waveform amplitudes if none provided
const DEFAULT_WAVEFORM = [
  25, 40, 65, 30, 50, 85, 95, 70, 45, 60, 
  80, 100, 75, 40, 30, 55, 80, 90, 65, 45, 
  35, 60, 85, 70, 50, 35, 60, 80, 45, 25
];

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  duration = 4,
  waveform = DEFAULT_WAVEFORM,
  isOutgoing = true,
  senderAvatar,
  senderName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [actualDuration, setActualDuration] = useState<number | null>(null);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const webAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const synthNodesRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode; filter?: BiquadFilterNode } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Normalize audio URL for browser playback (absolute path / origin)
  const resolvedAudioUrl = React.useMemo(() => {
    if (!audioUrl) return undefined;
    const trimmed = String(audioUrl).trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (typeof window !== 'undefined' && trimmed.startsWith('/')) {
      return `${window.location.origin}${trimmed}`;
    }
    return trimmed;
  }, [audioUrl]);

  // Normalize waveform bars to 30 bars
  const bars = React.useMemo(() => {
    const raw = waveform && waveform.length > 0 ? waveform : DEFAULT_WAVEFORM;
    const targetCount = 30;
    const result: number[] = [];
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.floor((i / targetCount) * raw.length);
      const val = raw[idx] ?? 40;
      result.push(Math.max(15, Math.min(100, val)));
    }
    return result;
  }, [waveform]);

  const totalDuration = Math.max(1, actualDuration || duration || 4);

  // Stop Web Audio playback if active
  const stopWebAudio = () => {
    if (webAudioSourceRef.current) {
      try {
        webAudioSourceRef.current.stop();
        webAudioSourceRef.current.disconnect();
      } catch {}
      webAudioSourceRef.current = null;
    }
  };

  // High-fidelity Web Audio API decoder fallback (plays decoded audio buffer directly through speakers)
  const playViaWebAudio = async (url: string, offsetSec: number): Promise<boolean> => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const res = await fetch(url);
      if (!res.ok) return false;
      const arrayBuffer = await res.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

      stopWebAudio();

      const source = ctx.createBufferSource();
      source.buffer = decodedBuffer;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 1.0;

      source.connect(gain);
      gain.connect(ctx.destination);

      const dur = Math.round(decodedBuffer.duration);
      if (dur > 0) setActualDuration(dur);

      source.start(0, Math.min(offsetSec, decodedBuffer.duration));
      webAudioSourceRef.current = source;

      source.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
        pausedTimeRef.current = 0;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      return true;
    } catch (e) {
      console.warn('[VoiceNotePlayer] WebAudio direct decode error, falling back:', e);
      return false;
    }
  };

  // Audible synthetic voice melody fallback when no audio file is available
  const startSyntheticAudio = (fromOffset: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopSyntheticAudio();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Vocal formant frequencies (speech-like harmonics)
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(260, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.4);
      osc1.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.9);
      osc1.frequency.linearRampToValueAtTime(290, ctx.currentTime + 1.6);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(520, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(640, ctx.currentTime + 0.4);
      osc2.frequency.linearRampToValueAtTime(480, ctx.currentTime + 0.9);
      osc2.frequency.linearRampToValueAtTime(580, ctx.currentTime + 1.6);

      // Comfortable, clearly audible listening level
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      synthNodesRef.current = { osc1, osc2, gain, filter };
    } catch {
      // AudioContext unavailable
    }
  };

  const stopSyntheticAudio = () => {
    if (synthNodesRef.current?.gain && audioCtxRef.current) {
      try {
        synthNodesRef.current.gain.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.05);
        setTimeout(() => {
          try {
            synthNodesRef.current?.osc1?.stop();
            synthNodesRef.current?.osc2?.stop();
            synthNodesRef.current?.osc1?.disconnect();
            synthNodesRef.current?.osc2?.disconnect();
          } catch {}
          synthNodesRef.current = null;
        }, 60);
      } catch {
        synthNodesRef.current = null;
      }
    }
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      pausedTimeRef.current = playbackTime;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopWebAudio();
      stopSyntheticAudio();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      // Play
      setIsPlaying(true);
      setHasPlayed(true);

      const offset = playbackTime >= totalDuration ? 0 : playbackTime;
      setPlaybackTime(offset);
      pausedTimeRef.current = offset;
      startTimeRef.current = performance.now() - (offset / playbackRate) * 1000;

      let playedViaNative = false;

      if (resolvedAudioUrl && audioRef.current && !audioError) {
        try {
          audioRef.current.volume = 1.0;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.currentTime = offset;
          await audioRef.current.play();
          playedViaNative = true;
        } catch {
          // Native HTML5 audio failed (e.g. codecs/CORS), attempt Web Audio API decoder
          const webAudioSuccess = await playViaWebAudio(resolvedAudioUrl, offset);
          if (!webAudioSuccess) {
            startSyntheticAudio(offset);
          }
        }
      } else if (resolvedAudioUrl) {
        const webAudioSuccess = await playViaWebAudio(resolvedAudioUrl, offset);
        if (!webAudioSuccess) {
          startSyntheticAudio(offset);
        }
      } else {
        startSyntheticAudio(offset);
      }

      // Smooth Animation loop for progress bar
      const tick = (now: number) => {
        let currentPos = 0;
        if (audioRef.current && playedViaNative && !audioRef.current.paused) {
          currentPos = audioRef.current.currentTime;
        } else {
          currentPos = ((now - startTimeRef.current) / 1000) * playbackRate;
        }

        if (currentPos >= totalDuration) {
          setIsPlaying(false);
          setPlaybackTime(0);
          pausedTimeRef.current = 0;
          if (audioRef.current) audioRef.current.pause();
          stopWebAudio();
          stopSyntheticAudio();
        } else {
          setPlaybackTime(currentPos);
          animFrameRef.current = requestAnimationFrame(tick);
        }
      };
      animFrameRef.current = requestAnimationFrame(tick);
    }
  };

  const handleSpeedToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
    if (webAudioSourceRef.current) {
      try { webAudioSourceRef.current.playbackRate.value = nextRate; } catch {}
    }
    if (isPlaying) {
      startTimeRef.current = performance.now() - (playbackTime / nextRate) * 1000;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = fraction * totalDuration;

    setPlaybackTime(newTime);
    pausedTimeRef.current = newTime;

    if (audioRef.current) {
      try {
        audioRef.current.currentTime = newTime;
      } catch {}
    }
    if (webAudioSourceRef.current && isPlaying && resolvedAudioUrl) {
      playViaWebAudio(resolvedAudioUrl, newTime);
    }
    if (isPlaying) {
      startTimeRef.current = performance.now() - (newTime / playbackRate) * 1000;
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopWebAudio();
      stopSyntheticAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressFraction = Math.max(0, Math.min(1, playbackTime / totalDuration));
  const activeBarIndex = Math.floor(progressFraction * bars.length);

  return (
    <div className="w-full max-w-[320px] select-none py-1">
      {/* HTML5 audio tag for direct hardware playback with range seeking */}
      {resolvedAudioUrl && (
        <audio
          ref={audioRef}
          src={resolvedAudioUrl}
          preload="auto"
          crossOrigin="anonymous"
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (d && !isNaN(d) && isFinite(d) && d > 0) {
              setActualDuration(Math.round(d));
            }
          }}
          onTimeUpdate={(e) => {
            if (isPlaying) {
              setPlaybackTime(e.currentTarget.currentTime);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            if (isPlaying && audioRef.current?.paused) {
              setIsPlaying(false);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setPlaybackTime(0);
            pausedTimeRef.current = 0;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          }}
          onError={() => {
            setAudioError(true);
          }}
        />
      )}

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer ${
            isOutgoing
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
          title={isPlaying ? 'Pause voice message' : 'Play voice message'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Center: Waveform + Time display */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {/* Waveform Bars Container */}
          <div
            onClick={handleSeek}
            className="flex items-center gap-[2.5px] h-7 cursor-pointer py-1 group"
            title="Click or drag to seek"
          >
            {bars.map((heightPct, idx) => {
              const isPassed = idx <= activeBarIndex;
              return (
                <div
                  key={idx}
                  className="flex-1 flex items-center justify-center h-full min-w-[2px]"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[3px] rounded-full transition-colors duration-75 ${
                      isOutgoing
                        ? isPassed
                          ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.4)]'
                          : 'bg-emerald-200/50 group-hover:bg-emerald-200/70'
                        : isPassed
                        ? 'bg-emerald-600'
                        : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Time & Speed Controls */}
          <div className="flex items-center justify-between text-[11px] font-mono leading-none mt-0.5">
            <span className={isOutgoing ? 'text-emerald-100 font-medium' : 'text-slate-500 font-medium'}>
              {isPlaying || playbackTime > 0 ? formatTime(playbackTime) : formatTime(totalDuration)}
            </span>

            <div className="flex items-center gap-1.5">
              {/* WhatsApp 1x/1.5x/2x Speed button */}
              <button
                type="button"
                onClick={handleSpeedToggle}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  isOutgoing
                    ? 'bg-black/20 hover:bg-black/30 text-emerald-50 active:scale-95'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                }`}
                title="Change playback speed"
              >
                {playbackRate}x
              </button>
            </div>
          </div>
        </div>

        {/* Sender Avatar with WhatsApp Heard Mic Indicator */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-white/40 shadow-sm flex items-center justify-center">
            {senderAvatar ? (
              <img
                src={senderAvatar}
                alt={senderName || 'Voice note'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center font-bold text-xs ${
                isOutgoing ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                {senderName ? senderName.slice(0, 2).toUpperCase() : <Mic className="w-5 h-5" />}
              </div>
            )}
          </div>
          {/* Micro status badge (turns cyan/blue when played, like WhatsApp) */}
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white ${
              hasPlayed ? 'bg-[#53bdeb] text-white' : isOutgoing ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
            }`}
            title={hasPlayed ? 'Played (Listened)' : 'Unplayed'}
          >
            <Mic className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
