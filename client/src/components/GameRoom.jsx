import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GameBoard from './GameBoard';
import Scoreboard from './Scoreboard';
import ChatPanel from './ChatPanel';
import VoiceChat from './VoiceChat';
import WinnerModal from './WinnerModal';
import { ArrowLeft, Zap, Clock, AlertTriangle } from './Icons';

export default function GameRoom({
  game,
  chat,
  voice,
  onLeave,
}) {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showDisconnectBanner, setShowDisconnectBanner] = useState(false);

  const {
    board, currentTurn, scores, winner, winningLine,
    gameStatus, playerSymbol, players, roomCode,
    isMyTurn, opponentLeft, makeMove, playAgain, leaveRoom,
  } = game;

  const { messages, sendMessage, setChatOpen } = chat;
  const { isMuted, isConnected, connectionStatus, toggleMute, initiateCall } = voice;

  // Show disconnect banner
  useEffect(() => {
    if (opponentLeft) {
      setShowDisconnectBanner(true);
    }
  }, [opponentLeft]);

  // Sync chat open state
  useEffect(() => {
    setChatOpen(isChatOpen);
  }, [isChatOpen, setChatOpen]);

  // Auto-initiate voice call when game starts (player X calls)
  useEffect(() => {
    if (gameStatus === 'playing' && playerSymbol === 'X' && connectionStatus === 'idle') {
      // Small delay to let PeerJS connect
      const timer = setTimeout(() => {
        initiateCall();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, playerSymbol, connectionStatus, initiateCall]);

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleLeave = () => {
    leaveRoom();
    onLeave();
  };

  const myPlayer = players.find((p) => p.symbol === playerSymbol);
  const opponent = players.find((p) => p.symbol !== playerSymbol);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative z-10">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-0">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg flex items-center justify-between mb-6"
        >
          {/* Room Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeave}
              className="text-text-muted hover:text-text-primary transition-colors text-sm flex items-center gap-1.5"
              id="back-btn"
            >
              <ArrowLeft size={14} /> Leave
            </button>
            <div className="h-4 w-px bg-white/[0.08]" />
            <div className="text-xs text-text-muted">
              Room{' '}
              <span className="font-display text-neon-cyan/70 tracking-wider">{roomCode}</span>
            </div>
          </div>

          {/* Voice Controls */}
          <VoiceChat
            isMuted={isMuted}
            isConnected={isConnected}
            connectionStatus={connectionStatus}
            onToggleMute={toggleMute}
            onInitiateCall={initiateCall}
          />
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
                isMyTurn ? 'text-neon-green' : 'text-text-muted'
              }`}
            >
              {isMyTurn ? <><Zap size={16} /> Your turn!</> : <><Clock size={16} /> {opponent?.name || 'Opponent'}&apos;s turn...</>}
            </motion.div>
          )}

          {gameStatus === 'waiting' && !opponentLeft && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-sm text-text-muted flex items-center gap-2"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-neon-amber"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Waiting for opponent...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disconnect Banner */}
        <AnimatePresence>
          {showDisconnectBanner && opponentLeft && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden w-full max-w-lg"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center justify-between">
                <span className="flex items-center gap-2"><AlertTriangle size={16} /> Opponent disconnected</span>
                <button
                  onClick={() => setShowDisconnectBanner(false)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Dismiss
                </button>
              </div>
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

        {/* Playing As */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xs text-text-muted"
        >
          Playing as{' '}
          <span className={`font-display font-bold ${playerSymbol === 'X' ? 'neon-x' : 'neon-o'}`}>
            {playerSymbol}
          </span>
          {myPlayer && (
            <span className="ml-1">({myPlayer.name})</span>
          )}
        </motion.div>
      </div>

      {/* Chat Sidebar - always visible on desktop */}
      <div className="hidden lg:block">
        <div className="h-screen sticky top-0 p-4 pl-0">
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            playerSymbol={playerSymbol}
            isOpen={true}
            onToggle={handleToggleChat}
          />
        </div>
      </div>

      {/* Chat Panel - mobile */}
      <div className="lg:hidden">
        <ChatPanel
          messages={messages}
          onSendMessage={sendMessage}
          playerSymbol={playerSymbol}
          isOpen={isChatOpen}
          onToggle={handleToggleChat}
        />
      </div>

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
