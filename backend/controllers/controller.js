class Controllers {
  constructor() {
    this.games = new Map(); // Store active games
  }

  /**
   * Initialize a new game with custom grid size and mines
   */
  createGame(req, res) {
    try {
      const { size, mines, gameId } = req.body;

      // Input validation
      if (!size || !mines || !gameId) {
        return res
          .status(400)
          .json({ error: "Size, mines, and gameId are required" });
      }

      if (typeof size !== "number" || size <= 0) {
        return res
          .status(400)
          .json({ error: "Size must be a positive number" });
      }

      if (typeof mines !== "number" || mines <= 0) {
        return res
          .status(400)
          .json({ error: "Mines must be a positive number" });
      }

      if (mines >= size * size) {
        return res.status(400).json({
          error: "Number of mines must be less than the total number of cells",
        });
      }

      // Initialize game grid
      const game = this.initializeGrid(size, mines);
      game.gameState = "active"; // active, won, lost
      game.revealedCount = 0;
      game.totalToReveal = size * size - mines;

      // Store the game
      this.games.set(gameId, game);

      return res.status(201).json({
        message: "Game created successfully",
        gameId,
        size,
        mines,
        grid: this.getVisibleGrid(game),
      });
    } catch (error) {
      console.error("Error creating game:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Make a move in an existing game
   */
  makeMove(req, res) {
    try {
      const { gameId, row, col } = req.body;

      // Input validation
      if (!gameId || row === undefined || col === undefined) {
        return res
          .status(400)
          .json({ error: "GameId, row, and col are required" });
      }

      // Check if game exists
      if (!this.games.has(gameId)) {
        return res.status(404).json({ error: "Game not found" });
      }

      const game = this.games.get(gameId);

      // Check if game is already over
      if (game.gameState !== "active") {
        return res.status(400).json({
          error: `Game is already over. You ${game.gameState}.`,
          grid: this.getVisibleGrid(game, true),
        });
      }

      // Validate coordinates
      if (row < 0 || row >= game.size || col < 0 || col >= game.size) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      // Check if cell is already revealed
      if (game.revealed[row][col]) {
        return res.status(400).json({ error: "Cell already revealed" });
      }

      // Reveal the cell
      const result = this.revealCell(game, row, col);

      // Check if game is over
      if (game.gameState !== "active") {
        return res.status(200).json({
          message: `Game over. You ${game.gameState}.`,
          gameState: game.gameState,
          grid: this.getVisibleGrid(game, true),
        });
      }

      return res.status(200).json({
        message: "Move successful",
        gameState: game.gameState,
        grid: this.getVisibleGrid(game),
      });
    } catch (error) {
      console.error("Error making move:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Get the current state of a game
   */
  getGameState(req, res) {
    try {
      const { gameId } = req.params;

      if (!gameId) {
        return res.status(400).json({ error: "GameId is required" });
      }

      if (!this.games.has(gameId)) {
        return res.status(404).json({ error: "Game not found" });
      }

      const game = this.games.get(gameId);
      const showMines = game.gameState !== "active";

      return res.status(200).json({
        gameId,
        size: game.size,
        mines: game.mines,
        gameState: game.gameState,
        grid: this.getVisibleGrid(game, showMines),
      });
    } catch (error) {
      console.error("Error getting game state:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Initialize grid with random mines
   */
  initializeGrid(size, mines) {
    // Create empty grid
    const grid = Array(size)
      .fill()
      .map(() => Array(size).fill(0));
    const revealed = Array(size)
      .fill()
      .map(() => Array(size).fill(false));

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (grid[row][col] !== -1) {
        grid[row][col] = -1; // -1 represents a mine
        minesPlaced++;

        // Update adjacent cells
        this.updateAdjacentCells(grid, row, col, size);
      }
    }

    return {
      size,
      mines,
      grid,
      revealed,
    };
  }

  /**
   * Update adjacent cells with the number of nearby mines
   */
  updateAdjacentCells(grid, row, col, size) {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    directions.forEach(([dx, dy]) => {
      const newRow = row + dx;
      const newCol = col + dy;

      if (
        newRow >= 0 &&
        newRow < size &&
        newCol >= 0 &&
        newCol < size &&
        grid[newRow][newCol] !== -1
      ) {
        grid[newRow][newCol]++;
      }
    });
  }

  /**
   * Reveal a cell and handle game logic
   */
  revealCell(game, row, col) {
    // Check if it's a mine
    if (game.grid[row][col] === -1) {
      game.gameState = "lost";
      return false;
    }

    // Recursive reveal for empty cells
    this.recursiveReveal(game, row, col);

    // Check if all non-mine cells are revealed
    if (game.revealedCount === game.totalToReveal) {
      game.gameState = "won";
      return true;
    }

    return true;
  }

  /**
   * Recursively reveal empty cells
   */
  recursiveReveal(game, row, col) {
    // Check boundaries and if already revealed
    if (
      row < 0 ||
      row >= game.size ||
      col < 0 ||
      col >= game.size ||
      game.revealed[row][col]
    ) {
      return;
    }

    // Reveal the cell
    game.revealed[row][col] = true;
    game.revealedCount++;

    // If it's an empty cell (0), reveal adjacent cells
    if (game.grid[row][col] === 0) {
      const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];

      directions.forEach(([dx, dy]) => {
        this.recursiveReveal(game, row + dx, col + dy);
      });
    }
  }

  /**
   * Get the visible grid for the player
   */
  getVisibleGrid(game, showMines = false) {
    const visibleGrid = [];

    for (let i = 0; i < game.size; i++) {
      const row = [];
      for (let j = 0; j < game.size; j++) {
        if (game.revealed[i][j]) {
          // Cell is revealed
          row.push(game.grid[i][j] === 0 ? " " : game.grid[i][j].toString());
        } else if (showMines && game.grid[i][j] === -1) {
          // Show mines when game is over
          row.push("*");
        } else {
          // Unrevealed cell
          row.push("#");
        }
      }
      visibleGrid.push(row);
    }

    return visibleGrid;
  }
}

module.exports = Controllers;
