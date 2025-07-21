
import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./Win.module.css"
import sharedStyles from "components/Games/TruthKingdom/SharedStyles.module.css"
import Transition from "../Transition/Transition";
import BGM from "../../BGM";

export default function Win({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {
    const socket = clientWebsocket.socket
    const [close, setClose] = useState<boolean>(false)
    const [topPlayer, setTopPlayer] = useState<Player>(new Player("null", "null", 0))
    const [playBGM, setPlayBGM] = useState<boolean>(false)
    useEffect(() => {
        setTimeout(() => { setPlayBGM(true) }, 5000)
    }, [])
    useEffect(() => {
        var tempTopPlayer: Player = null;
        for (const player_name in roomState.players) {
            var player: Player = roomState.players[player_name]
            if (tempTopPlayer == null) {
                tempTopPlayer = player;
            } else {
                if (tempTopPlayer.score < player.score) {
                    tempTopPlayer = player
                }
            }
        }
        setTopPlayer(tempTopPlayer)
    }, [roomState])

    const onContinue = () => {
        setClose(true)
        setTimeout(() => {
            socket.emit('relay', {
                code: 'restart'
            })
        }, 5000)
    }

    return (
        <div className={[sharedStyles.full].join(' ')}>
            <Transition close={close} open={true}></Transition>
            <BGM play={playBGM}></BGM>
            <div className={[sharedStyles.full, styles.container].join(' ')}>
                <h1 className={[sharedStyles.basic, styles.padding].join(' ')}>WINNER</h1>
                <div className={[sharedStyles.basic, styles.padding].join(' ')} style={{ fontSize: "3em" }}>{topPlayer.name}</div>
                <button className={sharedStyles.button} onClick={onContinue}>Continue</button>
            </div>

        </div>

    )
}