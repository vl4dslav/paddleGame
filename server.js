const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "dist")));

io.on("connection", (socket) => {
  socket.on("positioning", () => socket.broadcast.emit("positioning", "top"));
  socket.on("newPosition", (newX) => {
    socket.broadcast.emit("newPosition", newX);
  });
  socket.on("ball", (msg) => {
    socket.broadcast.emit("ball", msg);
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
