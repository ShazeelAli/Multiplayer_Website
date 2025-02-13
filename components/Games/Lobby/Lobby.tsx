import clientWebsocket from "utils/clientWebsocket";
import RoomState from "utils/roomState";
import { GamesFull, GamesEnum } from "utils/game";
import GameDisplay from "./gameDisplay";
export default function Lobby({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {
    var gameDisplays = []
    GamesFull.forEach((game, gameEnum) => {
        if (gameEnum == GamesEnum.LOADING || gameEnum == GamesEnum.LOBBY) {
            return
        }
        var display = <GameDisplay roomState={roomState} clientWebsocket={clientWebsocket} game={game} gameEnum={gameEnum}></GameDisplay>
        gameDisplays.push(display)
    })
    return (
        <div>
            <h1 style={{ width: "100%", height: "100%", display: 'flex', alignItems: "center", justifyContent: 'center' }}>Lobby</h1>
            {gameDisplays}
        </div>

    )
}