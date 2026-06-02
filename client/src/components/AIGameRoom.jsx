import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GameBoard from './GameBoard';
import Scoreboard from './Scoreboard';
import WinnerModal from './WinnerModal';
import { useAIGame } from '../hooks/useAIGame';
import { Cpu, Smile, Brain, Zap, ArrowLeft, Clock } from './Icons';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', icon: Smile, desc: 'Casual play', color: 'text-neon-green' },
  { key: 'medium', label: 'Medium', icon: Brain, desc: 'A fair challenge', color: 'text-neon-amber' },
  { key: 'hard', label: 'Hard', icon: Cpu, desc: 'Unbeatable AI', color: 'text-red-400' },
];

export default function AIGameRoom({ onLeave }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [started, setStarted] = useState(false);

  const game = useAIGame(difficulty);
  const {
    board, currentTurn, scores, winner, winningLine,
    gameStatus, playerSymbol, players, isMyTurn,
    makeMove, playAgain, resetAll,
  } = game;

  const handleChangeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    resetAll();
  };

  const handleStart = () => {
    resetAll();
    setStarted(true);
  };

  const handleLeave = () => {
    resetAll();
    onLeave();
  };

  // ── Difficulty Selection Screen ──────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="glass-strong p-8 sm:p-10 w-full max-w-md"
        >
          {/* Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-neon-cyan">
                <Cpu size={28} />
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold text-text-primary mb-1">
              Play vs Computer
            </h2>
            <p className="text-text-muted text-sm">Choose your challenge level</p>
          </motion.div>

          {/* Difficulty Options */}
          <div className="space-y-3 mb-8">
            {DIFFICULTIES.map((d, i) => {
              const IconComponent = d.icon;
              return (
                <motion.button
                  key={d.key}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  onClick={() => setDifficulty(d.key)}
                  className={`w-full glass rounded-xl p-4 text-left transition-all duration-300 flex items-center gap-4 group ${
                    difficulty === d.key
                      ? 'border-white/20 bg-white/[0.08] scale-[1.02]'
                      : 'hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                  style={{
                    borderColor: difficulty === d.key ? 'rgba(255,255,255,0.2)' : undefined,
                  }}
                  id={`difficulty-${d.key}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    difficulty === d.key ? `${d.color} bg-white/[0.06]` : 'text-text-muted'
                  }`}>
                    <IconComponent size={22} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${difficulty === d.key ? d.color : 'text-text-primary'}`}>
                      {d.label}
                    </div>
                    <div className="text-xs text-text-muted">{d.desc}</div>
                  </div>
                  {difficulty === d.key && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-neon-cyan"
                      style={{ boxShadow: '0 0 8px rgba(0,240,255,0.5)' }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <button onClick={handleStart} className="btn-primary w-full text-center flex items-center justify-center gap-2" id="start-ai-game-btn">
              <Zap size={18} /> Start Game
            </button>
            <button onClick={onLeave} className="btn-secondary w-full text-center flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Game Screen ──────────────────────────────────────────────
  const currentDifficulty = DIFFICULTIES.find((d) => d.key === difficulty);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
      {/* Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg flex items-center justify-between mb-6"
      >
        <button
          onClick={handleLeave}
          className="text-text-muted hover:text-text-primary transition-colors text-sm flex items-center gap-1.5"
          id="ai-back-btn"
        >
          <ArrowLeft size={14} /> Leave
        </button>

        {/* Difficulty Switcher */}
        <div className="flex items-center gap-1.5">
          {DIFFICULTIES.map((d) => {
            const IconComponent = d.icon;
            return (
              <button
                key={d.key}
                onClick={() => handleChangeDifficulty(d.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  difficulty === d.key
                    ? `${d.color} bg-white/[0.08] border border-white/15`
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
                }`}
                title={d.label}
              >
                <IconComponent size={14} />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Scoreboard */}
      <div className="w-full max-w-lg mb-6">
        <Scoreboard
          players={players}
          scores={scores}
          currentTurn={currentTurn}
          playerSymbol={playerSymbol}
        />
      </div>

      {/* Turn Indicator */}
      <AnimatePresence mode="wait">
        {gameStatus === 'playing' && (
          <motion.div
            key={currentTurn}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className={`mb-4 text-sm font-medium flex items-center gap-2 ${
              isMyTurn ? 'text-neon-green' : 'text-neon-amber'
            }`}
          >
            {isMyTurn ? (
              <><Zap size={16} /> Your turn!</>
            ) : (
              <>
                <motion.span
                  className="inline-flex"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Clock size={16} />
                </motion.span>
                Computer is thinking...
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Board */}
      <GameBoard
        board={board}
        winningLine={winningLine}
        isMyTurn={isMyTurn}
        gameStatus={gameStatus}
        onMakeMove={makeMove}
      />

      {/* Playing info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xs text-text-muted flex items-center gap-1.5"
      >
        You are <span className="neon-x font-display font-bold">X</span>
        <span className="mx-1">&bull;</span>
        {currentDifficulty && (
          <span className="flex items-center gap-1">
            {(() => { const IC = currentDifficulty.icon; return <IC size={12} />; })()}
            {currentDifficulty.label} mode
          </span>
        )}
      </motion.div>

      {/* Winner Modal */}
      <WinnerModal
        winner={winner}
        players={players}
        onPlayAgain={playAgain}
        onLeave={handleLeave}
      />
    </div>
  );
}
