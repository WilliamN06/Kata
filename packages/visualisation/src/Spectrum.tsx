import { useEffect, useRef } from 'react';

interface SpectrumProps {
  analyser: AnalyserNode | null;
  width: number;
  height: number;
  minHz?: number;
  maxHz?: number;
  minDb?: number;
  maxDb?: number;
  logFrequency?: boolean;
  lineColour?: string;
}

export function Spectrum({
  analyser, width, height,
  minHz = 20, maxHz = 20000, minDb = -100, maxDb = 0,
  logFrequency = true, lineColour = '#4A9EFF',
}: SpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = analyser.context.sampleRate;

    let raf = 0;
    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1;
      for (let db = minDb; db <= maxDb; db += 20) {
        const y = height - ((db - minDb) / (maxDb - minDb)) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = lineColour;
      ctx.lineWidth = 1.5;

      const hzToX = (hz: number) => {
        if (logFrequency) return (Math.log10(hz / minHz) / Math.log10(maxHz / minHz)) * width;
        return ((hz - minHz) / (maxHz - minHz)) * width;
      };

      const binHz = sampleRate / (bufferLength * 2);
      let first = true;

      for (let i = 0; i < bufferLength; i++) {
        const hz = i * binHz;
        if (hz < minHz || hz > maxHz) continue;
        const v = dataArray[i];
        if (v === undefined) continue;
        const x = hzToX(hz);
        const db = (v / 255) * (maxDb - minDb) + minDb;
        const y = height - ((db - minDb) / (maxDb - minDb)) * height;
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, width, height, minHz, maxHz, minDb, maxDb, logFrequency, lineColour]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
