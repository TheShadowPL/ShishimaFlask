function startGame() {
    setPiece('p1', 'Gracz 1', hostPieceColor);
    setPiece('p2', 'Gracz 1', hostPieceColor);
    setPiece('p4', 'Gracz 1', hostPieceColor);

    setPiece('p6', 'Gracz 2', otherPlayerPieceColor);
    setPiece('p8', 'Gracz 2', otherPlayerPieceColor);
    setPiece('p9', 'Gracz 2', otherPlayerPieceColor);
}

function setPiece(pitId, player, color) {
    let pit = document.getElementById(pitId);
    pit.setAttribute('data-player', player);
    pit.style.backgroundColor = color;
}

let currentPlayer = 'Gracz 1';

let allowedMoves = {
    0: [1, 3, 4],
    1: [0, 2, 4],
    2: [1, 5, 4],
    3: [0, 6, 4],
    4: [0, 1, 2, 3, 5, 6, 7, 8, 9],
    5: [2, 8, 4],
    6: [3, 7, 4],
    7: [6, 8, 4],
    8: [5, 7, 4]
};

function makeMove(fromPos, toPos) {
    const urlParams = new URLSearchParams(window.location.search);
    const lobby_id = urlParams.get('lobby_id');
    const player = urlParams.get('player_name');
    let fromPit = document.getElementById('p' + (fromPos + 1));
    let toPit = document.getElementById('p' + (toPos + 1));

    console.log(fromPos, toPos,currentPlayer === 'Gracz 1' ? 1 : 2  )


    if (fromPit.getAttribute('data-player') !== currentPlayer) {
        alert('To nie jest twoja tura!');
        return;
    }

    if (!allowedMoves[fromPos].includes(toPos)) {
        alert('Możesz ruszyć się tylko po liniach planszy!');
        return;
    }

    if (toPit.getAttribute('data-player') !== null) {
        alert('Nie możesz ruszyć się na zajęte pole!');
        return;
    }

    fetch('/make_move', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fromPos: fromPos,
            toPos: toPos,
            currentPlayer: currentPlayer === 'Gracz 1' ? 1 : 2,
            lobby_id: lobby_id
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('data',data)
        if (data.status === 'OK') {
            toPit.setAttribute('data-player', currentPlayer);
            toPit.style.backgroundColor = fromPit.style.backgroundColor;
            fromPit.removeAttribute('data-player');
            fromPit.style.removeProperty('background-color');
            //fromPit.setAttribute('data-player', null);
            //fromPit.style.backgroundColor = 'grey';

        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

/*function makeMove(fromPos, toPos) {
    let fromPit = document.getElementById('p' + (fromPos + 1));
    let toPit = document.getElementById('p' + (toPos + 1));
    console.log(fromPos +' '+ toPos)

    if (fromPit.getAttribute('data-player') !== currentPlayer) {
        alert('To nie jest twoja tura!');
        return;
    }

    if (!allowedMoves[fromPos].includes(toPos)) {
        alert('Możesz ruszyć się tylko po liniach planszy!');
        return;
    }

    if (toPit.getAttribute('data-player') !== null) {
        alert('Nie możesz ruszyć się na zajęte pole!');
        return;
    }

    toPit.setAttribute('data-player', currentPlayer);
    toPit.style.backgroundColor = fromPit.style.backgroundColor;
    fromPit.removeAttribute('data-player');
    fromPit.style.removeProperty('background-color');

    //fromPit.setAttribute('data-player', null);
    //fromPit.style.backgroundColor = 'grey';

    currentPlayer = currentPlayer === 'Gracz 1' ? 'Gracz 2' : 'Gracz 1';
}*/

function endGame(lobby_id) {
    fetch('/end_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            lobby_id: lobby_id
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'OK') {
            window.location.href = '/';
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

let selectedPiece = null;


for (let i = 1; i <= 9; i++) {
    let pit = document.getElementById('p' + i);
    pit.addEventListener('click', function() {
        console.log('currentPlayer',currentPlayer)
        if (this.getAttribute('data-player') === currentPlayer) {
            selectedPiece = this;
        }
        else if (this.getAttribute('data-player') === null && selectedPiece !== null) {
            makeMove(selectedPiece.id.slice(1) - 1, this.id.slice(1) - 1);
            selectedPiece = null;
        }
    });
}


function updateBoard(state) {
    const pits = document.querySelectorAll('.pit');
    for (let i = 0; i < state.length; i++) {
        const pit = pits[i];
        const player = state[i];
        if (player === 1) {
            pit.style.backgroundColor = hostPieceColor;
            pit.setAttribute('data-player', 'Gracz 1');
        } else if (player === 2) {
            pit.style.backgroundColor = otherPlayerPieceColor;
            pit.setAttribute('data-player', 'Gracz 2');
        } else {
            pit.style.backgroundColor = 'grey';
            pit.removeAttribute('data-player');
        }
    }
}

//let game_winner = null;
let someone_win = false;
function DispWinner(playerID) {
    //console.log('playerID' + playerID)
    //console.log('someone_win' + someone_win)
    if (someone_win === false){
        if (playerID === 'none'){
            return;
        }else if (playerID !== 'none'){
            document.getElementById('winner').textContent = 'Zwyciezca: ' + game_winner;
            someone_win = true
            alerted('Wygrał gracz : ' + game_winner).then(() => {
                endGame(lobbyID);
            });
             //alert('Wygrał gracz : ' + game_winner);
            //endGame(lobbyID)
        }

       /* if (playerID === 'none'){
            return;
        }else if (playerID === 1){
            game_winner = other_player;
            document.getElementById('winner').textContent = 'Zwyciezca: ' + game_winner;
            someone_win = true
        }else if (playerID === 2) {
            game_winner = other_player;
            document.getElementById('winner').textContent = 'Zwyciezca: ' + someone_win;
            someone_win = true
        }*/
    }
}
function alerted(message) {
    return new Promise((resolve) => {
        alert(message);
        resolve();
    });
}

