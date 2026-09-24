import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ osc?: OscillatorNode; gain?: GainNode; filter?: BiquadFilterNode } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Normalize waveform bars to 28 bars
  const bars = React.useMemo(() => {
    const raw = waveform && waveform.length > 0 ? waveform : DEFAULT_WAVEFORM;
    const targetCount = 30;
    const result: number[] = [];
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.floor((i / targetCount) * raw.length);
      const val = raw[idx] ?? 40;
      // Clamp between 15% and 100% height
      result.push(Math.max(15, Math.min(100, val)));
    }
    return result;
  }, [waveform]);

  const totalDuration = Math.max(1, duration || 4);

  // Web Audio Synthetic Voice Generator fallback
  const startSyntheticAudio = (fromOffset: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Vocal formant filter simulation
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      // Pitch variation like human speech
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(175, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.7);
      osc.frequency.linearRampToValueAtTime(190, ctx.currentTime + 1.2);

      // Volume envelope
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      synthNodesRef.current = { osc, gain, filter };
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
            synthNodesRef.current?.osc?.stop();
            synthNodesRef.current?.osc?.disconnect();
          } catch {}
          synthNodesRef.current = null;
        }, 60);
      } catch {
        synthNodesRef.current = null;
      }
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      pausedTimeRef.current = playbackTime;
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        stopSyntheticAudio();
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      // Play
      setIsPlaying(true);
      setHasPlayed(true);

      const offset = playbackTime >= totalDuration ? 0 : playbackTime;
      setPlaybackTime(offset);
      pausedTimeRef.current = offset;
      startTimeRef.current = performance.now() - (offset / playbackRate) * 1000;

      if (audioUrl && audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.currentTime = offset;
        audioRef.current.play().catch(() => {
          // If browser audio blocked or url broken, use synth
          startSyntheticAudio(offset);
        });
      } else {
        startSyntheticAudio(offset);
      }

      // Smooth Animation loop for progress
      const tick = (now: number) => {
        const elapsedSec = ((now - startTimeRef.current) / 1000) * playbackRate;
        if (elapsedSec >= totalDuration) {
          setIsPlaying(false);
          setPlaybackTime(0);
          pausedTimeRef.current = 0;
          if (audioRef.current) audioRef.current.pause();
          stopSyntheticAudio();
        } else {
          setPlaybackTime(elapsedSec);
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
      audioRef.current.currentTime = newTime;
    }
    if (isPlaying) {
      startTimeRef.current = performance.now() - (newTime / playbackRate) * 1000;
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
      {/* Hidden real HTML5 audio tag if audioUrl provided */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onEnded={() => {
            setIsPlaying(false);
            setPlaybackTime(0);
            pausedTimeRef.current = 0;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
