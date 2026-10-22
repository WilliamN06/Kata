interface GridCellHighlight {
  col: number;
  row: number;
  color: string;
}

interface GridChipProps {
  width: number;
  height: number;
  cols: number;
  rows: number;
  filled?: boolean;
  fillColor?: string;
  strokeColor?: string;
  highlightedCells?: GridCellHighlight[];
  showGridLines?: boolean;
}

/**
 * Renders a grid of cols x rows cells. Used for fractions (highlight N of M
 * cells), ratios (compare column widths), and positions (mark a point along a
 * line). Rendered as SVG so cell colours are deterministic and testable.
 */
export function GridChip({
  width,
  height,
  cols,
  rows,
  filled = false,
  fillColor = '#E0E0E0',
  strokeColor = '#333333',
  highlightedCells = [],
  showGridLines = true,
}: GridChipProps) {
  const safeCols = Math.max(1, Math.floor(cols));
  const safeRows = Math.max(1, Math.floor(rows));
  const cellW = width / safeCols;
  const cellH = height / safeRows;

  const highlightMap = new Map<string, string>();
  for (const h of highlightedCells) {
    highlightMap.set(`${h.col},${h.row}`, h.color);
  }

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < safeRows; r++) {
    for (let c = 0; c < safeCols; c++) {
      const highlighted = highlightMap.get(`${c},${r}`);
      const fill = highlighted ?? (filled ? fillColor : 'transparent');
      cells.push(
        <rect
          key={`${c}-${r}`}
          x={c * cellW}
          y={r * cellH}
          width={cellW}
          height={cellH}
          fill={fill}
          stroke={showGridLines ? strokeColor : 'none'}
          strokeWidth={showGridLines ? 1 : 0}
        />
      );
    }
  }

  return (
    <svg
      role="img"
      aria-label={`Grid chip: ${safeCols}×${safeRows}, ${highlightedCells.length} highlighted`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
    >
      {cells}
    </svg>
  );
}