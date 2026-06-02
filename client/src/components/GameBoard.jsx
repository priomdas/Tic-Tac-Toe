import { motion } from 'motion/react';
import Cell from './Cell';

export default function GameBoard({ board, winningLine, isMyTurn, gameStatus, gameMode, moveHistory, onMakeMove }) {
  const isDisabled = !isMyTurn || gameStatus !== 'playing';

  // Find oldest moves for both players in loop mode
  let oldestXIndex = -1;
  let oldestOIndex = -1;

  if (gameMode === 'loop' && Array.isArray(moveHistory)) {
    const xMoves = moveHistory.filter(m => m.symbol === 'X');
    const oMoves = moveHistory.filter(m => m.symbol === 'O');
    if (xMoves.length === 3) oldestXIndex = xMoves[0].index;
    if (oMoves.length === 3) oldestOIndex = oMoves[0].index;
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
      className="relative"
    >
      {/* Board Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 glass-strong">
        {board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            index={index}
            onClick={onMakeMove}
            isWinning={winningLine?.includes(index)}
            isDisabled={isDisabled}
            isOldest={index === oldestXIndex || index === oldestOIndex}
          />
        ))}
      </div>

      {/* Turn Indicator Glow Border */}
      {gameStatus === 'playing' && (
        <motion.div
          className="absolute -inset-[2px] rounded-[22px] -z-10"
          animate={{
            boxShadow: isMyTurn
              ? [
                  '0 0 20px rgba(0, 240, 255, 0.1)',
                  '0 0 40px rgba(0, 240, 255, 0.2)',
                  '0 0 20px rgba(0, 240, 255, 0.1)',
                ]
              : '0 0 0px transparent',
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}
