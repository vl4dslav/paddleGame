import { fromEvent, interval, map } from "rxjs";
import { draw, fieldSize } from "./draw";

export function createGame(socket, name) {
  const paddles = {
    bottomPaddle: {
      me: true,
      info: {},
    },
    topPaddle: {
      me: false,
      info: {},
    },
  };
  socket.emit(`${name} positioning`, "bottom");
  socket.on(`${name} positioning`, (position) => {
    if (position === "top") {
      paddles.bottomPaddle.me = false;
      paddles.topPaddle.me = true;
    }
  });

  const plr1 = document.querySelector(".plr1");
  const plr2 = document.querySelector(".plr2");

  const points = {
    plr1: 0,
    plr2: 0,
  };

  const fps = 60;

  const defaultValues = {
    ballCoordinates: {
      x: fieldSize.width / 2,
      y: fieldSize.height / 2,
    },
    ballSpeed: {
      x: ((Math.random() * 2 - 1) * 250) / fps,
      y: 230 / fps,
    },
    paddleTop: {
      height: 20,
      width: 100,
      x: fieldSize.width / 2,
      y: 20,
    },
    paddleBottom: {
      height: 20,
      width: 100,
      x: fieldSize.width / 2,
      y: fieldSize.height - 20,
    },
  };

  const ballCoordinates = Object.assign({}, defaultValues.ballCoordinates);
  const ballSpeed = Object.assign({}, defaultValues.ballSpeed);
  Object.assign(paddles.topPaddle.info, defaultValues.paddleTop);
  Object.assign(paddles.bottomPaddle.info, defaultValues.paddleBottom);

  const refresh = () => {
    defaultValues.ballSpeed.x = ((Math.random() * 2 - 1) * 250) / fps;
    Object.assign(ballCoordinates, defaultValues.ballCoordinates);
    Object.assign(ballSpeed, defaultValues.ballSpeed);
    Object.assign(paddles.topPaddle.info, defaultValues.paddleTop);
    Object.assign(paddles.bottomPaddle.info, defaultValues.paddleBottom);
  };

  const paddleSpeed = 800 / fps;

  const ballInBotPaddle = () => {
    const bPaddle = paddles.bottomPaddle.info;
    if (
      bPaddle.x + bPaddle.width / 2 > ballCoordinates.x &&
      bPaddle.x - bPaddle.width / 2 < ballCoordinates.x
    )
      return ballCoordinates.y > bPaddle.y - bPaddle.height / 2 &&
        ballCoordinates.y < bPaddle.y + bPaddle.height / 2
        ? true
        : false;
    return false;
  };

  const ballInTopPaddle = () => {
    const tPaddle = paddles.topPaddle.info;
    if (
      tPaddle.x + tPaddle.width / 2 > ballCoordinates.x &&
      tPaddle.x - tPaddle.width / 2 < ballCoordinates.x
    )
      return ballCoordinates.y > tPaddle.y - tPaddle.height / 2 &&
        ballCoordinates.y < tPaddle.y + tPaddle.height / 2
        ? true
        : false;
    return false;
  };

  const accelerationPart = (paddle) => {
    const part = paddle.width / 5;
    switch (Math.floor((paddle.x - ballCoordinates.x) / part)) {
      case -1:
        ballSpeed.y *= 1.3;
        ballSpeed.x = Math.abs(1.2 * ballSpeed.x);
        break;
      case -2:
        ballSpeed.y *= 1.1;
        ballSpeed.x = Math.abs(1.5 * ballSpeed.x);
        break;
      case -3:
        ballSpeed.x = Math.abs(2.5 * ballSpeed.x);
        break;
      case 1:
        ballSpeed.y *= 1.3;
        ballSpeed.x = -Math.abs(1.2 * ballSpeed.x);
        break;
      case 2:
        ballSpeed.y *= 1.1;
        ballSpeed.x = -Math.abs(1.5 * ballSpeed.x);
        break;
      case -3:
        ballSpeed.x = -Math.abs(2.5 * ballSpeed.x);
        break;
      case 0:
        ballSpeed.y *= 1.5;
        break;
    }
  };

  const paddleTransition = {
    makeTransition: false,
    value: 0,
  };

  fromEvent(document, "keydown")
    .pipe(map((event) => event.key))
    .subscribe((key) => {
      if (key === "d" || key === "ArrowRight") {
        paddleTransition.makeTransition = true;
        paddleTransition.value = paddleSpeed;
      }
      if (key === "a" || key === "ArrowLeft") {
        paddleTransition.makeTransition = true;
        paddleTransition.value = -paddleSpeed;
      }
    });

  fromEvent(document, "keyup")
    .pipe(map((event) => event.key))
    .subscribe((key) => {
      if (
        key === "d" ||
        key === "ArrowRight" ||
        key === "a" ||
        key === "ArrowLeft"
      )
        paddleTransition.makeTransition = false;
    });

  interval(1000 / fps).subscribe(() => {
    let ruleTheBall = false;
    let myPaddle, opponentPaddle;
    if (paddles.bottomPaddle.me) {
      myPaddle = paddles.bottomPaddle.info;
      opponentPaddle = paddles.topPaddle.info;
      ruleTheBall = true;
    } else {
      myPaddle = paddles.topPaddle.info;
      opponentPaddle = paddles.bottomPaddle.info;
    }
    if (paddleTransition.makeTransition) myPaddle.x += paddleTransition.value;
    socket.emit(`${name} newPosition`, `${myPaddle.x}`);
    socket.on(`${name} newPosition`, (opponentX) => {
      opponentPaddle.x = +opponentX;
    });
    draw(ballCoordinates, myPaddle, opponentPaddle);
    if (ruleTheBall) {
      socket.emit(
        `${name} ball`,
        `${ballCoordinates.x} ${ballCoordinates.y} ${ballSpeed.x} ${ballSpeed.y}`
      );
    } else {
      socket.on(`${name} ball`, (msg) => {
        ballCoordinates.x = +msg.split(" ")[0];
        ballCoordinates.y = +msg.split(" ")[1];
        ballSpeed.x = +msg.split(" ")[2];
        ballSpeed.y = +msg.split(" ")[3];
      });
    }
    if (ballCoordinates.x > fieldSize.width || ballCoordinates.x < 0)
      ballSpeed.x *= -1;

    if (ballCoordinates.y > fieldSize.height || ballCoordinates.y < 0) {
      if (ballCoordinates.y > fieldSize.height) points.plr1++;
      if (ballCoordinates.y < 0) points.plr2++;
      plr1.textContent = points.plr1;
      plr2.textContent = points.plr2;
      refresh();
    }
    // ballSpeed.y *= -1;
    if (ballInTopPaddle()) {
      accelerationPart(paddles.topPaddle.info);
      ballSpeed.y *= -1;
    }
    if (ballInBotPaddle()) {
      accelerationPart(paddles.bottomPaddle.info);
      ballSpeed.y *= -1;
    }
    ballCoordinates.x += ballSpeed.x;
    ballCoordinates.y += ballSpeed.y;
  });
}
