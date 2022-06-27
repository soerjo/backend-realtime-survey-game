import express, { Request, Response } from "express";
import http from "http";
import dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import {
  game_start,
  jawabGame,
  userAnswer,
  userDisconnected,
  userLoggin,
  users,
} from "./userLoggin";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use((req: Request, res: Response) => {
  res.send("server running");
});

server.listen(port, () => console.log(`server running at port: ${port}`));

io.on("connection", socket => {
  socket.on("disconnect", () => {
    userDisconnected(socket.id);
  });

  socket.on("game-start", (answer, cb) => {
    console.log("start the game!", answer);
    const { game, user } = game_start(socket.id);
    socket.to(user.roomid).emit("start", game);
    cb({ game });
    console.log("isi game:", game);
  });

  socket.on("loggin", ({ user, roomid }, cb) => {
    const { team, usersPeserta: users } = userLoggin({
      username: user,
      userid: socket.id,
      roomid: roomid,
    });
    socket.join(roomid);
    socket.to(roomid).emit("user-loggin", users);
    cb({
      users: users,
      myid: socket.id,
      team: team,
    });
    console.log("isipeserta", users);
  });

  socket.on("jawab", () => {
    const gameTurn = jawabGame(socket.id);
    socket.emit("denger-jawab", gameTurn);
  });

  socket.on("answer", () => {
    console.log("userId", socket.id);
    const user = userAnswer(socket.id);
    console.log(user);
    socket.to(user.roomid).emit("user-answer", user);
  });
});
