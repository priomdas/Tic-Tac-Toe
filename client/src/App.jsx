import { useState, useEffect } from 'react';
import ParticleBackground from './components/ParticleBackground';
import LandingPage from './components/LandingPage';
import GameRoom from './components/GameRoom';
import AIGameRoom from './components/AIGameRoom';
import { useGame } from './hooks/useGame';
import { useChat } from './hooks/useChat';
import { useVoiceChat } from './hooks/useVoiceChat';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'game' | 'ai'
  const game = useGame();
  const chat = useChat();
  const voice = useVoiceChat(game.roomCode, game.playerSymbol);

  // Automatically switch to game view when both players are in the room
  useEffect(() => {
    if (game.players.length === 2 && view === 'landing') {
      setView('game');
    }
  }, [game.players.length, view]);

  const handleCreateRoom = async (playerName, mode) => {
    const result = await game.createRoom(playerName, mode);
    return result;
  };

  const handleJoinRoom = async (code, playerName) => {
    const result = await game.joinRoom(code, playerName);
    if (result.success) {
      setView('game');
    }
    return result;
  };

  const handleLeave = () => {
    voice.cleanupVoice();
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-bg-primary bg-gradient-radial relative">
      <ParticleBackground />

      {view === 'landing' && (
        <LandingPage
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onPlayAI={() => setView('ai')}
        />
      )}

      {view === 'game' && (
        <GameRoom
          game={game}
          chat={chat}
          voice={voice}
          onLeave={handleLeave}
        />
      )}

      {view === 'ai' && (
        <AIGameRoom onLeave={() => setView('landing')} />
      )}
    </div>
  );
}
