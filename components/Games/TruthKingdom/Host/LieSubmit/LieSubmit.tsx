import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./LieSubmit.module.css";
import PlayerDisplay from "../PlayerDisplay/PlayerDisplay";
import Transition from "../Transition/Transition";
import useSound from "use-sound";
import BGM from "../../BGM";
export default function FibbageHostLieSubmit({
  roomState,
  clientWebsocket,
  lieList,
  currentQuestion,
}: {
  roomState: RoomState;
  clientWebsocket: clientWebsocket;
  lieList: Map<string, Player>;
  currentQuestion: string[];
}) {
  const timerRef = useRef<NodeJS.Timeout>(null);
  const [playBGM, setPlayBGM] = useState<boolean>(false);
  const [questionPlay, questionData] = useSound(
    "/TruthKingdom/VoiceLines/Questions/" + currentQuestion[2],
    { interrupt: true, volume: 1 }
  );
  const [timerRemaining, setTimerRemaining] = useState<number>(71);
  const [close, setClose] = useState<boolean>(false);
  const socket = clientWebsocket.socket;
  var amountOfPlayers = Object.keys(roomState.players).length - 1;

  useEffect(() => {
    if (questionData.sound) {
      setTimeout(questionPlay, 5000);
      setTimeout(() => {
        setPlayBGM(true);
      }, 5000 + questionData.duration);
    }
  }, [questionData.sound]);

  useEffect(() => {
    if (lieList.size == amountOfPlayers) {
      startChoosing();
    }
  }, [lieList.size]);

  useEffect(() => {
    timerRef.current = setInterval(timerTick, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerRemaining]);

  const timerTick = () => {
    if (timerRemaining != 0) {
      setTimerRemaining(timerRemaining - 1);
    } else {
      startChoosing();
    }
  };

  const startChoosing = () => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    var newLieListObject = {};
    var newLieList = new Map<string, Player>(lieList);
    var random = Math.random();
    var randomInsert = Math.floor(random * (newLieList.size + 1));
    let i = 0;
    console.log(random);
    console.log(randomInsert);
    newLieList.forEach((player, answer) => {
      console.log(i);
      if (i == randomInsert) {
        newLieList[currentQuestion[1]] = null;
      } else {
        i++;
      }
      newLieList[answer] = newLieList.get(answer);
    });
    if (i == newLieList.size) {
      newLieList[currentQuestion[1]] = null;
    }
    setPlayBGM(false);
    setClose(true);
    console.log("New Lie List");
    console.log(newLieList);
    setTimeout(() => {
      socket.emit("relay", "TK_lies_submission_finished", newLieList);
    }, 3000);
  };

  var player_names: string[] = [];
  lieList.forEach((player) => {
    player_names.push(player.name);
  });

  return (
    <div>
      <BGM play={playBGM}></BGM>
      <Transition close={close} open={true}></Transition>
      <div className={styles.outer_container}>
        <PlayerDisplay player_names={player_names}></PlayerDisplay>
        <div className={styles.inner_spacing}>
          <div className={styles.question}>
            <h1>{currentQuestion[0]}</h1>
          </div>
          <div className={styles.center}>
            <h1 className={styles.timer}>{timerRemaining}</h1>
            <h2 className={styles.amount_lies}>
              {lieList.size}/{amountOfPlayers}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
