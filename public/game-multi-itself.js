function startMultiplayerGame() {
  board = createBoard();
  score = 0;
  scoreEl.textContent = score;
  holdPiece = null;
  nextPiece = createPiece(randomType());
  resetPiece();
  update(); // 呼叫 animation loop
  socket.emit('syncState', {
    board,
    currentPiece,
    name: playerName1,
    isGameOver: false
  });
  console.log('🎮 多人遊戲開始！');
}

const otherPlayers = {};
let winnerDeclared = false;

socket.on('syncState', ({ id, name, board, currentPiece, isGameOver }) => {
  otherPlayers[id] = { name, board, currentPiece, isGameOver };
  renderOtherPlayers();

  const alivePlayers = Object.entries(otherPlayers).filter(([_, p]) => !p.isGameOver);
  if (!isGameOver && alivePlayers.length === 0 && !winnerDeclared) {
    winnerDeclared = true;
    isGameOver = true;
    drawWin();
    freezeGame();
  }

});

function renderOtherPlayers() {
  const container = document.getElementById('multiplayerViews');
  container.innerHTML = '';

  for (const [id, player] of Object.entries(otherPlayers)) {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 600;
    canvas.classList.add('multiplayer-canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (player.isGameOver) {
      drawMatrixGray(player.board, 0, 0, ctx);
      drawMatrixGray(player.currentPiece.shape, player.currentPiece.x, player.currentPiece.y, ctx);
    } else {
      drawMatrix(player.board, 0, 0, ctx, false);
      drawMatrix(player.currentPiece.shape, player.currentPiece.x, player.currentPiece.y, ctx, false);
    }

    const label = document.createElement('div');
    label.style.textAlign = 'center';
    label.style.color = '#fff';
    label.style.fontSize = '14px';
    label.textContent = player.name;

    const wrapper = document.createElement('div');
    wrapper.classList.add('multiplayer-view');
    wrapper.appendChild(canvas);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  }
}

function drawWin() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
  ctx.fillStyle = '#0f0';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏆 WINNER 🏆', canvas.width / 2, canvas.height / 2 + 10);
}

function freezeGame() {
  // 阻止更新動畫
  isGameOver = true;
}


function returnToMenu() {
  canvas.style.display = 'none';
  scoreBoard.style.display = 'none';
  menu.style.display = 'block';
  document.getElementById('multiplayerViews').style.display = 'none';
}

function returnToRoom() {
  canvas.style.display = 'none';
  scoreBoard.style.display = 'none';
  menu.style.display = 'block';
  document.getElementById('multiplayerViews').style.display = 'none';
}

window.addEventListener('beforeunload', () => {
  socket.emit('syncState', {
    board,
    currentPiece,
    name: playerName1,
    isGameOver: true
  });
  setTimeout(() => {
    socket.disconnect();
    }, 200);
});

window.addEventListener('keydown', e => {

  if (winnerDeclared && isRoomHost) {
    if (e.key === ' ') {
      socket.emit('startGame', roomPassword);
    }
    if (e.key === 'Escape') {
      returnToRoom();
    }
  }

  if (e.key === 'Escape') {
    const confirmed = confirm('確定要離開房間嗎？');
    if (confirmed) {
      socket.emit('syncState', {
        board,
        currentPiece,
        name: playerName1,
        isGameOver: true
      });
      setTimeout(() => {
        socket.disconnect();
        }, 200);
      returnToRoom();
    }
    return;
  }
});