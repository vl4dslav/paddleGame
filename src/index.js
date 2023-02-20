import { createGame } from "./game";
import "./styles/main.scss";

const socket = io();
let insideGame = false;
const pointsElem = document.querySelector(".points");

const deleteList = () =>
  document.body.removeChild(document.querySelector(".game-list"));

const waiting = () => {
  pointsElem.innerText = "Waiting an opponent";
};

const creatingPoints = () => {
  pointsElem.innerHTML = `<div class="plr1">0</div>
  <div class="plr2">0</div>`;
};

const createCanvas = () => {
  const canvas = document.createElement("canvas");
  document.querySelector("canvas").appendChild(canvas);
};

const form = document.getElementById("game-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  waiting();
  createCanvas();
  const input = document.getElementById("game-name");
  socket.emit("createGame", input.value);
  form.style.display = "none";
  insideGame = true;
  deleteList();
  createGame(socket, input.value);
  socket.on(`${input.value} playerJoined`, () => creatingPoints());
});

socket.on("gameCreated", (name) => {
  creatingPoints();
  createCanvas();
  const ul = document.querySelector("ul.game-list");
  if (!insideGame) {
    console.log(ul);
    const li = document.createElement("li");
    li.classList.add("game-list-element");
    li.innerText = name;
    li.addEventListener("click", () => {
      insideGame = true;
      socket.emit("createGame", name);
      form.style.display = "none";
      deleteList();
      createGame(socket, name);
    });
    ul.appendChild(li);
    socket.on(`${name} isn't available`, () => {
      ul.children.removeChild(li);
    });
  }
});
