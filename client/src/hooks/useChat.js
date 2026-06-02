import { useState, useEffect, useCallback, useRef } from 'react';
import socket from '../socket';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isChatOpenRef = useRef(false);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      if (!isChatOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, []);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    socket.emit('send-message', { text });
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const setChatOpen = useCallback((isOpen) => {
    isChatOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, []);

  return {
    messages,
    unreadCount,
    sendMessage,
    markAsRead,
    setChatOpen,
  };
}
