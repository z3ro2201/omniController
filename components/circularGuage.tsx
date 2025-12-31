type CircularGaugeProps = {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: number;
  color?: string;
};

export default function CircularGauge({ value, min = 20, max = 24, size = 140, color = "#3b82f6", label = "작동 중" }: CircularGaugeProps) {
  const BASE_SIZE = 140;
  const radius = 60;
  const center = BASE_SIZE / 2;

  const circumference = 2 * Math.PI * radius;

  // ✅ 핵심 로직
  const rawProgress = (value - min) / (max - min);
  const progress = Math.min(Math.max(rawProgress, 0), 1);

  const offset = circumference * (1 - progress);

  return (
    <div
      className="select-none"
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${BASE_SIZE} ${BASE_SIZE}`}>
        {/* 배경 */}
        <circle cx={center} cy={center} r={radius} stroke="#e5e7eb" strokeWidth="10" fill="none" />

        {/* 진행 */}
        <circle cx={center} cy={center} r={radius} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${center} ${center})`} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>

      {/* 중앙 텍스트 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: size * 0.23,
            color,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: size * 0.1,
            color: "#6b7280",
            marginTop: 4,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
