const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// ─── Server Setup ───────────────────────────────────────────────
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// ─── In-Memory Room Store ───────────────────────────────────────
const rooms = new Map();

function generateRoomCode() {
  return uuidv4().slice(0, 6).toUpperCase();
}

function createRoomState() {
  return {
    players: [],          // [{ id, name, symbol }, ...]
    board: Array(9).fill(null),
    currentTurn: 'X',
    scores: { X: 0, O: 0, draws: 0 },
    winner: null,
    winningLine: null,
    gameStatus: 'waiting', // waiting | playing | finished
    chatHistory: [],
    roundStarter: 'X',     // alternates each round
  };
}

// ─── Win Detection ──────────────────────────────────────────────
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diags
];

function checkWinner(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', winningLine: null };
  }
  return null;
}

// ─── Socket.io Event Handling ───────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // ── Create Room ─────────────────────────────────────────────
  socket.on('create-room', ({ playerName }, callback) => {
    const roomCode = generateRoomCode();
    const room = createRoomState();

    room.players.push({
      id: socket.id,
      name: playerName || 'Player 1',
      symbol: 'X',
    });

    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.playerSymbol = 'X';

    console.log(`🏠 Room ${roomCode} created by ${playerName}`);

    callback({
      success: true,
      roomCode,
      playerSymbol: 'X',
      room: sanitizeRoom(room),
    });
  });

  // ── Join Room ───────────────────────────────────────────────
  socket.on('join-room', ({ roomCode, playerName }, callback) => {
    const code = roomCode.toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      return callback({ success: false, message: 'Room not found. Check the code and try again.' });
    }

    if (room.players.length >= 2) {
      return callback({ success: false, message: 'Room is full. Try another room.' });
    }

    // Prevent same socket joining twice
    if (room.players.some((p) => p.id === socket.id)) {
      return callback({ success: false, message: 'You are already in this room.' });
    }

    room.players.push({
      id: socket.id,
      name: playerName || 'Player 2',
      symbol: 'O',
    });

    const firstTurn = Math.random() < 0.5 ? 'X' : 'O';
    room.currentTurn = firstTurn;
    room.roundStarter = firstTurn;
    room.gameStatus = 'playing';

    socket.join(code);
    socket.roomCode = code;
    socket.playerSymbol = 'O';

    console.log(`🎮 ${playerName} joined room ${code}`);

    // Notify both players
    io.to(code).emit('game-update', sanitizeRoom(room));
    io.to(code).emit('player-joined', {
      players: room.players.map((p) => ({ name: p.name, symbol: p.symbol })),
    });

    callback({
      success: true,
      roomCode: code,
      playerSymbol: 'O',
      room: sanitizeRoom(room),
    });
  });

  // ── Make Move ───────────────────────────────────────────────
  socket.on('make-move', ({ index }, callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return callback?.({ success: false, message: 'Room not found.' });

    // Validate
    if (room.gameStatus !== 'playing') {
      return callback?.({ success: false, message: 'Game is not in progress.' });
    }

    if (room.currentTurn !== socket.playerSymbol) {
      return callback?.({ success: false, message: "It's not your turn." });
    }

    if (index < 0 || index > 8 || room.board[index] !== null) {
      return callback?.({ success: false, message: 'Invalid move.' });
    }

    // Apply move
    room.board[index] = socket.playerSymbol;

    // Check result
    const result = checkWinner(room.board);
    if (result) {
      room.gameStatus = 'finished';
      room.winner = result.winner;
      room.winningLine = result.winningLine;

      if (result.winner === 'draw') {
        room.scores.draws++;
      } else {
        room.scores[result.winner]++;
      }

      io.to(socket.roomCode).emit('game-over', {
        winner: result.winner,
        winningLine: result.winningLine,
        scores: room.scores,
        board: room.board,
      });
    } else {
      // Switch turn
      room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
    }

    io.to(socket.roomCode).emit('game-update', sanitizeRoom(room));
    callback?.({ success: true });
  });

  // ── Play Again ──────────────────────────────────────────────
  socket.on('play-again', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    // Reset board
    room.board = Array(9).fill(null);
    room.winner = null;
    room.winningLine = null;
    room.gameStatus = room.players.length === 2 ? 'playing' : 'waiting';

    // Alternate who starts
    room.roundStarter = room.roundStarter === 'X' ? 'O' : 'X';
    room.currentTurn = room.roundStarter;

    io.to(socket.roomCode).emit('game-reset', sanitizeRoom(room));
    io.to(socket.roomCode).emit('game-update', sanitizeRoom(room));

    console.log(`🔄 Room ${socket.roomCode} reset — ${room.roundStarter} goes first`);
  });

  // ── Chat ────────────────────────────────────────────────────
  socket.on('send-message', ({ text }) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const message = {
      id: uuidv4(),
      sender: player.name,
      symbol: player.symbol,
      text: text.trim(),
      timestamp: Date.now(),
    };

    room.chatHistory.push(message);

    // Keep only last 100 messages
    if (room.chatHistory.length > 100) {
      room.chatHistory = room.chatHistory.slice(-100);
    }

    io.to(socket.roomCode).emit('receive-message', message);
  });

  // ── WebRTC Signaling ────────────────────────────────────────
  socket.on('webrtc-offer', (data) => {
    socket.to(socket.roomCode).emit('webrtc-offer', data);
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(socket.roomCode).emit('webrtc-answer', data);
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(socket.roomCode).emit('webrtc-ice-candidate', data);
  });

  // ── Disconnect ──────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`💔 Client disconnected: ${socket.id}`);
    const roomCode = socket.roomCode;
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room) return;

    const disconnectedPlayer = room.players.find((p) => p.id === socket.id);
    room.players = room.players.filter((p) => p.id !== socket.id);

    if (room.players.length === 0) {
      rooms.delete(roomCode);
      console.log(`🗑️  Room ${roomCode} deleted (empty)`);
    } else {
      room.gameStatus = 'waiting';
      room.board = Array(9).fill(null);
      room.winner = null;
      room.winningLine = null;
      room.currentTurn = 'X';

      io.to(roomCode).emit('opponent-disconnected', {
        message: `${disconnectedPlayer?.name || 'Opponent'} has left the game.`,
      });
      io.to(roomCode).emit('game-update', sanitizeRoom(room));
    }
  });
});

// ─── Helper: Sanitize room state for client ─────────────────────
function sanitizeRoom(room) {
  return {
    players: room.players.map((p) => ({ name: p.name, symbol: p.symbol })),
    board: room.board,
    currentTurn: room.currentTurn,
    scores: room.scores,
    winner: room.winner,
    winningLine: room.winningLine,
    gameStatus: room.gameStatus,
  };
}

// ─── Health Check ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    uptime: process.uptime(),
  });
});

// ─── Start Server ───────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 Tic-Tac-Toe server running on http://localhost:${PORT}\n`);
});
