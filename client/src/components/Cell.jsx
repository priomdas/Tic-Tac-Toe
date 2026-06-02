import { motion } from 'motion/react';

export default function Cell({ value, index, onClick, isWinning, isDisabled, isOldest }) {
  const renderMark = () => {
    if (!value) return null;

    if (value === 'X') {
      return (
        <motion.svg
          viewBox="0 0 100 100"
          className={`w-12 h-12 sm:w-16 sm:h-16 ${isOldest && !isWinning ? 'opacity-40 animate-pulse' : ''}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <motion.line
            x1="20" y1="20" x2="80" y2="80"
            stroke="#00f0ff"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              filter: 'drop-shadow(0 0 6px #00f0ff) drop-shadow(0 0 12px rgba(0,240,255,0.4))',
            }}
          />
          <motion.line
            x1="80" y1="20" x2="20" y2="80"
            stroke="#00f0ff"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{
              filter: 'drop-shadow(0 0 6px #00f0ff) drop-shadow(0 0 12px rgba(0,240,255,0.4))',
            }}
          />
        </motion.svg>
      );
    }

    return (
      <motion.svg
        viewBox="0 0 100 100"
        className={`w-12 h-12 sm:w-16 sm:h-16 ${isOldest && !isWinning ? 'opacity-40 animate-pulse' : ''}`}
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.circle
          cx="50" cy="50" r="32"
          fill="none"
          stroke="#ff00e4"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            filter: 'drop-shadow(0 0 6px #ff00e4) drop-shadow(0 0 12px rgba(255,0,228,0.4))',
          }}
        />
      </motion.svg>
    );
  };

  return (
    <motion.button
      id={`cell-${index}`}
      onClick={() => onClick(index)}
      disabled={isDisabled || !!value}
      className={`
        relative flex items-center justify-center
        w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32
        rounded-2xl cursor-pointer
        transition-all duration-300
        ${!value && !isDisabled
          ? 'hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.03]'
          : ''
        }
        ${isDisabled && !value ? 'opacity-50 cursor-not-allowed' : ''}
        ${isWinning ? (value === 'X' ? 'animate-neon-pulse-cyan' : 'animate-neon-pulse-magenta') : ''}
        ${isOldest && !isWinning ? 'border-dashed opacity-70' : ''}
      `}
      style={{
        background: isWinning
          ? value === 'X'
            ? 'rgba(0, 240, 255, 0.08)'
            : 'rgba(255, 0, 228, 0.08)'
          : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${
          isWinning
            ? value === 'X'
              ? 'rgba(0, 240, 255, 0.4)'
              : 'rgba(255, 0, 228, 0.4)'
            : 'rgba(255, 255, 255, 0.08)'
        }`,
      }}
      whileTap={!value && !isDisabled ? { scale: 0.95 } : {}}
    >
      {renderMark()}

      {/* Hover indicator */}
      {!value && !isDisabled && (
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white/10" />
        </div>
      )}
    </motion.button>
  );
}
