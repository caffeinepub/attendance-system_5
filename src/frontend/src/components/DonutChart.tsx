type Segment = {
  label: string;
  value: number;
  color: string;
};

interface DonutChartProps {
  segments: Segment[];
}

export default function DonutChart({ segments }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = 45;
  const cx = 60;
  const cy = 60;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <svg
          viewBox="0 0 120 120"
          width="140"
          height="140"
          role="img"
          aria-label="No attendance data"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="oklch(0.88 0.01 240)"
            strokeWidth={strokeWidth}
          />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            fill="oklch(0.52 0.02 255)"
          >
            0
          </text>
        </svg>
        <p className="text-xs text-muted-foreground">No data</p>
      </div>
    );
  }

  let offset = 0;
  const slices = segments.map((seg) => {
    const fraction = seg.value / total;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const startOffset = circumference - offset;
    offset += dash;
    return { ...seg, dash, gap, startOffset };
  });

  const labelText = segments.map((s) => `${s.label}: ${s.value}`).join(", ");

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 120 120"
        width="140"
        height="140"
        role="img"
        aria-label={`Attendance distribution: ${labelText}`}
      >
        {slices.map((seg) => (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={seg.startOffset}
            strokeLinecap="round"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "60px 60px",
            }}
          />
        ))}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="bold"
          fill="currentColor"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fill="oklch(0.52 0.02 255)"
        >
          total
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-semibold text-foreground">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
