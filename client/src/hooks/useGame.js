import { useState, useEffect, useCallback } from 'react';
import socket from '../socket';

export function useGame() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [players, setPlayers] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [gameMode, setGameMode] = useState('classic');
  const [moveHistory, setMoveHistory] = useState([]);

  useEffect(() => {
    const handleGameUpdate = (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setScores(data.scores);
      setWinner(data.winner);
      setWinningLine(data.winningLine);
      setGameStatus(data.gameStatus);
      if (data.players) {
        setPlayers(data.players);
      }
      if (data.gameMode) setGameMode(data.gameMode);
      if (data.moveHistory) setMoveHistory(data.moveHistory);
    };

    const handleGameOver = (data) => {
      setWinner(data.winner);
      setWinningLine(data.winningLine);
      setScores(data.scores);
      setBoard(data.board);
      if (data.moveHistory) setMoveHistory(data.moveHistory);
      setGameStatus('finished');
    };

    const handleGameReset = (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setWinner(null);
      setWinningLine(null);
      setGameStatus(data.gameStatus);
      if (data.moveHistory) setMoveHistory(data.moveHistory);
      setOpponentLeft(false);
    };

    const handlePlayerJoined = (data) => {
      setPlayers(data.players);
      setOpponentLeft(false);
    };

    const handleOpponentDisconnected = () => {
      setOpponentLeft(true);
      setGameStatus('waiting');
    };

    socket.on('game-update', handleGameUpdate);
    socket.on('game-over', handleGameOver);
    socket.on('game-reset', handleGameReset);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('opponent-disconnected', handleOpponentDisconnected);

    return () => {
      socket.off('game-update', handleGameUpdate);
      socket.off('game-over', handleGameOver);
      socket.off('game-reset', handleGameReset);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('opponent-disconnected', handleOpponentDisconnected);
    };
  }, []);

  const createRoom = useCallback((playerName, mode = 'classic') => {
    return new Promise((resolve) => {
      socket.emit('create-room', { playerName, gameMode: mode }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setPlayerSymbol(response.playerSymbol);
          setPlayers(response.room.players);
          setGameStatus(response.room.gameStatus);
          if (response.room.gameMode) setGameMode(response.room.gameMode);
          if (response.room.moveHistory) setMoveHistory(response.room.moveHistory);
        }
        resolve(response);
      });
    });
  }, []);

  const joinRoom = useCallback((code, playerName) => {
    return new Promise((resolve) => {
      socket.emit('join-room', { roomCode: code, playerName }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setPlayerSymbol(response.playerSymbol);
          setPlayers(response.room.players);
          setGameStatus(response.room.gameStatus);
          setBoard(response.room.board);
          setScores(response.room.scores);
          if (response.room.gameMode) setGameMode(response.room.gameMode);
          if (response.room.moveHistory) setMoveHistory(response.room.moveHistory);
        }
        resolve(response);
      });
    });
  }, []);

  const makeMove = useCallback((index) => {
    if (gameStatus !== 'playing' || currentTurn !== playerSymbol || board[index] !== null) {
      return;
    }
    socket.emit('make-move', { index }, (response) => {
      if (!response?.success) {
        console.warn('Move rejected:', response?.message);
      }
    });
  }, [gameStatus, currentTurn, playerSymbol, board]);

  const playAgain = useCallback(() => {
    socket.emit('play-again');
  }, []);

  const leaveRoom = useCallback(() => {
    socket.disconnect();
    socket.connect();
    setBoard(Array(9).fill(null));
    setCurrentTurn('X');
    setScores({ X: 0, O: 0, draws: 0 });
    setWinner(null);
    setWinningLine(null);
    setGameStatus('waiting');
    setPlayerSymbol(null);
    setPlayers([]);
    setRoomCode(null);
    setMoveHistory([]);
    setOpponentLeft(false);
  }, []);

  const isMyTurn = currentTurn === playerSymbol;

  return {
    board,
    currentTurn,
    scores,
    winner,
    winningLine,
    gameStatus,
    playerSymbol,
    players,
    roomCode,
    opponentLeft,
    isMyTurn,
    gameMode,
    moveHistory,
    createRoom,
    joinRoom,
    makeMove,
    playAgain,
    leaveRoom,
  };
}
