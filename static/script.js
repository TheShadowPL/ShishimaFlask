const board = document.querySelectorAll('.pit');
const playerTurn = document.getElementById('playerTurn');
const winner = document.getElementById('winner');
let currentPlayer = 1;
let stones = [6, 6];

function resetBoard() {
	stones = [6, 6];
	currentPlayer = 1;
	board.forEach(pit => {
		pit.innerHTML = '';
		pit.style.backgroundColor = '#ccc';
	});
	playerTurn.innerHTML = `Player ${currentPlayer}'s Turn`;
	winner.innerHTML = '';
}

function checkGameOver() {
	const pits = Array.from(document.querySelectorAll('.pit'));
	const nonEmptyPits = pits.filter(pit => pit.innerHTML !== '');
	if (nonEmptyPits.length === 0) {
		winner.innerHTML = 'Game Over! It\'s a tie.';
	}
}

function updateBoard(pit) {
	const index = Array.from(board).indexOf(pit);
	const playerStones = stones[currentPlayer - 1];
	if (playerStones > 0) {
		pit.innerHTML = '<i class="fas fa-seedling"></i>';
		pit.style.backgroundColor = `hsl(${360 / 7 * (currentPlayer % 7)}, 75%, 50%)`;
		stones[currentPlayer - 1]--;
		setTimeout(() => {
			let nextPit = board[(index + 1) % 9];
			let count = 1;
			while (nextPit.innerHTML === '' && count < 9) {
				nextPit.innerHTML = '<i class="fas fa-seedling"></i>';
				nextPit.style.backgroundColor = `hsl(${360 / 7 * (currentPlayer % 7)}, 75%, 50%)`;
				nextPit = board[(index + count + 1) % 9];
				count++;
			}
			if (nextPit.innerHTML === '<i class="fas fa-seedling"></i>') {
				nextPit.innerHTML = '';
				nextPit.style.backgroundColor = '#ccc';
				updateBoard(nextPit);
			} else if (count === 1) {
				nextPit.innerHTML = '';
				nextPit.style.backgroundColor = '#ccc';
			}
			checkGameOver();
			currentPlayer = currentPlayer % 2 + 1;
			playerTurn.innerHTML = `Player ${currentPlayer}'s Turn`;
		}, 100);
	}
}

board.forEach(pit => pit.addEventListener('click', () => updateBoard(pit)));