# Minesweeper API

A RESTful API for playing the classic Minesweeper game.

## Setup and Installation

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npx nodemon app.js
```

The server will run on port 3000 by default.

## API Endpoints

### Create a New Game

```
POST /api/games
```

Request body:

```json
{
  "gameId": "unique-game-id",
  "size": 10,
  "mines": 15
}
```

- `gameId`: A unique identifier for the game (string)
- `size`: The size of the grid (n x n) (number)
- `mines`: The number of mines to place (number, must be less than size^2)

Response:

```json
{
  "message": "Game created successfully",
  "gameId": "unique-game-id",
  "size": 10,
  "mines": 15,
  "grid": [
    ["#", "#", "#", "#", ...],
    ["#", "#", "#", "#", ...],
    ...
  ]
}
```

### Make a Move

```
POST /api/games/move
```

Request body:

```json
{
  "gameId": "unique-game-id",
  "row": 5,
  "col": 3
}
```

- `gameId`: The game identifier (string)
- `row`: Row coordinate (number, 0-indexed)
- `col`: Column coordinate (number, 0-indexed)

Response:

```json
{
  "message": "Move successful",
  "gameState": "active",
  "grid": [
    ["#", "#", "#", "#", ...],
    ["#", "1", "1", "#", ...],
    ["#", "1", " ", "#", ...],
    ...
  ]
}
```

If the game is over:

```json
{
  "message": "Game over. You won/lost.",
  "gameState": "won/lost",
  "grid": [
    ["#", "#", "#", "#", ...],
    ["#", "1", "1", "#", ...],
    ["*", "*", "*", "#", ...],
    ...
  ]
}
```

### Get Game State

```
GET /api/games/:gameId
```

Response:

```json
{
  "gameId": "unique-game-id",
  "size": 10,
  "mines": 15,
  "gameState": "active",
  "grid": [
    ["#", "#", "#", "#", ...],
    ["#", "1", "1", "#", ...],
    ["#", "1", " ", "#", ...],
    ...
  ]
}
```

## Grid Representation

- `#`: Unrevealed cell
- `*`: Mine (shown only when game is over)
- ` ` (space): Revealed cell with no adjacent mines
- `1-8`: Revealed cell with 1-8 adjacent mines

## Game States

- `active`: Game is in progress
- `won`: All non-mine cells have been revealed
- `lost`: A mine has been revealed

## Error Handling

The API returns appropriate HTTP status codes:

- 400 Bad Request: Invalid parameters
- 404 Not Found: Game not found
- 500 Internal Server Error: Server-side error

## Example Usage

1. Create a new game:

```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"gameId": "game1", "size": 5, "mines": 5}'
```

2. Make a move:

```bash
curl -X POST http://localhost:3000/api/games/move \
  -H "Content-Type: application/json" \
  -d '{"gameId": "game1", "row": 0, "col": 0}'
```

3. Get game state:

```bash
curl http://localhost:3000/api/games/game1
```
