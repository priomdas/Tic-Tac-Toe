import { motion } from 'motion/react';

export default function Scoreboard({ players, scores, currentTurn, playerSymbol }) {
  const playerX = players.find((p) => p.symbol === 'X');
  const playerO = players.find((p) => p.symbol === 'O');

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-lg mx-auto"
    >
      {/* Player X */}
      <div
        className={`flex-1 glass rounded-xl p-3 sm:p-4 text-center transition-all duration-500 ${
          currentTurn === 'X' ? 'glow-cyan' : ''
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="neon-x font-display text-sm font-bold">X</span>
          <span className="text-xs sm:text-sm text-text-secondary truncate max-w-[80px]">
            {playerX?.name || 'Waiting...'}
          </span>
        </div>
        <motion.div
          className="neon-x font-display text-2xl sm:text-3xl font-bold"
          key={scores.X}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {scores.X}
        </motion.div>
        {playerSymbol === 'X' && (
          <span className="text-[10px] text-neon-cyan/60 uppercase tracking-widest">You</span>
        )}
      </div>

      {/* Draws */}
      <div className="glass rounded-xl p-3 sm:p-4 text-center min-w-[60px]">
        <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Draw</div>
        <motion.div
          className="text-text-secondary font-display text-2xl sm:text-3xl font-bold"
          key={scores.draws}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {scores.draws}
        </motion.div>
      </div>

      {/* Player O */}
      <div
        className={`flex-1 glass rounded-xl p-3 sm:p-4 text-center transition-all duration-500 ${
          currentTurn === 'O' ? 'glow-magenta' : ''
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="neon-o font-display text-sm font-bold">O</span>
          <span className="text-xs sm:text-sm text-text-secondary truncate max-w-[80px]">
            {playerO?.name || 'Waiting...'}
          </span>
        </div>
        <motion.div
          className="neon-o font-display text-2xl sm:text-3xl font-bold"
          key={scores.O}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {scores.O}
        </motion.div>
        {playerSymbol === 'O' && (
          <span className="text-[10px] text-neon-magenta/60 uppercase tracking-widest">You</span>
        )}
      </div>
    </motion.div>
  );
}
