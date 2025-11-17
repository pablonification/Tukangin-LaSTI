'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BaseCanvas } from '../../components/BaseCanvas';

type Phase = 'idle' | 'assistant-question' | 'user-answer' | 'assistant-final' | 'done';

// Map analyser level (0..1) to scale factors
const mapLevelToScale = (level: number, base = 1, range = 0.22) => {
  const clamped = Math.max(0, Math.min(1, level));
  return base + clamped * range; // e.g. 1.00 -> 1.22
};

const useAudioAnalyser = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const connect = useCallback(async (el: HTMLAudioElement) => {
    if (!audioContextRef.current) {
      const Ctor = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || AudioContext;
      audioContextRef.current = new Ctor();
    }
    const ctx = audioContextRef.current;
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.85;
    }

    // Disconnect previous source
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch { /* ignore */ }
      sourceRef.current = null;
    }

    const source = ctx.createMediaElementSource(el);
    source.connect(analyserRef.current);
    analyserRef.current.connect(ctx.destination);
    sourceRef.current = source;
    try { await ctx.resume(); } catch { /* ignore */ }
  }, []);

  const getLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return 0;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    // Compute RMS of the waveform around 128
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i += 1) {
      const centered = (dataArray[i] - 128) / 128; // -1..1
      sumSquares += centered * centered;
    }
    const rms = Math.sqrt(sumSquares / bufferLength); // 0..~1
    // Gentle amplification and clamp
    return Math.max(0, Math.min(1, rms * 2));
  }, []);

  const cleanup = useCallback(() => {
    try { sourceRef.current?.disconnect(); } catch { /* ignore */ }
    try { analyserRef.current?.disconnect(); } catch { /* ignore */ }
    sourceRef.current = null;
    analyserRef.current = null;
  }, []);

  return { connect, getLevel, cleanup } as const;
};

const TanyaSuaraPage = () => {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [micOn, setMicOn] = useState(false);
  const [level, setLevel] = useState(0);

  const { connect, getLevel, cleanup } = useAudioAnalyser();
  const rafRef = useRef<number | null>(null);

  const questionAudio = useRef<HTMLAudioElement | null>(null);
  const answerAudio = useRef<HTMLAudioElement | null>(null);
  const finalAudio = useRef<HTMLAudioElement | null>(null);

  // Derived UI states
  const circleScale = useMemo(() => mapLevelToScale(level, 1, 0.18), [level]);
  const ringScale = useMemo(() => mapLevelToScale(level, 1.0, 0.45), [level]);
  const ringOpacity = useMemo(() => Math.min(0.9, 0.35 + level * 0.65), [level]);

  // Refs for dynamic gradient
  const sphereRef = useRef<HTMLDivElement | null>(null);

  // Animation loop for gradient motion and audio reactivity
  useEffect(() => {
    let isCancelled = false;
    const start = performance.now();
    const step = () => {
      if (isCancelled) return;
      const now = performance.now();
      const t = (now - start) / 1000; // seconds
      // Read current audio level (0..1). 0 if analyser not connected
      const currentLevel = getLevel();
      setLevel(currentLevel);

      // Animate gradient origin over time with audio-reactive amplitude
      const baseAmp = 0.08; // base movement
      const audioAmp = currentLevel * 0.10; // extra from audio
      const amp = baseAmp + audioAmp; // 0.08..0.18
      const cx = 50 + Math.sin(t * 0.7) * amp * 100; // percent
      const cy = 45 + Math.cos(t * 0.55) * amp * 100; // percent
      if (sphereRef.current) {
        sphereRef.current.style.setProperty('--gx', `${cx.toFixed(2)}%`);
        sphereRef.current.style.setProperty('--gy', `${cy.toFixed(2)}%`);
      }

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      isCancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [getLevel]);

  const playWithAnalyser = useCallback(async (el: HTMLAudioElement, nextPhase: Phase, mic: boolean) => {
    await connect(el);
    setMicOn(mic);
    await el.play();
    await new Promise<void>((resolve) => {
      const onEnded = () => {
        el.removeEventListener('ended', onEnded);
        resolve();
      };
      el.addEventListener('ended', onEnded);
    });
    cleanup();
    setMicOn(false);
    setPhase(nextPhase);
  }, [cleanup, connect]);

  // Kick off the scripted conversation once on mount
  useEffect(() => {
    questionAudio.current = new Audio('/demo-question.mp3');
    answerAudio.current = new Audio('/demo-answer.mp3');
    finalAudio.current = new Audio('/demo-final.mp3');

    let isCancelled = false;
    const run = async () => {
      try {
        setPhase('assistant-question');
        if (!questionAudio.current || !answerAudio.current || !finalAudio.current) return;
        await playWithAnalyser(questionAudio.current, 'user-answer', false);
        if (isCancelled) return;
        await playWithAnalyser(answerAudio.current, 'assistant-final', true);
        if (isCancelled) return;
        await playWithAnalyser(finalAudio.current, 'done', false);
        if (isCancelled) return;
        setTimeout(() => router.push('/tanya/loading'), 1000);
      } catch {
        // Fail silently; keep the UI responsive
      }
    };
    run();

    return () => {
      isCancelled = true;
      cleanup();
      questionAudio.current?.pause();
      answerAudio.current?.pause();
      finalAudio.current?.pause();
    };
  }, [cleanup, playWithAnalyser, router]);

  // Manual mic toggle (visual only). Does not affect scripted sequence.
  const toggleMic = useCallback(() => {
    setMicOn((prev) => !prev);
  }, []);

  const micLabel = micOn ? 'Microphone ON' : 'Microphone OFF';

  // Get phase display text
  const getPhaseText = () => {
    switch (phase) {
      case 'assistant-question':
        return 'Mendengarkan pertanyaan...';
      case 'user-answer':
        return 'Silakan jawab pertanyaan';
      case 'assistant-final':
        return 'Memproses jawaban Anda...';
      case 'done':
        return 'Selesai! Mengalihkan...';
      default:
        return 'Siap untuk mulai';
    }
  };

  return (
    <BaseCanvas centerContent={false} padding="px-0">
      <div className='w-full min-h-screen flex flex-col bg-[#141414] text-white'>
        <div className='flex-1 flex flex-col items-center justify-center px-8 pt-6'>
          {/* Dynamic gradient sphere */}
          <div className='relative w-full flex items-center justify-center'>
            <div
              ref={sphereRef}
              className='relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full shadow-[0_0_80px_0_rgba(0,0,0,0.25)]'
              style={{
                transform: `scale(${circleScale})`,
                transition: 'transform 120ms ease-out',
                // Dynamic gradient origin controlled via CSS vars --gx/--gy (set in RAF loop)
                background:
                  'radial-gradient(120% 120% at var(--gx, 35%) var(--gy, 35%), #76DCEA 0%, #0082C9 55%, #FFEF89 100%)',
                filter: 'saturate(112%) contrast(106%)',
              }}
              aria-hidden
            />
          </div>

          {/* Phase status */}
          <p className='mt-4 text-center text-b2 text-white/70'>
            {getPhaseText()}
          </p>

          {/* Instruction text */}
          <p className='mt-4 text-center text-sh3 text-white/90 leading-snug px-2'>
            Deskripsikan masalah secara spesifik. Usahakan untuk menyebutkan benda,
            masalah, dan lokasi
          </p>
        </div>

        {/* Bottom controls */}
        <div className='sticky bottom-0 w-full'>
          <div className='flex flex-col items-center gap-4 pb-8'>
            {/* Mic status pill */}
            <div className='px-4 py-1 rounded-full bg-white/10 text-b2 text-white'>
              {micLabel}
            </div>

            <div className='flex items-center justify-center gap-5'>
              {/* Mic button with dynamic white overlay ring when speaking */}
              <div className='relative h-16 w-16'>
                {/* Dynamic white ring (only when mic is ON) */}
                {micOn && (
                  <div
                    className='absolute inset-[-6px] rounded-full pointer-events-none'
                    style={{
                      background: '#FAFAFA',
                      transform: `scale(${ringScale})`,
                      opacity: ringOpacity,
                      transition: 'transform 120ms ease-out, opacity 160ms ease-out, background 160ms ease',
                    }}
                    aria-hidden
                  />
                )}
                <button
                  onClick={toggleMic}
                  className={`relative h-full w-full rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-[#FAFAFA]' : 'bg-[#2D2D2D] hover:bg-[#3A3A3A]'}`}
                  aria-label={micOn ? 'Matikan mikrofon' : 'Nyalakan mikrofon'}
                >
                  <Image
                    src={micOn ? '/mic-white.svg' : '/mic-white2.svg'}
                    alt={micOn ? 'Microphone active' : 'Microphone muted'}
                    width={24}
                    height={24}
                    className='h-6 w-6'
                  />
                </button>
              </div>

              {/* Cancel button */}
              <Link
                href='/home'
                className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-[#EF4547] hover:bg-[#3A3A3A]' : 'bg-[#EB5757]'}`}
                aria-label='Batalkan dan kembali'
              >
                <Image
                  src='/close-white.svg'
                  alt='Batal'
                  width={24}
                  height={24}
                  className='h-6 w-6'
                />
              </Link>
            </div>

            {/* Home indicator spacer */}
            <div className='h-2' />
          </div>
        </div>
      </div>
    </BaseCanvas>
  );
};

export default TanyaSuaraPage;
