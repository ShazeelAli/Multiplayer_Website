import Loading from "components/Games/Loading";
import Chatroom from "components/Games/Chatroom";
import FibbageMain from "components/Games/TruthKingdom/Main";
import RoomState from "./roomState";
import ClientWebsocket from "./clientWebsocket";
import Lobby from "components/Games/Lobby/Lobby";

export class Game {
  gameName: string;
  gameType: GameType;
  mobileFriendly: boolean;
  urlImbed: string;
  webComponent: ({
    roomState,
    clientWebsocket,
  }: {
    roomState: RoomState;
    clientWebsocket: ClientWebsocket;
  }) => JSX.Element;

  constructor(
    gameName: string,
    gameType: GameType,
    mobileFriendly: boolean,
    urlImbed: string = null,
    webComponent: ({
      roomState,
      clientWebsocket,
    }: {
      roomState: RoomState;
      clientWebsocket: ClientWebsocket;
    }) => JSX.Element = null
  ) {
    this.gameName = gameName;
    this.gameType = gameType;
    this.mobileFriendly = mobileFriendly;
    this.urlImbed = urlImbed;
    this.webComponent = webComponent;
  }
}

export enum GameType {
  GODOT,
  WEB,
}
export enum GamesEnum {
  LOADING,
  LOBBY,
  CHATROOM,
  TRUTHKINGDOM,
  CATPLATFORMER,
}

export const GamesFull = new Map<GamesEnum, Game>([
  [GamesEnum.LOADING, new Game("Loading", GameType.WEB, false, null, Loading)],
  [GamesEnum.LOBBY, new Game("Lobby", GameType.WEB, false, null, Lobby)],
  [
    GamesEnum.CHATROOM,
    new Game("Chatroom", GameType.WEB, false, null, Chatroom),
  ],
  [
    GamesEnum.TRUTHKINGDOM,
    new Game("Truth Kingdom", GameType.WEB, false, null, FibbageMain),
  ],
  [
    GamesEnum.CATPLATFORMER,
    new Game(
      "Cat Platformer",
      GameType.GODOT,
      false,
      "/WebRTCTestIFrame2/WebRTCTest.html"
    ),
  ],
]);
