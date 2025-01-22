import { use, useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./FibbageHostStart.module.css"
import FibbagePlayerDisplay from "../PlayerDisplay/FibbagePlayerDisplay";
import Transition from "../Transition/Transition";
import Timer from "../Timer/Timer";
import sharedStyles from "components/Games/FibbageClone/SharedStyles.module.css"

export default function FibbageHostStart({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {

    var socket = clientWebsocket.socket
    const [close, setClose] = useState<boolean>(false)
    const timer = useRef()
    const startGame = () => {
        setClose(true)
        setTimeout(() => {
            socket.emit("relay", {
                code: "start_game"
            })
        }, 2000)


    }

    var playersRemaining = 2 - Object.keys(roomState.players).length
    var playersRemainingMessage = <h3>{playersRemaining + " People needed to start"}</h3>
    if (playersRemaining <= 0) {
        playersRemainingMessage = <></>
    }
    var player_names = []
    for (const player_name in roomState.players) {
        var player: Player = roomState.players[player_name]
        if (player.id == roomState.host.id) {
            continue
        }
        player_names.push(player_name)

    }


    return (
        <div>

            <Transition close={close} open={true}></Transition>
            <FibbagePlayerDisplay player_names={player_names}></FibbagePlayerDisplay>
            <div className={styles.inner_container}>
                {playersRemainingMessage}
                <button className={sharedStyles.button} onClick={startGame} disabled={!(Object.keys(roomState.players).length >= 2)}>START GAME</button>
            </div>
        </div >

    )
}