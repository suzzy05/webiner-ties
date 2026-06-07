'use client'

type DataPoint = { date: string; count: number }

export function MiniBarChart({ data }: { data: DataPoint[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const chartH = 80
  const barW = Math.max(4, Math.min(20, Math.floor(560 / data.length) - 2))
  const gap = 2
  const totalW = data.length * (barW + gap)

  return (
    <div className="overflow-x-auto">
      <svg
        width="100%"
        height={chartH + 28}
        viewBox={`0 0 ${Math.max(totalW, 400)} ${chartH + 28}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Registration trend bar chart"
      >
        {data.map((d, i) => {
          const barH = Math.max(2, Math.round((d.count / maxCount) * chartH))
          const x = i * (barW + gap)
          const y = chartH - barH

          const showLabel = data.length <= 15 || i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 8) === 0
          const shortDate = d.date.slice(5) // MM-DD

          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={2}
                fill="rgba(228,213,160,0.7)"
              />
              {d.count > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize={9}
                  fill="rgba(240,240,244,0.5)"
                >
                  {d.count}
                </text>
              )}
              {showLabel && (
                <text
                  x={x + barW / 2}
                  y={chartH + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill="rgba(113,113,122,1)"
                >
                  {shortDate}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
