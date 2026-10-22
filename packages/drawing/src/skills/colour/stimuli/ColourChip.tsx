interface ColourChipProps {
  hue: number;
  chroma: number;
  lStar: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
}

/**
 * Render a colour chip with the specified hue, chroma, and CIE L* value.
 *
 * The chip uses the same rendering pipeline as the Colour drills:
 * HSL with lightness adjusted to match the target L*.
 */
export function ColourChip({
  hue,
  chroma,
  lStar,
  size = 160,
  label,
  showLabel = true,
}: ColourChipProps) {
  // Convert CIE L* to HSL lightness approximately
  // HSL_L = L*/100 * (1 - chroma/400) * 100
  const hslL = Math.max(0, Math.min(100, (lStar / 100) * (1 - chroma / 400) * 100));

  const hslH = ((hue % 360) + 360) % 360;
  const hslS = Math.max(0, Math.min(100, chroma));

  const css = `hsl(${hslH}, ${hslS}%, ${hslL}%)`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{
          width: size,
          height: size,
          background: css,
          borderRadius: 8,
          border: '1px solid #404040',
        }}
        role="img"
        aria-label={label || `Colour H=${hue} C=${chroma} L=${lStar}`}
      />
      {showLabel && label && (
        <div className="text-xs text-neutral-500 font-mono">{label}</div>
      )}
    </div>
  );
}
