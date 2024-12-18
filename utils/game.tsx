import Loading from "components/Games/Loading"
import Chatroom from "components/Games/Chatroom"
import FibbageMain from "components/Games/FibbageClone/FibbageMain"
import RoomState from "./roomState"
import ClientWebsocket from "./clientWebsocket"

export class Game {
    gameName: string
    gameType: GameType
    mobileFriendly: boolean
    urlImbed: string
    webComponent: ({ roomState, clientWebsocket }: { roomState: RoomState; clientWebsocket: ClientWebsocket; }) => JSX.Element

    constructor(gameName: string, gameType: GameType, mobileFriendly: boolean, urlImbed: string = null, webComponent: ({ roomState, clientWebsocket }: { roomState: RoomState; clientWebsocket: ClientWebsocket; }) => JSX.Element = null) {
        this.gameName = gameName
        this.gameType = gameType
        this.mobileFriendly = mobileFriendly
        this.urlImbed = urlImbed
        this.webComponent = webComponent
    }
}

export enum GameType {
    GODOT,
    WEB
}
export enum GamesEnum {
    LOADING,
    LOBBY,
    CHATROOM,
    FIBBAGE
}

export const GamesFull = new Map<GamesEnum, Game>([
    [GamesEnum.LOADING, new Game("Loading", GameType.WEB, false, null, Loading)],
    [GamesEnum.LOBBY, new Game("Lobby", GameType.GODOT, false, "/WebRTCTestIFrame2/WebRTCTest.html")],
    [GamesEnum.CHATROOM, new Game("Chatroom", GameType.WEB, false, null, Chatroom)],
    [GamesEnum.FIBBAGE, new Game("Fibbage", GameType.WEB, false, null, FibbageMain)],
])

