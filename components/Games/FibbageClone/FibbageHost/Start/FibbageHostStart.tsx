import { use, useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./FibbageHostStart.module.css"
import FibbagePlayerDisplay from "../PlayerDisplay/FibbagePlayerDisplay";
import Transition from "../Transition/Transition";
import sharedStyles from "components/Games/FibbageClone/SharedStyles.module.css"
import FibbageBGM from "../../BGM";
export default function FibbageHostStart({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {


    const [close, setClose] = useState<boolean>(false)
    const [playBGM, setPlayBGM] = useState<boolean>(false)
    var socket = clientWebsocket.socket
    const startTutorial = () => {
        setClose(true)
        setPlayBGM(false)
        setTimeout(() => {
            socket.emit("relay", {
                code: "start_tutorial"
            })
        }, 3000)
    }

    useEffect(() => {
        setTimeout(() => { setPlayBGM(true) }, 5000)
    }, []
    )

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
            <FibbageBGM play={playBGM} />
            <div className={styles.inner_container}>
                {playersRemainingMessage}
                <button className={sharedStyles.button} onClick={startTutorial} disabled={!(Object.keys(roomState.players).length >= 2)}>START GAME</button>
            </div>
        </div >

    )
}