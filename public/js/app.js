const socket = io();

const elements = {
  lobby: document.getElementById('lobby'),
  game: document.getElementById('game'),
  playerName: document.getElementById('playerName'),
  createGameBtn: document.getElementById('createGameBtn'),
  joinGameBtn: document.getElementById('joinGameBtn'),
  joinPanel: document.getElementById('joinPanel'),
  roomCode: document.getElementById('roomCode'),
  connectBtn: document.getElementById('connectBtn'),
  errorMsg: document.getElementById('errorMsg'),
  waitingRoom: document.getElementById('waitingRoom'),
  displayRoomCode: document.getElementById('displayRoomCode'),
  board: document.getElementById('board'),
  coordsLeft: document.getElementById('coordsLeft'),
  coordsBottom: document.getElementById('coordsBottom'),
  topPlayer: document.getElementById('topPlayer'),
  bottomPlayer: document.getElementById('bottomPlayer'),
  opponentName: document.getElementById('opponentName'),
  playerNameDisplay: document.getElementById('playerNameDisplay'),
  turnIndicator: document.getElementById('turnIndicator'),
  status: document.getElementById('status'),
  moveHistory: document.getElementById('moveHistory'),
  newGameBtn: document.getElementById('newGameBtn'),
  leaveBtn: document.getElementById('leaveBtn'),
  gameOverModal: document.getElementById('gameOverModal'),
  gameOverTitle: document.getElementById('gameOverTitle'),
  gameOverMessage: document.getElementById('gameOverMessage'),
  rematchBtn: document.getElementById('rematchBtn'),
  backToLobbyBtn: document.getElementById('backToLobbyBtn')
};

let playerColor = 'w';
let selectedSquare = null;
let currentGameState = null;
let myName = '';

function showScreen(screen) {
  elements.lobby.classList.remove('active');
  elements.game.classList.remove('active');
  screen.classList.add('active');
}

function showError(msg) {
  elements.errorMsg.textContent = msg;
  elements.errorMsg.classList.remove('hidden');
  setTimeout(() => elements.errorMsg.classList.add('hidden'), 4000);
}

function getValidMoves(fen, square) {
  try {
    const response = fetch('/api/moves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, square })
    });
    return null;
  } catch (e) {
    return null;
  }
}

function renderBoard(fen, lastMove, kingInCheck) {
  const board = ChessUtils.fenToBoard(fen);
  const isFlipped = playerColor === 'b';

  elements.board.innerHTML = '';
  elements.board.className = 'chess-board' + (isFlipped ? ' flipped' : '');

  elements.coordsLeft.innerHTML = '';
  elements.coordsBottom.innerHTML = '';

  const ranksForDisplay = isFlipped ? ChessUtils.RANKS.slice().reverse() : ChessUtils.RANKS;
  const filesForDisplay = isFlipped ? ChessUtils.FILES.slice().reverse() : ChessUtils.FILES;

  for (const r of ranksForDisplay) {
    const span = document.createElement('span');
    span.textContent = r;
    elements.coordsLeft.appendChild(span);
  }

  for (const f of filesForDisplay) {
    const span = document.createElement('span');
    span.textContent = f;
    elements.coordsBottom.appendChild(span);
  }

  let lastFrom = null;
  let lastTo = null;
  if (lastMove) {
    lastFrom = ChessUtils.algebraicToSquare(lastMove.from);
    lastTo = ChessUtils.algebraicToSquare(lastMove.to);
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const displayRow = isFlipped ? 7 - row : row;
      const displayCol = isFlipped ? 7 - col : col;
      const square = document.createElement('div');
      const color = ChessUtils.getSquareColor(displayRow, displayCol);
      square.className = `square ${color}`;
      square.dataset.row = displayRow;
      square.dataset.col = displayCol;
      square.dataset.square = ChessUtils.squareToAlgebraic(displayRow, displayCol);

      if (lastFrom && lastFrom.row === displayRow && lastFrom.col === displayCol) {
        square.classList.add('last-move');
      }
      if (lastTo && lastTo.row === displayRow && lastTo.col === displayCol) {
        square.classList.add('last-move');
      }

      if (kingInCheck && board[displayRow][displayCol]) {
        const piece = board[displayRow][displayCol];
        if ((piece === 'K' && ChessUtils.isWhitePiece(piece)) || (piece === 'k' && !ChessUtils.isWhitePiece(piece))) {
          if (currentGameState && currentGameState.turn === (piece === 'K' ? 'w' : 'b')) {
            square.classList.add('in-check');
          }
        }
      }

      const piece = board[displayRow][displayCol];
      if (piece) {
        const pieceEl = document.createElement('span');
        pieceEl.className = 'piece';
        pieceEl.textContent = ChessUtils.getPieceUnicode(piece);
        square.appendChild(pieceEl);
      }

      square.addEventListener('click', () => handleSquareClick(displayRow, displayCol, board));

      elements.board.appendChild(square);
    }
  }
}

function handleSquareClick(row, col, board) {
  if (!currentGameState) return;
  if (currentGameState.isGameOver) return;
  if (currentGameState.turn !== playerColor) return;

  const piece = board[row][col];
  const square = ChessUtils.squareToAlgebraic(row, col);

  if (selectedSquare) {
    const targetPiece = board[row][col];

    if (selectedSquare.square === square) {
      clearSelection();
      return;
    }

    if (piece && ChessUtils.isWhitePiece(piece) === (playerColor === 'w')) {
      clearSelection();
      selectSquare(row, col, piece, square);
      return;
    }

    const move = {
      from: selectedSquare.square,
      to: square
    };

    if (selectedSquare.piece.toLowerCase() === 'p') {
      const targetRank = playerColor === 'w' ? 8 : 1;
      if (row + (playerColor === 'w' ? 1 : -1) === (playerColor === 'w' ? 7 : 0) ||
          square[1] === String(targetRank)) {
        move.promotion = 'q';
      }
    }

    socket.emit('move', { move });
    clearSelection();
  } else {
    if (piece && ChessUtils.isWhitePiece(piece) === (playerColor === 'w')) {
      selectSquare(row, col, piece, square);
    }
  }
}

function selectSquare(row, col, piece, square) {
  selectedSquare = { row, col, piece, square };
  const squareEl = elements.board.querySelector(`[data-square="${square}"]`);
  if (squareEl) {
    squareEl.classList.add('selected');
  }
  showLegalMoves(square);
}

function showLegalMoves(fromSquare) {
  if (!currentGameState || !currentGameState.fen) return;

  try {
    const tempBoard = ChessUtils.fenToBoard(currentGameState.fen);
    const squares = elements.board.querySelectorAll('.square');

    squares.forEach(sq => {
      const toSquare = sq.dataset.square;
      if (toSquare === fromSquare) return;

      const testMove = { from: fromSquare, to: toSquare };

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/validate', false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ fen: currentGameState.fen, move: testMove }));

      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        if (result.valid) {
          const targetPiece = ChessUtils.fenToBoard(currentGameState.fen);
          const toRow = ChessUtils.algebraicToSquare(toSquare).row;
          const toCol = ChessUtils.algebraicToSquare(toSquare).col;
          const existing = targetPiece[toRow][toCol];

          if (existing) {
            const dot = document.createElement('div');
            dot.className = 'capture-dot';
            sq.appendChild(dot);
          } else {
            const dot = document.createElement('div');
            dot.className = 'move-dot';
            sq.appendChild(dot);
          }
        }
      }
    });
  } catch (e) {
    // silently fail
  }
}

function clearSelection() {
  selectedSquare = null;
  const selected = elements.board.querySelectorAll('.selected');
  selected.forEach(sq => sq.classList.remove('selected'));
  const dots = elements.board.querySelectorAll('.move-dot, .capture-dot');
  dots.forEach(d => d.remove());
}

function updateStatus(gameState) {
  if (gameState.isGameOver) return;

  let statusText = '';
  if (gameState.isCheck) {
    statusText = 'Шах!';
  } else if (gameState.turn === playerColor) {
    statusText = 'Ваш ход';
  } else {
    statusText = 'Ход соперника...';
  }
  elements.status.textContent = statusText;

  if (gameState.turn === playerColor) {
    elements.turnIndicator.textContent = 'Ваш ход';
    elements.turnIndicator.style.background = 'var(--success)';
  } else {
    elements.turnIndicator.textContent = 'Ожидание...';
    elements.turnIndicator.style.background = 'var(--text-secondary)';
  }
}

function updateMoveHistory(moves) {
  elements.moveHistory.innerHTML = ChessUtils.formatMoves(moves);
  elements.moveHistory.scrollTop = elements.moveHistory.scrollHeight;
}

function updatePlayers(white, black) {
  if (playerColor === 'w') {
    elements.playerNameDisplay.textContent = myName + ' (Белые)';
    elements.opponentName.textContent = black || 'Соперник';
  } else {
    elements.playerNameDisplay.textContent = myName + ' (Чёрные)';
    elements.opponentName.textContent = white || 'Соперник';
  }
}

elements.createGameBtn.addEventListener('click', () => {
  myName = elements.playerName.value.trim();
  if (!myName) {
    showError('Введите ваше имя');
    return;
  }

  elements.createGameBtn.disabled = true;
  socket.emit('create-room', { playerName: myName }, (response) => {
    elements.createGameBtn.disabled = false;
    if (response.success) {
      playerColor = response.color;
      elements.waitingRoom.classList.remove('hidden');
      elements.displayRoomCode.textContent = response.roomId;
      elements.joinPanel.classList.add('hidden');
      elements.menuButtons = document.querySelector('.menu-buttons');
    } else {
      showError(response.error || 'Ошибка создания комнаты');
    }
  });
});

elements.joinGameBtn.addEventListener('click', () => {
  elements.joinPanel.classList.toggle('hidden');
});

elements.connectBtn.addEventListener('click', () => {
  myName = elements.playerName.value.trim();
  if (!myName) {
    showError('Введите ваше имя');
    return;
  }

  const code = elements.roomCode.value.trim().toUpperCase();
  if (!code || code.length < 4) {
    showError('Введите код комнаты');
    return;
  }

  elements.connectBtn.disabled = true;
  socket.emit('join-room', { roomId: code, playerName: myName }, (response) => {
    elements.connectBtn.disabled = false;
    if (response.success) {
      playerColor = response.color;
      currentGameState = response.gameState;
      startGame(response.gameState);
    } else {
      showError(response.error || 'Ошибка подключения');
    }
  });
});

function startGame(gameState) {
  currentGameState = gameState;
  showScreen(elements.game);
  renderBoard(gameState.fen, gameState.moves[gameState.moves.length - 1], gameState.isCheck);
  updateStatus(gameState);
  updateMoveHistory(gameState.moves);
  updatePlayers();
}

socket.on('game-start', ({ white, black }) => {
  updatePlayers(white, black);
  const gameState = {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    turn: 'w',
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    isGameOver: false
  };
  currentGameState = gameState;
  showScreen(elements.game);
  renderBoard(gameState.fen, null, false);
  updateStatus(gameState);
});

socket.on('move-made', (gameState) => {
  currentGameState = gameState;
  clearSelection();
  renderBoard(gameState.fen, gameState.moves[gameState.moves.length - 1], gameState.isCheck);
  updateStatus(gameState);
  updateMoveHistory(gameState.moves);
});

socket.on('invalid-move', ({ error }) => {
  showError('Невозможный ход: ' + error);
  clearSelection();
});

socket.on('game-over', ({ reason, winner }) => {
  let title = '';
  let message = '';

  if (reason === 'checkmate') {
    title = 'Мат!';
    if (winner === myName) {
      message = 'Поздравляем! Вы победили!';
    } else {
      message = `${winner || 'Соперник'} победил(а)!`;
    }
  } else if (reason === 'draw') {
    title = 'Ничья!';
    message = 'Игра закончилась вничью.';
  } else if (reason === 'resign') {
    title = 'Поражение';
    message = 'Вы проиграли.';
  }

  elements.gameOverTitle.textContent = title;
  elements.gameOverMessage.textContent = message;
  elements.gameOverModal.classList.remove('hidden');
});

socket.on('game-restarted', (gameState) => {
  currentGameState = gameState;
  elements.gameOverModal.classList.add('hidden');
  clearSelection();
  renderBoard(gameState.fen, null, false);
  updateStatus(gameState);
  updateMoveHistory([]);
  elements.status.textContent = 'Новая игра началась!';
});

socket.on('opponent-disconnected', () => {
  showError('Соперник отключился');
  elements.status.textContent = 'Соперник отключился';
  elements.turnIndicator.textContent = 'Ожидание...';
});

socket.on('connect_error', () => {
  showError('Ошибка подключения к серверу');
});

elements.newGameBtn.addEventListener('click', () => {
  socket.emit('new-game');
});

elements.leaveBtn.addEventListener('click', () => {
  if (confirm('Вы уверены, что хотите выйти?')) {
    location.reload();
  }
});

elements.rematchBtn.addEventListener('click', () => {
  socket.emit('new-game');
});

elements.backToLobbyBtn.addEventListener('click', () => {
  location.reload();
});

elements.playerName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (!elements.joinPanel.classList.contains('hidden')) {
      elements.connectBtn.click();
    } else {
      elements.createGameBtn.click();
    }
  }
});

elements.roomCode.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    elements.connectBtn.click();
  }
});
