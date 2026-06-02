import { useState, useCallback, useEffect, useRef } from 'react';

// ─── Win Detection ──────────────────────────────────────────────
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
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

// ─── Minimax AI ─────────────────────────────────────────────────
function minimax(board, isMaximizing, aiSymbol, humanSymbol, depth = 0) {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === aiSymbol) return 10 - depth;
    if (result.winner === humanSymbol) return depth - 10;
    return 0; // draw
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = aiSymbol;
        best = Math.max(best, minimax(board, false, aiSymbol, humanSymbol, depth + 1));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanSymbol;
        best = Math.min(best, minimax(board, true, aiSymbol, humanSymbol, depth + 1));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board, aiSymbol, humanSymbol) {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = aiSymbol;
      const score = minimax(board, false, aiSymbol, humanSymbol, 0);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function getRandomMove(board) {
  const empty = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getAIMove(board, aiSymbol, humanSymbol, difficulty) {
  if (difficulty === 'easy') {
    // 80% random, 20% optimal
    return Math.random() < 0.8 ? getRandomMove(board) : getBestMove([...board], aiSymbol, humanSymbol);
  }
  if (difficulty === 'medium') {
    // 40% random, 60% optimal
    return Math.random() < 0.4 ? getRandomMove(board) : getBestMove([...board], aiSymbol, humanSymbol);
  }
  // hard — always optimal (unbeatable)
  return getBestMove([...board], aiSymbol, humanSymbol);
}

// ─── Hook ───────────────────────────────────────────────────────
export function useAIGame(difficulty = 'medium') {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');
  const [roundStarter, setRoundStarter] = useState('X');
  const aiThinking = useRef(false);

  const playerSymbol = 'X';
  const aiSymbol = 'O';

  const players = [
    { name: 'You', symbol: 'X' },
    { name: 'Computer', symbol: 'O' },
  ];

  // AI makes a move when it's O's turn
  useEffect(() => {
    if (currentTurn !== aiSymbol || gameStatus !== 'playing' || aiThinking.current) return;

    aiThinking.current = true;

    // Add a small delay so the move feels natural
    const timer = setTimeout(() => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        const move = getAIMove(newBoard, aiSymbol, playerSymbol, difficulty);

        if (move === -1 || move === undefined) {
          aiThinking.current = false;
          return prevBoard;
        }

        newBoard[move] = aiSymbol;

        // Check result
        const result = checkWinner(newBoard);
        if (result) {
          setGameStatus('finished');
          setWinner(result.winner);
          setWinningLine(result.winningLine);
          if (result.winner === 'draw') {
            setScores((s) => ({ ...s, draws: s.draws + 1 }));
          } else {
            setScores((s) => ({ ...s, [result.winner]: s[result.winner] + 1 }));
          }
        } else {
          setCurrentTurn(playerSymbol);
        }

        aiThinking.current = false;
        return newBoard;
      });
    }, 500 + Math.random() * 400); // 500-900ms delay

    return () => {
      clearTimeout(timer);
      aiThinking.current = false;
    };
  }, [currentTurn, gameStatus, difficulty]);

  const makeMove = useCallback((index) => {
    if (gameStatus !== 'playing' || currentTurn !== playerSymbol || board[index] !== null) return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;

    const result = checkWinner(newBoard);
    if (result) {
      setBoard(newBoard);
      setGameStatus('finished');
      setWinner(result.winner);
      setWinningLine(result.winningLine);
      if (result.winner === 'draw') {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        setScores((s) => ({ ...s, [result.winner]: s[result.winner] + 1 }));
      }
    } else {
      setBoard(newBoard);
      setCurrentTurn(aiSymbol);
    }
  }, [gameStatus, currentTurn, board]);

  const playAgain = useCallback(() => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setGameStatus('playing');
    const nextStarter = roundStarter === 'X' ? 'O' : 'X';
    setRoundStarter(nextStarter);
    setCurrentTurn(nextStarter);
  }, [roundStarter]);

  const resetAll = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentTurn('X');
    setScores({ X: 0, O: 0, draws: 0 });
    setWinner(null);
    setWinningLine(null);
    setGameStatus('playing');
    setRoundStarter('X');
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
    isMyTurn,
    makeMove,
    playAgain,
    resetAll,
  };
}
