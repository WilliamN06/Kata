import { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  analyser: AnalyserNode | null;
  width: number;
  height: number;
  lineColour?: string;
}

export function WaveformDisplay({
  analyser, width, height, lineColour = '#4A9EFF',
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    let raf = 0;
    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#1A1A1A';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = lineColour;
      ctx.lineWidth = 1.5;

      const sliceWidth = width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i];
        if (v === undefined) continue;
        const norm = v / 128;
        const y = (norm * height) / 2;
        const x = i * sliceWidth;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, width, height, lineColour]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
