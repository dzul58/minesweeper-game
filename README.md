# Minesweeper Game

A Minesweeper application with React frontend and Express backend.

## Project Structure

```
minesweeper-game/
├── frontend/            # React application
│   ├── src/             # Frontend source code
│   └── ...
└── backend/             # Express server
    ├── controllers/     # Game logic controllers
    ├── tests/           # Unit tests
    └── app.js           # Application entry point
```

## Requirements

- npm

## How to Run the Application

### Running the Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the server:

   ```bash
   npx nodemon app.js
   ```

   The server will run at http://localhost:3000

### Running the Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the application:

   ```bash
   npm run dev
   ```

   The frontend will run at http://localhost:5173

## API Endpoints

### 1. Create a New Game

- **URL**: `POST /api/games`
- **Body**:
  ```json
  {
    "gameId": "unique-id",
    "size": 8,
    "mines": 10
  }
  ```
- **Response**:
  ```json
  {
    "message": "Game created successfully",
    "gameId": "unique-id",
    "size": 8,
    "mines": 10,
    "grid": [...]
  }
  ```

### 2. Make a Move

- **URL**: `POST /api/games/move`
- **Body**:
  ```json
  {
    "gameId": "unique-id",
    "row": 0,
    "col": 0
  }
  ```
- **Response**:
  ```json
  {
    "message": "Move successful",
    "gameState": "active",
    "grid": [...]
  }
  ```

### 3. Get Game State

- **URL**: `GET /api/games/:gameId`
- **Response**:
  ```json
  {
    "gameId": "unique-id",
    "size": 8,
    "mines": 10,
    "gameState": "active",
    "grid": [...]
  }
  ```

## How to Play

1. Open the frontend in your browser: http://localhost:5173
2. Set the grid size and number of mines as desired
3. Click "Start New Game" to begin
4. Click on cells to reveal their contents:
   - Empty cells: will reveal surrounding cells
   - Numbers: indicate how many mines are adjacent to the cell
   - Mine: Game over!

## Running Tests

### Backend Tests

The backend uses Jest for testing. To run the tests:

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies (if not already installed):

   ```bash
   npm install
   ```

3. Run the tests:
   ```bash
   npm test
   ```

This will run all tests in the `tests` directory, including:

- Game creation tests
- Game move tests
- Grid initialization tests

The tests verify that:

- Games can be created with valid parameters
- Invalid game parameters are rejected
- Moves are processed correctly
- Winning and losing conditions work as expected
- The grid is properly initialized with the correct number of mines

### Frontend Tests

The frontend also uses Jest for testing React components. To run the tests:

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):

   ```bash
   npm install
   ```

3. Run the tests:
   ```bash
   npm test
   ```

The frontend tests verify:

- Component rendering
- Game creation functionality
- Move handling
- Error message display
- Grid size and mines count updates
- User interaction with the game board

The tests use React Testing Library to simulate user interactions and verify component behavior.

## Features

- Customizable game grid size
- Recursive reveal algorithm for empty cells
- Responsive UI
- Visual feedback for win/lose conditions

## Technologies Used

### Frontend

- React
- Axios for HTTP requests
- Tailwind CSS for styling
- Jest and React Testing Library for testing

### Backend

- Express.js
- Jest for testing
