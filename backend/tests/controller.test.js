// tests/controller.test.js
const Controllers = require("../controllers/controller");

// Mock Express request and response objects
const mockReq = (body = {}, params = {}) => ({
  body,
  params,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Minesweeper Controller", () => {
  let controller;

  beforeEach(() => {
    controller = new Controllers();
  });

  describe("createGame", () => {
    test("should create a new game with valid parameters", () => {
      const req = mockReq({ gameId: "test1", size: 5, mines: 5 });
      const res = mockRes();

      controller.createGame(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.gameId).toBe("test1");
      expect(responseData.size).toBe(5);
      expect(responseData.mines).toBe(5);
      expect(responseData.grid).toBeDefined();
    });

    test("should reject if mines >= size^2", () => {
      const req = mockReq({ gameId: "test2", size: 5, mines: 25 });
      const res = mockRes();

      controller.createGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining(
            "Number of mines must be less than the total number of cells"
          ),
        })
      );
    });

    test("should reject if required fields are missing", () => {
      const req = mockReq({ size: 5, mines: 5 }); // missing gameId
      const res = mockRes();

      controller.createGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining(
            "Size, mines, and gameId are required"
          ),
        })
      );
    });

    test("should reject if size exceeds 20", () => {
      const req = mockReq({ gameId: "test3", size: 21, mines: 5 });
      const res = mockRes();

      controller.createGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Grid size cannot exceed 20"),
        })
      );
    });
  });

  describe("makeMove", () => {
    test("should handle a valid move", () => {
      // First create a game
      const createReq = mockReq({ gameId: "test3", size: 5, mines: 5 });
      const createRes = mockRes();
      controller.createGame(createReq, createRes);

      // Manually modify the game grid to test a specific scenario
      const game = controller.games.get("test3");
      game.grid = Array(5)
        .fill()
        .map(() => Array(5).fill(0)); // Clear mines
      game.grid[2][2] = -1; // Place a single mine
      controller.updateAdjacentCells(game.grid, 2, 2, 5); // Update adjacent cells

      // Make a move
      const moveReq = mockReq({ gameId: "test3", row: 0, col: 0 });
      const moveRes = mockRes();
      controller.makeMove(moveReq, moveRes);

      expect(moveRes.status).toHaveBeenCalledWith(200);
      expect(moveRes.json).toHaveBeenCalled();
      const responseData = moveRes.json.mock.calls[0][0];
      expect(responseData.gameState).toBe("active");
    });

    test("should handle revealing a mine", () => {
      // First create a game
      const createReq = mockReq({ gameId: "test4", size: 5, mines: 5 });
      const createRes = mockRes();
      controller.createGame(createReq, createRes);

      // Manually modify the game grid to test a specific scenario
      const game = controller.games.get("test4");
      game.grid = Array(5)
        .fill()
        .map(() => Array(5).fill(0)); // Clear mines
      game.grid[2][2] = -1; // Place a single mine
      controller.updateAdjacentCells(game.grid, 2, 2, 5); // Update adjacent cells

      // Make a move that reveals the mine
      const moveReq = mockReq({ gameId: "test4", row: 2, col: 2 });
      const moveRes = mockRes();
      controller.makeMove(moveReq, moveRes);

      expect(moveRes.status).toHaveBeenCalledWith(200);
      expect(moveRes.json).toHaveBeenCalled();
      const responseData = moveRes.json.mock.calls[0][0];
      expect(responseData.gameState).toBe("lost");
    });

    test("should reject invalid coordinates", () => {
      // First create a game
      const createReq = mockReq({ gameId: "test5", size: 5, mines: 5 });
      const createRes = mockRes();
      controller.createGame(createReq, createRes);

      // Make a move with invalid coordinates
      const moveReq = mockReq({ gameId: "test5", row: 10, col: 10 });
      const moveRes = mockRes();
      controller.makeMove(moveReq, moveRes);

      expect(moveRes.status).toHaveBeenCalledWith(400);
      expect(moveRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Invalid coordinates"),
        })
      );
    });

    test("should reject move if cell already revealed", () => {
      // First create a game
      const createReq = mockReq({ gameId: "test6", size: 5, mines: 5 });
      const createRes = mockRes();
      controller.createGame(createReq, createRes);

      // Manually modify the game grid to avoid mines
      const game = controller.games.get("test6");
      game.grid = Array(5)
        .fill()
        .map(() => Array(5).fill(0)); // Clear mines

      // Make a first valid move
      const moveReq1 = mockReq({ gameId: "test6", row: 0, col: 0 });
      const moveRes1 = mockRes();
      controller.makeMove(moveReq1, moveRes1);

      // Try to reveal the same cell again
      const moveReq2 = mockReq({ gameId: "test6", row: 0, col: 0 });
      const moveRes2 = mockRes();
      controller.makeMove(moveReq2, moveRes2);

      expect(moveRes2.status).toHaveBeenCalledWith(400);
      expect(moveRes2.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Cell already revealed"),
        })
      );
    });

    test("should reject moves on a completed game", () => {
      // First create a game
      const createReq = mockReq({ gameId: "test7", size: 5, mines: 5 });
      const createRes = mockRes();
      controller.createGame(createReq, createRes);

      // Manually set the game state to lost
      const game = controller.games.get("test7");
      game.gameState = "lost";

      // Try to make a move
      const moveReq = mockReq({ gameId: "test7", row: 0, col: 0 });
      const moveRes = mockRes();
      controller.makeMove(moveReq, moveRes);

      expect(moveRes.status).toHaveBeenCalledWith(400);
      expect(moveRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Game is already over"),
        })
      );
    });
  });

  describe("getGameState", () => {
    test("should retrieve the current game state", () => {
      // First create a game
      const createReq = mockReq({ gameId: "test8", size: 5, mines: 5 });
      const createRes = mockRes();
      controller.createGame(createReq, createRes);

      // Get game state
      const getReq = mockReq({}, { gameId: "test8" });
      const getRes = mockRes();
      controller.getGameState(getReq, getRes);

      expect(getRes.status).toHaveBeenCalledWith(200);
      expect(getRes.json).toHaveBeenCalled();
      const responseData = getRes.json.mock.calls[0][0];
      expect(responseData.gameId).toBe("test8");
      expect(responseData.size).toBe(5);
      expect(responseData.mines).toBe(5);
      expect(responseData.gameState).toBe("active");
      expect(responseData.grid).toBeDefined();
    });

    test("should return 404 for non-existing game", () => {
      const getReq = mockReq({}, { gameId: "nonexistent" });
      const getRes = mockRes();
      controller.getGameState(getReq, getRes);

      expect(getRes.status).toHaveBeenCalledWith(404);
      expect(getRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Game not found"),
        })
      );
    });
  });

  describe("Grid initialization", () => {
    test("should create grid with correct dimensions", () => {
      const size = 8;
      const mines = 10;
      const game = controller.initializeGrid(size, mines);

      expect(game.grid.length).toBe(size);
      expect(game.grid[0].length).toBe(size);
    });

    test("should place correct number of mines", () => {
      const size = 8;
      const mines = 10;
      const game = controller.initializeGrid(size, mines);

      let mineCount = 0;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (game.grid[i][j] === -1) {
            mineCount++;
          }
        }
      }

      expect(mineCount).toBe(mines);
    });

    test("should initialize revealed array correctly", () => {
      const size = 8;
      const mines = 10;
      const game = controller.initializeGrid(size, mines);

      expect(game.revealed.length).toBe(size);
      expect(game.revealed[0].length).toBe(size);

      // All cells should be unrevealed initially
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          expect(game.revealed[i][j]).toBe(false);
        }
      }
    });
  });

  describe("recursiveReveal", () => {
    test("should reveal connected empty cells", () => {
      // Create a game with a controlled grid
      const size = 5;
      const game = {
        size,
        grid: [
          [0, 1, 1, 1, 0],
          [1, 1, -1, 1, 0],
          [1, -1, 2, 1, 0],
          [1, 1, 1, 1, 0],
          [0, 0, 0, 0, 0],
        ],
        revealed: Array(size)
          .fill()
          .map(() => Array(size).fill(false)),
        revealedCount: 0,
        totalToReveal: 23, // 25 total cells - 2 mines
      };

      // Reveal a cell at the corner that should trigger recursive reveals
      controller.recursiveReveal(game, 0, 0);

      // Check that the empty cell and its neighbors are revealed
      expect(game.revealed[0][0]).toBe(true);

      // Check that recursive reveal occurred in the appropriate direction
      expect(game.revealedCount).toBeGreaterThan(1);
    });
  });

  describe("getVisibleGrid", () => {
    test("should show the correct visible grid", () => {
      // Create a game with a controlled grid
      const size = 3;
      const game = {
        size,
        grid: [
          [0, 1, -1],
          [1, 2, 1],
          [-1, 1, 0],
        ],
        revealed: [
          [true, true, false],
          [true, false, false],
          [false, false, true],
        ],
      };

      const visibleGrid = controller.getVisibleGrid(game);

      // Check revealed cells
      expect(visibleGrid[0][0]).toBe(" "); // Empty cell shows as space
      expect(visibleGrid[0][1]).toBe("1"); // Number cell shows as number
      expect(visibleGrid[2][2]).toBe(" "); // Empty cell (0) shows as space

      // Check unrevealed cells
      expect(visibleGrid[0][2]).toBe("#"); // Unrevealed mine
      expect(visibleGrid[1][1]).toBe("#"); // Unrevealed number

      // Check with showMines=true
      const visibleGridWithMines = controller.getVisibleGrid(game, true);
      expect(visibleGridWithMines[0][2]).toBe("*"); // Now shows mine
      expect(visibleGridWithMines[2][0]).toBe("*"); // Now shows mine
    });
  });
});
