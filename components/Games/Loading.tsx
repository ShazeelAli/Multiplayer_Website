import clientWebsocket from "utils/clientWebsocket";
import RoomState from "utils/roomState";

export default function Loading({
  roomState,
  clientWebsocket,
}: {
  roomState: RoomState;
  clientWebsocket: clientWebsocket;
}) {
  return (
    <div>
      <h1
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        LOADING ROOM STATE
      </h1>
    </div>
  );
}
