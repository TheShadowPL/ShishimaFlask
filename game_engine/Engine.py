class Engine:
    def __init__(self, state=None, currentPlayer=None):
        if state is not None:
            self.state = state
        else:
            self.state = [1, 1, 0, 1, 0, 2, 0, 2, 2]
        if currentPlayer is not None:
            self.currentPlayer = currentPlayer
        else:
            self.currentPlayer = 1
        print("[i] Pola są indeksowane (0-8)")

    def movePawn(self, currentPlayer, fromPos: int, toPos: int):
        try:
            print(currentPlayer, fromPos, toPos)
            tmp = self.state[fromPos]
            self.state[fromPos] = self.state[toPos]
            self.state[toPos] = tmp

            if currentPlayer == 1:
                self.currentPlayer = 2
            else:
                self.currentPlayer = 1

        except:
            print("Nie mozna bylo przeniesc pionka")
            return False

        return True

    def to_dict(self):
        return {
            'state': self.state,
            'currentPlayer': self.currentPlayer,
        }

    def checkWin(self):
        for i in range(3):
            if self.state[i*3] == self.state[i*3 + 1] == self.state[i*3 + 2] != 0:
                return self.state[i*3]


        for i in range(3):
            if self.state[i] == self.state[i + 3] == self.state[i + 6] != 0:
                return self.state[i]

        return None
