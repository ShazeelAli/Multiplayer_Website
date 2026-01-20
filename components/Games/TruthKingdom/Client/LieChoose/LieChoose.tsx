import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";

import SharedStyles from "components/Games/TruthKingdom/SharedStyles.module.css";
export default function FibbageClientLieChoose({
  roomState,
  clientWebsocket,
  answerList,
}: {
  roomState: RoomState;
  clientWebsocket: clientWebsocket;
  answerList: Map<string, Player>;
}) {
  const chatAreaRef = useRef<HTMLDivElement>();
  const lieMsgRef = useRef<string>();
  const [submitted, setSubmitted] = useState<boolean>(false);
  var socket = clientWebsocket.socket;

  const chooseAnswer = (answer) => {
    socket.emit(
      "relayTarget",
      roomState.host.id,
      "TK_lie_chose",
      answer,
      () => {
        setSubmitted(true);
      }
    );
  };

  var answerDisplay: JSX.Element[] = [];
  for (const answer in answerList) {
    answerDisplay.push(
      <div key={answer}>
        <label>{answer}</label>
        <button
          className={SharedStyles.button}
          onClick={() => {
            chooseAnswer(answer);
          }}
        >
          Choose
        </button>
      </div>
    );
  }
  var display = (
    <div>
      <h1>Choose The TRUTH!!!!</h1>
      {answerDisplay}
    </div>
  );

  if (submitted) {
    display = (
      <h1>SUBMITTED, Wait for everyone to submit or timer to run out</h1>
    );
  }

  return <div>{display}</div>;
}
