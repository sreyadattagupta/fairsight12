"use client";
import { PieChart, Pie, Cell } from "recharts";

export default function FairnessGauge({ score }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const bgColor = score >= 80 ? "#D1FAE5" : score >= 60 ? "#FEF3C7" : "#FEE2E2";
  const label = score >= 80 ? "Fair" : score >= 60 ? "Moderate" : "Biased";

  const RADIAN = Math.PI / 180;
  const angle = 180 - (score / 100) * 180;
  const r = 58;
  const cx = 110;
  const cy = 105;
  const nx = cx + r * Math.cos(-RADIAN * angle);
  const ny = cy + r * Math.sin(-RADIAN * angle);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[220px] h-[120px]">
        <PieChart width={220} height={120}>
          {/* Background arc */}
          <Pie
            data={[{ value: 100 }]}
            cx={110} cy={105}
            startAngle={180} endAngle={0}
            innerRadius={46} outerRadius={80}
            dataKey="value" stroke="none"
          >
            <Cell fill={bgColor} />
          </Pie>
          {/* Filled progress arc */}
          <Pie
            data={[{ value: score }, { value: 100 - score }]}
            cx={110} cy={105}
            startAngle={180} endAngle={0}
            innerRadius={50} outerRadius={76}
            dataKey="value" stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="transparent" />
          </Pie>
          {/* Tick marks */}
          <Pie
            data={[{ value: 33 }, { value: 34 }, { value: 33 }]}
            cx={110} cy={105}
            startAngle={180} endAngle={0}
            innerRadius={78} outerRadius={82}
            dataKey="value" stroke="none"
          >
            <Cell fill="#FEE2E2" />
            <Cell fill="#FEF3C7" />
            <Cell fill="#D1FAE5" />
          </Pie>
        </PieChart>

        {/* SVG needle */}
        <svg
          className="absolute inset-0"
          width={220} height={120}
          style={{ pointerEvents: "none" }}
        >
          {/* Needle shadow */}
          <line x1={cx} y1={cy} x2={nx} y2={ny}
            stroke="rgba(0,0,0,0.1)" strokeWidth={5} strokeLinecap="round"
            transform="translate(1, 1)" />
          {/* Needle */}
          <line x1={cx} y1={cy} x2={nx} y2={ny}
            stroke="#1E293B" strokeWidth={3} strokeLinecap="round" />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r={7} fill="white" stroke="#1E293B" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={3.5} fill="#1E293B" />
          {/* Labels */}
          <text x={18} y={116} fontSize={9} fill="#EF4444" fontWeight={700}>Biased</text>
          <text x={91} y={40} fontSize={9} fill="#F59E0B" fontWeight={700}>Caution</text>
          <text x={172} y={116} fontSize={9} fill="#10B981" fontWeight={700}>Fair</text>
        </svg>
      </div>

      <div className="text-center mt-1">
        <div className="text-4xl font-black" style={{ color }}>{score}</div>
        <div className="text-xs text-slate-400 font-medium">/&nbsp;100</div>
        <div
          className="text-sm font-bold mt-1.5 px-3 py-1 rounded-full"
          style={{ color, background: bgColor }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
