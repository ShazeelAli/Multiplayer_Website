import PlayerList from "components/playerList";
import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./FibbageHostLieChoose.module.css"
import sharedStyles from "components/Games/FibbageClone/SharedStyles.module.css"
import Transition from "../Transition/Transition";

export default function FibbageHostChoose({ roomState, clientWebsocket, lieList, playersChose, amountPlayersChosen, currentQuestion }: { roomState: RoomState, clientWebsocket: clientWebsocket, playersChose: Map<string, Player[]>, lieList: Map<string, Player>, amountPlayersChosen: number, currentQuestion: string[] }) {
    const timerRef = useRef<NodeJS.Timeout>(null)
    const [timerRemaining, setTimerRemaining] = useState<number>(60)
    const socket = clientWebsocket.socket
    var amountOfPlayers = Object.keys(roomState.players).length - 1
    console.log(amountOfPlayers)


    useEffect(() => {
        if (amountPlayersChosen == amountOfPlayers) {
            endChoosing()
        }
    }, [amountPlayersChosen])

    const endChoosing = () => {
        if (timerRef.current != null) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        socket.emit('relay', {
            code: "lies_chosen"
        })

    }

    useEffect(() => {
        timerRef.current = setInterval(timerTick, 1000)
        return () => clearInterval(timerRef.current)
    }, [timerRemaining])

    const timerTick = () => {
        if (timerRemaining != 0) {
            setTimerRemaining(timerRemaining - 1)
        }
        else {
            endChoosing()
        }
    }



    var lieDisplay: JSX.Element[] = []
    lieList.forEach((Player, lie) => {
        lieDisplay.push(<div key={lie} className={[styles.lie, sharedStyles.basic].join(" ")}>{lie}</div>)

    })

    return (
        <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center" }}>
            <Transition close={false} open={true}></Transition>
            <div className={styles.container}>

                <div className={[styles.question, sharedStyles.basic].join(" ")}>
                    <h1>{currentQuestion[0]}</h1>
                </div>

                <div className={[styles.lie_container, sharedStyles.basic].join(" ")}>
                    {lieDisplay}
                </div>

                <div className={[styles.footer, sharedStyles.basic].join(" ")}>
                    <h2>People Chosen : {amountPlayersChosen}/{amountOfPlayers}</h2>
                    <h2>{timerRemaining}</h2>
                </div>

            </div >
        </div>

    )
}