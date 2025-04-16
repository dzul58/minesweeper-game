import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [gameId, setGameId] = useState(null);
  const [grid, setGrid] = useState([]);
  const [size, setSize] = useState(8);
  const [mines, setMines] = useState(10);
  const [gameState, setGameState] = useState("active");
  const [error, setError] = useState("");

  const API_URL = "http://localhost:3000/api";

  const createNewGame = async () => {
    try {
      const newGameId = Date.now().toString();
      const response = await axios.post(`${API_URL}/games`, {
        gameId: newGameId,
        size,
        mines,
      });

      setGameId(newGameId);
      setGrid(response.data.grid);
      setGameState("active");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Gagal membuat game baru");
    }
  };

  const makeMove = async (row, col) => {
    if (gameState !== "active" || !gameId) return;

    try {
      const response = await axios.post(`${API_URL}/games/move`, {
        gameId,
        row,
        col,
      });

      setGrid(response.data.grid);
      setGameState(response.data.gameState);

      if (response.data.gameState !== "active") {
        setError(`Game over! You ${response.data.gameState}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Gagal melakukan move");
    }
  };

  const getGameState = async () => {
    if (!gameId) return;

    try {
      const response = await axios.get(`${API_URL}/games/${gameId}`);
      setGrid(response.data.grid);
      setGameState(response.data.gameState);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal mendapatkan status game");
    }
  };

  useEffect(() => {
    if (gameId) {
      getGameState();
    }
  }, [gameId]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Minesweeper Game
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ukuran Grid:
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="5"
                  max="20"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Mines:
                <input
                  type="number"
                  value={mines}
                  onChange={(e) => setMines(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  max={size * size - 1}
                />
              </label>
            </div>
            <button
              onClick={createNewGame}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Start New Game
            </button>
          </div>

          {error && (
            <div
              className={`mb-4 p-4 rounded-md ${
                gameState === "won"
                  ? "bg-green-100 text-green-700"
                  : gameState === "lost"
                  ? "bg-red-100 text-red-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              maxWidth: "fit-content",
              margin: "0 auto",
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => makeMove(rowIndex, colIndex)}
                  className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md
                    ${cell === "#" ? "bg-gray-200 hover:bg-gray-300" : ""}
                    ${cell === "*" ? "bg-red-500" : ""}
                    ${cell === " " ? "bg-white" : ""}
                    ${typeof cell === "number" ? "bg-white" : ""}
                  `}
                  disabled={gameState !== "active" || cell !== "#"}
                >
                  {cell === "#" ? "" : cell === "*" ? "💣" : cell}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
