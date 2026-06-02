import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Gamepad, Link2, Loader, ArrowRight, ArrowLeft, Check, Copy, Zap } from './Icons';

export default function LandingPage({ onCreateRoom, onJoinRoom, onPlayAI }) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [roomCode, setRoomCode] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');
    setIsLoading(true);
    const result = await onCreateRoom(playerName.trim());
    setIsLoading(false);
    if (result.success) {
      setRoomCode(result.roomCode);
      setMode('created');
    } else {
      setError(result.message || 'Failed to create room');
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');
    setIsLoading(true);
    const result = await onJoinRoom(joinCode.trim(), playerName.trim());
    setIsLoading(false);
    if (!result.success) {
      setError(result.message || 'Failed to join room');
    }
    // If success, parent component switches to game view
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="glass-strong p-8 sm:p-10 w-full max-w-md"
      >
        {/* Logo / Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            <span className="neon-x">TIC</span>
            <span className="text-text-muted mx-2">•</span>
            <span className="neon-o">TAC</span>
            <span className="text-text-muted mx-2">•</span>
            <span className="text-neon-green" style={{
              textShadow: '0 0 7px #00ff88, 0 0 20px #00ff88, 0 0 42px rgba(0,255,136,0.4)',
            }}>TOE</span>
          </h1>
          <p className="text-text-muted text-sm tracking-wider uppercase">
            Online Multiplayer Arena
          </p>
        </motion.div>

        {/* Name Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            className="input-glass"
            maxLength={20}
            id="player-name-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !mode) setMode('create');
            }}
          />
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {!mode && (
            <motion.div
              key="actions"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {/* Solo Mode */}
              <button
                onClick={onPlayAI}
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
                id="play-ai-btn"
              >
                <Cpu size={18} /> Play vs Computer
              </button>

              <div className="flex items-center gap-3 text-text-muted text-xs">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span>MULTIPLAYER</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              {/* Multiplayer Options */}
              <button
                onClick={() => {
                  setError('');
                  handleCreate();
                }}
                className="btn-secondary w-full text-center flex items-center justify-center gap-2"
                id="create-room-btn"
                disabled={isLoading}
              >
                {isLoading ? <><Loader size={16} /> Creating...</> : <><Gamepad size={18} /> Create Room</>}
              </button>

              <button
                onClick={() => {
                  setError('');
                  setMode('join');
                }}
                className="btn-secondary w-full text-center flex items-center justify-center gap-2"
                id="join-mode-btn"
              >
                <Link2 size={18} /> Join Room
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="space-y-3"
            >
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                Room Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code..."
                className="input-glass text-center font-display text-lg tracking-[0.3em]"
                maxLength={6}
                id="room-code-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoin();
                }}
              />
              <button
                onClick={handleJoin}
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
                disabled={isLoading}
                id="join-room-btn"
              >
                {isLoading ? <><Loader size={16} /> Joining...</> : <><ArrowRight size={18} /> Join Game</>}
              </button>
              <button
                onClick={() => {
                  setMode(null);
                  setError('');
                }}
                className="btn-secondary w-full text-center flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
            </motion.div>
          )}

          {mode === 'created' && (
            <motion.div
              key="created"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-center space-y-4"
            >
              <div className="text-text-secondary text-sm mb-2">
                Share this code with your opponent:
              </div>

              {/* Room Code Display */}
              <motion.button
                onClick={copyCode}
                className="w-full glass rounded-xl p-5 cursor-pointer group hover:bg-white/[0.08] transition-all"
                whileTap={{ scale: 0.98 }}
                id="copy-code-btn"
              >
                <div className="font-display text-3xl sm:text-4xl tracking-[0.4em] font-bold neon-x">
                  {roomCode}
                </div>
                <div className="text-xs text-text-muted mt-2 group-hover:text-text-secondary transition-colors flex items-center justify-center gap-1.5">
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Click to copy</>}
                </div>
              </motion.button>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
                <motion.div
                  className="w-2 h-2 rounded-full bg-neon-amber"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Waiting for opponent to join...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-[11px] text-text-muted/50"
        >
          Solo AI &bull; Multiplayer &bull; Voice chat &bull; Real-time
        </motion.div>
      </motion.div>
    </div>
  );
}
