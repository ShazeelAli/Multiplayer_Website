import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import SharedStyles from "components/Games/TruthKingdom/SharedStyles.module.css";

export default function FibbageClientLieSubmit({
  roomState,
  clientWebsocket,
}: {
  roomState: RoomState;
  clientWebsocket: clientWebsocket;
}) {
  const chatAreaRef = useRef<HTMLDivElement>();
  const lieMsgRef = useRef<string>();
  const [canSend, setCanSend] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  var socket = clientWebsocket.socket;

  const sendMessage = () => {
    socket.emit(
      "relayTarget",
      roomState.host.id,
      "TK_lie_submit",
      lieMsgRef.current,
      () => {
        setSubmitted(true);
      }
    );
  };

  const handleInputMessage = (e) => {
    const fieldValue = e.target.value;
    lieMsgRef.current = fieldValue;
    if (lieMsgRef.current.length == 0) {
      setCanSend(false);
    } else {
      setCanSend(true);
    }
  };

  var display = (
    <div>
      <h1
        className={SharedStyles.basic}
        style={{ textAlign: "center", fontSize: "30px", border: "0px" }}
      >
        Submit Your Lie
      </h1>
      <input
        type="text"
        name="Room_Code"
        className={SharedStyles.basic}
        style={{ backgroundColor: "white" }}
        placeholder="Type Lie Here"
        onChange={handleInputMessage}
      ></input>
      <button
        disabled={!canSend}
        className={SharedStyles.button}
        onClick={sendMessage}
      >
        {" "}
        Send{" "}
      </button>
    </div>
  );

  if (submitted) {
    display = (
      <h1>SUBMITTED, Wait for everyone to submit or timer to run out</h1>
    );
  }

  return <div>{display}</div>;
}
