import { motion } from 'framer-motion';

export default function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size,
        height: size,
        border: `2px solid transparent`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        display: 'inline-block',
      }}
    />
  );
}