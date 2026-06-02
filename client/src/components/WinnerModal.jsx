import { motion, AnimatePresence } from 'motion/react';
import { Handshake, Trophy, RefreshCw, LogOut } from './Icons';

export default function WinnerModal({ winner, players, onPlayAgain, onLeave }) {
  const winnerPlayer = players.find((p) => p.symbol === winner);
  const isDraw = winner === 'draw';

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
        >
          {/* Particle burst effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {!isDraw && Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  background: winner === 'X' ? '#00f0ff' : '#ff00e4',
                  boxShadow: `0 0 6px ${winner === 'X' ? '#00f0ff' : '#ff00e4'}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: Math.random() * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-strong p-8 sm:p-10 text-center relative z-10 max-w-md w-full"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              {isDraw ? <Handshake size={64} className="text-neon-amber" /> : <Trophy size={64} className={winner === 'X' ? 'text-neon-cyan' : 'text-neon-magenta'} />}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`font-display text-2xl sm:text-3xl font-bold mb-2 ${
                isDraw ? 'text-neon-amber' : winner === 'X' ? 'neon-x' : 'neon-o'
              }`}
            >
              {isDraw ? "It's a Draw!" : `${winnerPlayer?.name || winner} Wins!`}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-secondary text-sm mb-8"
            >
              {isDraw
                ? 'Great minds think alike! Try again?'
                : `Player ${winner} dominated this round!`}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <button onClick={onPlayAgain} className="btn-primary flex-1 flex items-center justify-center gap-2" id="play-again-btn">
                <RefreshCw size={16} /> Play Again
              </button>
              <button onClick={onLeave} className="btn-secondary flex-1 flex items-center justify-center gap-2" id="leave-room-btn">
                <LogOut size={16} /> Leave Room
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
