import { motion } from 'framer-motion';

export default function ProgressRing({ completed, total, size = 54 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total === 0 ? 0 : completed / total;
  const offset = circumference * (1 - ratio);
  const percentage = Math.round(ratio * 100);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={5}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            filter: ratio === 1 ? 'drop-shadow(0 0 6px var(--accent))' : 'none',
            transition: 'filter 0.4s ease',
          }}
        />
      </svg>
      {/* Percentage text in center */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: total === 0 ? '0.55rem' : '0.7rem',
        fontWeight: 700,
        color: ratio === 1 ? 'var(--accent)' : 'var(--text-secondary)',
      }}>
        {total === 0 ? '—' : `${percentage}%`}
      </div>
    </div>
  );
}