const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

app.post('/api/validate', (req, res) => {
  const { fen, move } = req.body;
  try {
    const chess = new Chess(fen);
    const result = chess.move(move);
    if (result) {
      res.json({ valid: true, fen: chess.fen() });
    } else {
      res.json({ valid: false });
    }
  } catch (e) {
    res.json({ valid: false });
  }
});

const rooms = new Map();

function createRoom(creatorName) {
  const roomId = uuidv4().slice(0, 6).toUpperCase();
  const room = {
    id: roomId,
    players: [],
    chess: new Chess(),
    moves: [],
    creatorName
  };
  rooms.set(roomId, room);
  return room;
}

function getGameState(room) {
  return {
    fen: room.chess.fen(),
    moves: room.moves,
    turn: room.chess.turn(),
    isCheck: room.chess.isCheck(),
    isCheckmate: room.chess.isCheckmate(),
    isDraw: room.chess.isDraw(),
    isGameOver: room.chess.isGameOver(),
    pgn: room.chess.pgn()
  };
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('create-room', ({ playerName }, callback) => {
    const room = createRoom(playerName);
    room.players.push({ id: socket.id, name: playerName, color: 'w' });
    socket.join(room.id);
    socket.roomId = room.id;
    socket.playerColor = 'w';
    callback({ success: true, roomId: room.id, color: 'w', gameState: getGameState(room) });
    console.log(`Room ${room.id} created by ${playerName}`);
  });

  socket.on('join-room', ({ roomId, playerName }, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      return callback({ success: false, error: 'Комната не найдена' });
    }
    if (room.players.length >= 2) {
      return callback({ success: false, error: 'Комната уже полна' });
    }

    room.players.push({ id: socket.id, name: playerName, color: 'b' });
    socket.join(room.id);
    socket.roomId = room.id;
    socket.playerColor = 'b';

    const gameState = getGameState(room);
    callback({ success: true, roomId: room.id, color: 'b', gameState });

    io.to(room.id).emit('game-start', {
      white: room.players.find(p => p.color === 'w').name,
      black: room.players.find(p => p.color === 'b').name
    });
    console.log(`${playerName} joined room ${roomId}`);
  });

  socket.on('move', ({ move }) => {
    const room = rooms.get(socket.roomId);
    if (!room) return;

    const chess = new Chess(room.chess.fen());

    let result;
    try {
      result = chess.move(move);
    } catch (e) {
      return socket.emit('invalid-move', { error: e.message });
    }

    if (result) {
      room.chess = chess;
      room.moves.push({
        from: result.from,
        to: result.to,
        san: result.san,
        captured: result.captured,
        promotion: result.promotion
      });

      const gameState = getGameState(room);
      io.to(room.id).emit('move-made', gameState);

      if (gameState.isCheckmate) {
        const winner = room.players.find(p => p.color === gameState.turn === 'w' ? 'b' : 'w');
        io.to(room.id).emit('game-over', { reason: 'checkmate', winner: winner?.name });
      } else if (gameState.isDraw) {
        io.to(room.id).emit('game-over', { reason: 'draw' });
      }
    }
  });

  socket.on('get-rooms', (callback) => {
    const availableRooms = [];
    rooms.forEach((room, id) => {
      if (room.players.length < 2) {
        availableRooms.push({ id, creator: room.creatorName });
      }
    });
    callback(availableRooms);
  });

  socket.on('new-game', (_, callback) => {
    const room = rooms.get(socket.roomId);
    if (!room) return;

    room.chess = new Chess();
    room.moves = [];

    const gameState = getGameState(room);
    io.to(socket.roomId).emit('game-restarted', gameState);
    if (callback) callback({ success: true });
  });

  socket.on('disconnect', () => {
    const room = rooms.get(socket.roomId);
    if (room) {
      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) {
        rooms.delete(socket.roomId);
      } else {
        io.to(socket.roomId).emit('opponent-disconnected');
      }
    }
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chess server running on http://localhost:${PORT}`);
});
