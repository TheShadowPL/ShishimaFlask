from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
from game_engine.Engine import Engine
import json

app = Flask(__name__)

app.static_folder = 'static'

games = []

def generate_unique_id(lobby_title):
    now = datetime.now()
    unique_id = now.strftime("%d_%m_%H_%M_%S") + '_' + lobby_title
    return unique_id

@app.route('/')
def index():
    return render_template('index.html', games=games)

@app.route('/start_game', methods=['POST'])
def start_game():
    if request.method == 'POST':
        game_data = request.json
        playerName = game_data.get('playerName')
        lobbyTitle = game_data.get('lobbyTitle')
        pieceColor = game_data.get('pieceColor')
        OwnerNumber = 1
        OtherNumber = 2
        default_state = [1, 1, 0, 1, 0, 2, 0, 2, 2]
        lobby_id = generate_unique_id(lobbyTitle)
        otherPlayerName = 'none'
        otherPlayerPieceColor = 'none'
        winner = 'none'
        currentPlayer = 1
        new_game = {
            "lobbyName": lobbyTitle,
            "players": 1,
            "hostPieceColor": pieceColor,
            "hostName": playerName,
            "lobbyID": lobby_id,
            "otherPlayerName": otherPlayerName,
            "otherPlayerPieceColor": otherPlayerPieceColor,
            "default_state": default_state,
            "winner": winner,
            "playerTurn": playerName,
            "currentPlayer": currentPlayer,
            "engine": Engine(state=default_state, currentPlayer=OwnerNumber)
        }
        games.append(new_game)
        return redirect(url_for('game_page', lobby_id=lobby_id, player_name=playerName, pieceColor=pieceColor))

@app.route('/check_lobby', methods=['GET'])
def check_lobby():
    lobby_name = request.args.get('lobbyName')
    exists = any(game['lobbyName'] == lobby_name for game in games)
    return jsonify({'exists': exists})

@app.route('/game.html')
def game_page():
    lobby_id = request.args.get('lobby_id')
    player_name = request.args.get('player_name')
    pieceColor = request.args.get('pieceColor')
    return render_template('game.html', lobby_id=lobby_id, player_name=player_name, pieceColor=pieceColor)

@app.route('/games')
def get_games():
    games_list = [
        {
            "lobbyName": game["lobbyName"],
            "players": game["players"],
            "hostPieceColor": game["hostPieceColor"],
            "hostName": game["hostName"],
            "lobbyID": game["lobbyID"],
            "otherPlayerName": game["otherPlayerName"],
            "otherPlayerPieceColor": game["otherPlayerPieceColor"],
            "playerTurn": game["playerTurn"],
        }
        for game in games
    ]
    return jsonify(games_list)


@app.route('/join_game', methods=['POST'])
def join_game():
    if request.method == 'POST':
        game_data = request.json
        playerName = game_data.get('playerName')
        lobbyName = game_data.get('lobbyName')
        pieceColor = game_data.get('pieceColor')
        lobbyID = game_data.get('lobbyID')


        selected_game = None
        for game in games:
            if game['lobbyID'] == lobbyID:
                selected_game = game
                break

        if selected_game is None:
            return jsonify({'error': 'Lobby o podanym ID nie istnieje.'}), 404

        if selected_game['players'] >= 2:
            return jsonify({'error': 'Lobby jest pełne.'}), 403

        selected_game['players'] += 1
        selected_game['otherPlayerName'] = playerName
        selected_game['otherPlayerPieceColor'] = pieceColor



        return redirect(url_for('game_page', lobby_id=lobbyID, player_name=playerName, pieceColor=pieceColor))


@app.route('/make_move', methods=['POST'])
def make_move():
    data = request.get_json()
    fromPos = data.get('fromPos')
    toPos = data.get('toPos')
    currentPlayer = data.get('currentPlayer')
    print(currentPlayer)
    lobby_id = data.get('lobby_id')
    game = next((game for game in games if game['lobbyID'] == lobby_id), None)
    if game is not None:
        engine = game['engine']
        success = engine.movePawn(currentPlayer, fromPos, toPos)
        print(success)
        if success:
            print(currentPlayer)
            game['default_state'] = engine.state
            winner = engine.checkWin()
            print('winner',winner)
            if winner is not None:
                game['winner'] = winner
                if winner == 1:
                    winner_name = game['hostName']
                elif winner == 2:
                    winner_name = game['otherPlayerName']
                else:
                    winner_name = str(winner)
                with open('/var/www/flaskapp/flaskapp/db.json', 'r+') as file:
                    data = json.load(file)
                    player = next((player for player in data['players_won'] if player['player'] == winner_name), None)
                    if player is not None:
                        player['games_won'] += 1
                    else:
                        data['players_won'].append({'player': winner_name, 'games_won': 1})
                    file.seek(0)
                    json.dump(data, file)
                jsonify({'status': 'OK', 'state': engine.state, 'currentPlayer': engine.currentPlayer})
            if currentPlayer == 1:
                game['currentPlayer'] = 2
                game['playerTurn'] = game['otherPlayerName']
            if currentPlayer == 2:
                game['currentPlayer'] = 1
                game['playerTurn'] = game['hostName']
            return jsonify({'status': 'OK', 'state': engine.state, 'currentPlayer': engine.currentPlayer})
        else:
            return jsonify({'error': 'Invalid move'}), 400
    else:
        return jsonify({'error': 'Game not found'}), 404

@app.route('/get_game_data')
def get_game_data():
    lobby_id = request.args.get('lobby_id')
    game = next((game for game in games if game['lobbyID'] == lobby_id), None)
    if game is not None:
        game_data = game.copy()
        game_data['engine'] = game_data['engine'].to_dict()
        return jsonify(game_data)
    else:
        return jsonify({'error': 'Game not found'}), 404

@app.route('/end_game', methods=['POST'])
def end_game():
    data = request.get_json()
    lobby_id = data.get('lobby_id')
    game = next((game for game in games if game['lobbyID'] == lobby_id), None)
    if game is not None:
        games.remove(game)
        return jsonify({'status': 'OK'})
    else:
        return jsonify({'error': 'Game not found'}), 404

@app.route('/winners', methods=['GET'])
def get_winners():
    with open('/var/www/flaskapp/flaskapp/db.json', 'r') as file:
        data = json.load(file)
    return jsonify(data['players_won'])

if __name__ == '__main__':
    app.run(debug=True)
