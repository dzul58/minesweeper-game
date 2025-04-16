import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import axios from "axios";
import App from "./App";

// Mock axios
vi.mock("axios");

describe("App Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it("renders game title and controls", () => {
    render(<App />);

    expect(screen.getByText("Minesweeper Game")).toBeInTheDocument();
    expect(screen.getByText("Start New Game")).toBeInTheDocument();
    expect(screen.getByLabelText("Grid Size:")).toBeInTheDocument();
    expect(screen.getByLabelText("Number of Mines:")).toBeInTheDocument();
  });

  it("creates new game when Start New Game button is clicked", async () => {
    const mockResponse = {
      data: {
        grid: Array(8)
          .fill()
          .map(() => Array(8).fill("#")),
        gameState: "active",
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse);

    render(<App />);

    fireEvent.click(screen.getByText("Start New Game"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/games",
        expect.objectContaining({
          gameId: expect.any(String),
          size: 8,
          mines: 10,
        })
      );
    });
  });

  it("handles game move correctly", async () => {
    // Mock for createNewGame
    const mockCreateResponse = {
      data: {
        grid: Array(8)
          .fill()
          .map(() => Array(8).fill("#")),
        gameState: "active",
      },
    };

    // Mock for makeMove
    const mockMoveResponse = {
      data: {
        grid: Array(8)
          .fill()
          .map(() => Array(8).fill("#")),
        gameState: "active",
      },
    };

    // Setup mocks
    axios.post.mockImplementation((url, data) => {
      if (url === "http://localhost:3000/api/games") {
        return Promise.resolve(mockCreateResponse);
      } else if (url === "http://localhost:3000/api/games/move") {
        return Promise.resolve(mockMoveResponse);
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<App />);

    // Create new game
    fireEvent.click(screen.getByText("Start New Game"));

    // Wait for the game to be created
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/games",
        expect.anything()
      );
    });

    // Find and click a cell
    const buttons = screen.getAllByRole("button");
    // Skip the "Start New Game" button
    const firstCell = buttons.find((btn) => btn.textContent === "");

    if (firstCell) {
      fireEvent.click(firstCell);

      // Verify that makeMove API was called
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "http://localhost:3000/api/games/move",
          expect.objectContaining({
            gameId: expect.any(String),
            row: expect.any(Number),
            col: expect.any(Number),
          })
        );
      });
    }
  });

  it("displays error message when game creation fails", async () => {
    const errorMessage = "Gagal membuat game baru";
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: errorMessage,
        },
      },
    });

    render(<App />);

    fireEvent.click(screen.getByText("Start New Game"));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("updates grid size and mines count correctly", () => {
    render(<App />);

    const sizeInput = screen.getByLabelText("Grid Size:");
    const minesInput = screen.getByLabelText("Number of Mines:");

    fireEvent.change(sizeInput, { target: { value: "10" } });
    fireEvent.change(minesInput, { target: { value: "15" } });

    expect(sizeInput.value).toBe("10");
    expect(minesInput.value).toBe("15");
  });
});
