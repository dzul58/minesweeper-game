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
          error: expect.stringContaining("mines"),
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
  });
});
