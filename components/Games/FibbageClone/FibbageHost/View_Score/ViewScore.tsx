import PlayerList from "components/playerList";
import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./ViewScore.module.css"
import sharedStyles from "components/Games/FibbageClone/SharedStyles.module.css"
import Transition from "../Transition/Transition";
export default function FibbageHostViewScore({ roomState, clientWebsocket, playersChose, lieList, currentQuestion }: { roomState: RoomState, clientWebsocket: clientWebsocket, playersChose: Map<string, Player[]>, lieList: Map<string, Player>, currentQuestion: string[] }) {
    const socket = clientWebsocket.socket

    const [sortedPlayers, setSortedPlayers] = useState<Player[]>([])
    const [close, setClosed] = useState<boolean>(false)
    const endViewing = () => {
        setClosed(true)
        setTimeout(() => {
            socket.emit('relay', {
                code: "next_round"
            })
        }, 3000)
    }

    useEffect(() => {
        var newSortedPlayers = [...sortedPlayers]
        for (const player_name in roomState.players) {
            var player: Player = roomState.players[player_name]

            if (newSortedPlayers.includes(player)) {
                continue

            }

            if (newSortedPlayers.length == 0) {
                newSortedPlayers.push(player)
            }
            else {
                console.log(player)
                for (var i = 0; i < newSortedPlayers.length; i++) {

                    if (player.score >= newSortedPlayers[i].score) {
                        console.log("Splice at " + i + " for " + player.name)
                        newSortedPlayers.splice(i, 0, player)
                        break;
                    }
                    else if (i == newSortedPlayers.length - 1) {
                        newSortedPlayers.push(player)
                        break;
                    }
                }
            }
        }
        console.log(newSortedPlayers)
        setSortedPlayers(newSortedPlayers)
    }, [roomState.players])


    var ScoreDisplay: JSX.Element[] = []
    var i = 0
    sortedPlayers.forEach((player, index) => {

        var lie = ""
        lieList.forEach((player_temp, lie_temp) => {
            if (player_temp == player) {
                lie = lie_temp;
            }
        })
        var score = <div key={player.name} className={[styles.score, sharedStyles.basic].join(' ')}>
            <>{player.name} : {lie} </>

            <>{player.score}</>
        </div>
        ScoreDisplay.push(score)

    })

    return (
        <div className={styles.container}>
            <Transition open={true} close={close}></Transition>
            <div className={[styles.question, sharedStyles.basic].join(' ')}>
                <h1>{currentQuestion[0]}</h1>
            </div>

            <div className={[styles.score_container].join(' ')}>
                {ScoreDisplay}
            </div>

            <div className={[styles.footer, sharedStyles.basic].join(' ')}>
                <button className={sharedStyles.button} onClick={endViewing}>Next Round</button>
            </div>
        </div >



    )
}