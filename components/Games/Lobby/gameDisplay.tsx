import clientWebsocket from "utils/clientWebsocket";
import RoomState from "utils/roomState";
import { GamesEnum, Game } from "utils/game";

export default function GameDisplay({
  roomState,
  clientWebsocket,
  game,
  gameEnum,
}: {
  roomState: RoomState;
  clientWebsocket: clientWebsocket;
  game: Game;
  gameEnum: GamesEnum;
}) {
  const changeGame = () => {
    clientWebsocket.socket.emit("changeGame", gameEnum);
  };

  return (
    <div
      key={gameEnum}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h3>{game.gameName}</h3>
      <button
        disabled={!(roomState.host.id == clientWebsocket.socket.id)}
        onClick={changeGame}
      >
        Play
      </button>
    </div>
  );
}
