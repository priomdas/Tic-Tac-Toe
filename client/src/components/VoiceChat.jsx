import { motion } from 'motion/react';
import { Phone, Mic, MicOff } from './Icons';

export default function VoiceChat({ isMuted, isConnected, connectionStatus, remoteAudioRef, onToggleMute, onInitiateCall }) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-neon-green';
      case 'connecting': return 'bg-neon-amber animate-pulse';
      case 'failed': return 'bg-red-500';
      default: return 'bg-text-muted';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Voice Connected';
      case 'connecting': return 'Connecting...';
      case 'failed': return 'Connection Failed';
      default: return 'Voice Off';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-center gap-3"
    >
      <audio ref={remoteAudioRef} autoPlay playsInline />
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-[11px] text-text-muted uppercase tracking-wider hidden sm:inline">
          {getStatusText()}
        </span>
      </div>

      {/* Start Call Button (only if not connected) */}
      {connectionStatus === 'idle' && (
        <button
          onClick={onInitiateCall}
          className="glass rounded-xl px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.08] transition-all flex items-center gap-1.5"
          id="start-call-btn"
        >
          <Phone size={14} /> <span className="hidden sm:inline">Start Voice</span>
        </button>
      )}

      {/* Mute/Unmute Toggle */}
      {(connectionStatus === 'connected' || connectionStatus === 'connecting') && (
        <motion.button
          onClick={onToggleMute}
          whileTap={{ scale: 0.9 }}
          className={`
            relative w-10 h-10 rounded-full flex items-center justify-center text-lg
            transition-all duration-300
            ${!isMuted
              ? 'glow-green bg-neon-green/10 border border-neon-green/30'
              : 'glass border border-white/10 text-text-muted'
            }
          `}
          id="mic-toggle-btn"
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}

          {/* Mute strikethrough line */}
          {isMuted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-0.5 bg-red-500 rotate-45 rounded-full" />
            </div>
          )}

          {/* Active pulse ring */}
          {!isMuted && (
            <motion.div
              className="absolute -inset-1 rounded-full border border-neon-green/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
