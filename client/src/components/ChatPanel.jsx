import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, MessageSquare, Send, X } from './Icons';

export default function ChatPanel({ messages, onSendMessage, playerSymbol, isOpen, onToggle }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    inputRef.current?.focus();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full glass flex items-center justify-center text-neon-cyan hover:scale-110 transition-transform shadow-lg"
        id="chat-toggle-btn"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 lg:relative lg:w-80 xl:w-96 z-30 flex flex-col glass-strong lg:rounded-2xl lg:my-0"
            style={{ borderRadius: '0 0 0 0' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
              <h3 className="font-display text-sm font-semibold tracking-wider text-text-primary flex items-center gap-2">
                <MessageSquare size={16} /> CHAT
              </h3>
              <button
                onClick={onToggle}
                className="lg:hidden text-text-muted hover:text-text-primary transition-colors flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="text-center text-text-muted text-sm py-8">
                  <div className="flex justify-center mb-2 text-text-muted/50">
                    <MessageSquare size={32} />
                  </div>
                  No messages yet. Say hi!
                </div>
              )}

              {messages.map((msg) => {
                const isOwn = msg.symbol === playerSymbol;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ y: 10, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                  >
                    <span className={`text-[10px] mb-1 ${
                      msg.symbol === 'X' ? 'text-neon-cyan/60' : 'text-neon-magenta/60'
                    }`}>
                      {msg.sender}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-white/[0.08] rounded-br-md'
                          : 'bg-white/[0.04] rounded-bl-md'
                      }`}
                      style={{
                        borderLeft: !isOwn
                          ? `2px solid ${msg.symbol === 'X' ? 'rgba(0,240,255,0.4)' : 'rgba(255,0,228,0.4)'}`
                          : 'none',
                        borderRight: isOwn
                          ? `2px solid ${msg.symbol === 'X' ? 'rgba(0,240,255,0.4)' : 'rgba(255,0,228,0.4)'}`
                          : 'none',
                      }}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-text-muted mt-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/[0.08]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="input-glass flex-1 text-sm !py-2.5 !px-3"
                  maxLength={200}
                  id="chat-input"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="btn-primary !px-4 !py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  id="chat-send-btn"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
