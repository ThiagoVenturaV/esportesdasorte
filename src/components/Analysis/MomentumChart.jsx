import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styles from './MomentumChart.module.css';

/**
 * MomentumChart — Recharts area chart showing match momentum over last 15 data points
 * @param {{ momentumHome: number[], momentumAway: number[], homeTeam: string, awayTeam: string }} props
 */
export default function MomentumChart({ momentumHome, momentumAway, homeTeam, awayTeam }) {
  const data = momentumHome.map((home, i) => ({
    min: i + 1,
    [homeTeam]: home,
    [awayTeam]: momentumAway[i],
  }));

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="gradHome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#023397" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#023397" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="gradAway" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#38E67D" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#38E67D" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="min"
            tick={{ fill: '#5A6080', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}m`}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#5A6080', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickCount={3}
          />
          <Tooltip
            contentStyle={{
              background: '#12121E',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              fontSize: 11,
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            labelFormatter={(v) => `Min ${v}`}
          />

          <Area
            type="monotone"
            dataKey={homeTeam}
            stroke="#023397"
            strokeWidth={2}
            fill="url(#gradHome)"
            dot={false}
            activeDot={{ r: 4, fill: '#023397' }}
          />
          <Area
            type="monotone"
            dataKey={awayTeam}
            stroke="#38E67D"
            strokeWidth={2}
            fill="url(#gradAway)"
            dot={false}
            activeDot={{ r: 4, fill: '#38E67D' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.homeLabel}>
          <span className={styles.dotHome} /> {homeTeam}
        </span>
        <span className={styles.awayLabel}>
          <span className={styles.dotAway} /> {awayTeam}
        </span>
      </div>
    </div>
  );
}
