const ChessUtils = {
  PIECES: {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  },

  FILES: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  RANKS: ['8', '7', '6', '5', '4', '3', '2', '1'],

  fenToBoard(fen) {
    const board = [];
    const rows = fen.split(' ')[0].split('/');
    for (const row of rows) {
      const boardRow = [];
      for (const char of row) {
        if (isNaN(char)) {
          boardRow.push(char);
        } else {
          for (let i = 0; i < parseInt(char); i++) {
            boardRow.push(null);
          }
        }
      }
      board.push(boardRow);
    }
    return board;
  },

  getSquareColor(row, col) {
    return (row + col) % 2 === 0 ? 'dark' : 'light';
  },

  squareToAlgebraic(row, col) {
    return this.FILES[col] + this.RANKS[row];
  },

  algebraicToSquare(sq) {
    const col = this.FILES.indexOf(sq[0]);
    const row = this.RANKS.indexOf(sq[1]);
    return { row, col };
  },

  getPieceUnicode(piece) {
    return this.PIECES[piece] || '';
  },

  isWhitePiece(piece) {
    return piece && piece === piece.toUpperCase();
  },

  formatMoves(moves) {
    let html = '';
    for (let i = 0; i < moves.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      html += `<span class="move-number">${moveNum}.</span>`;
      html += `<span class="white-move">${moves[i].san}</span>`;
      if (i + 1 < moves.length) {
        html += `<span class="black-move">${moves[i + 1].san}</span>`;
      }
    }
    return html;
  }
};
