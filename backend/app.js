// app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Controllers = require("./controllers/controller");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Create controller instance
const gameController = new Controllers();

// Routes
app.post("/api/games", (req, res) => {
  gameController.createGame(req, res);
});

app.post("/api/games/move", (req, res) => {
  gameController.makeMove(req, res);
});

app.get("/api/games/:gameId", (req, res) => {
  gameController.getGameState(req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`Minesweeper server running on port ${PORT}`);
});

module.exports = app;
