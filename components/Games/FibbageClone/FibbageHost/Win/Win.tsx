import PlayerList from "components/playerList";
import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./Win.module.css"
import sharedStyles from "components/Games/FibbageClone/SharedStyles.module.css"
import Transition from "../Transition/Transition";

export default function Win({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {

    const [close, setClose] = useState<boolean>(false)
    const [topPlayer, setTopPlayer] = useState<Player>(new Player("null", "null"))
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

    return (
        <div className={sharedStyles.full}>
            <Transition close={false} open={true}></Transition>
            <div>
                <h1 className={sharedStyles.basic}>WINNER</h1>
                <div className={sharedStyles.basic}>{topPlayer.name}</div>
            </div>

        </div >

    )
}