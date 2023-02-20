const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const bodyParser = require("body-parser");

const games = [];
const startedGames = [];

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "dist")));

const hasNotGame = (arr, name) =>
  arr.reduce((accum, game) => (game === name ? false : accum), true);

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("createGame", (name) => {
    if (hasNotGame(games, name) && hasNotGame(startedGames, name)) {
      console.log(name);
      socket.broadcast.emit("gameCreated", name);
    } else if (hasNotGame(startedGames, name)) {
      games.splice(games.indexOf(name), 1);
      startedGames.push(name);
      socket.broadcast.emit(`${name} playerJoined`);
      socket.broadcast.emit(`${name} isn't available`);
      socket.on(`${name} positioning`, () =>
        socket.broadcast.emit(`${name} positioning`, "top")
      );
      socket.on(`${name} newPosition`, (newX) => {
        socket.broadcast.emit(`${name} newPosition`, newX);
      });
      socket.on(`${name} ball`, (msg) => {
        socket.broadcast.emit(`${name} ball`, msg);
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
