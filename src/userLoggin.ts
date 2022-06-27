import { isRestTypeNode } from "typescript";
import { gameQuestions } from "./gameQuestion";

const soal = [{}];

type User = {
  username: string;
  userid: string;
  roomid: string;
};

interface UserPeserta extends User {
  team: string;
}

export interface IGameQOut {
  quest: string;
  answers: string[];
  points: number[];
}

export const users: User[] = [];
export const usersPeserta: UserPeserta[] = [];
export const gameList: IGameQOut[] = gameQuestions;
export let gameStart = false;
export let gameQuestOut: IGameQOut = {} as IGameQOut;
export let gameRonde = "";
export let gameTurn: User = {} as User;
export let gameState: number = 0;

function findUsers(userid: string) {
  const findUser = users.findIndex(user => user.userid === userid);
  return { index: findUser, user: users[findUser] };
}
function findPeserta(userid: string) {
  const findUser = usersPeserta.findIndex(user => user.userid === userid);
  return { index: findUser, user: usersPeserta[findUser] };
}

function generateSoal(): IGameQOut {
  gameQuestOut = {
    quest: gameList[gameState].quest,
    answers: gameList[gameState].answers.map(arr => "..."),
    points: gameList[gameState].points,
  };

  gameState++;

  return gameQuestOut;
}

export function game_start(userid: string): { game: IGameQOut; user: User } {
  const { index, user } = findUsers(userid);
  if (user.username === "ADMIN" && usersPeserta.length >= 2) {
    gameStart = true;
    let soal = generateSoal();
    return { game: soal, user };
  }
  return { game: {} as IGameQOut, user };
}

export function userLoggin({ username, userid, roomid }: User) {
  let team: string = "admin";
  const { index, user } = findUsers(userid);
  if (index < 0) {
    users.push({ username, userid, roomid });
    if (username !== "ADMIN") {
      if (usersPeserta.length > 0) {
        team = "teamB";
        usersPeserta.push({ username, userid, roomid, team: "teamB" });
      } else {
        team = "teamA";
        usersPeserta.push({ username, userid, roomid, team: "teamA" });
      }
    }
  } else {
    users[index] = { ...users[index], username, userid, roomid };
  }

  return { usersPeserta, team };
}

export function userDisconnected(socketid: string) {
  const { index: iUser } = findUsers(socketid);
  const { index: iPeserta } = findPeserta(socketid);
  if (iUser >= 0) {
    users.splice(iUser, 1);
    usersPeserta.splice(iPeserta, 1);
  }
  console.log(users);
}

export function userAnswer(socketid: string) {
  const { index, user } = findUsers(socketid);
  return user;
}

export function jawabGame(userid: string) {
  const { index, user } = findUsers(userid);
  if (gameTurn.userid) {
    return gameTurn;
  }
  gameTurn = user;
  return gameTurn;
}
