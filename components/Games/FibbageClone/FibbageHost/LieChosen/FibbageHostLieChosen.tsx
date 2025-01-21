import PlayerList from "components/playerList";
import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./FibbageHostLieChosen.module.css"
import sharedStyles from "components/Games/FibbageClone/SharedStyles.module.css"
import Transition from "../Transition/Transition";
export default function FibbageHostLieChosen({ roomState, clientWebsocket, playersChose, lieList, currentQuestion }: { roomState: RoomState, clientWebsocket: clientWebsocket, playersChose: Map<string, Player[]>, lieList: Map<string, Player>, currentQuestion: string[] }) {
    const socket = clientWebsocket.socket
    const containerRef = useRef<HTMLDivElement>()
    const [close, setClose] = useState<boolean>(false)

    const onContinue = () => {
        containerRef.current.classList.add(styles.disappear)

        setTimeout(() => {
            setClose(true)
        })
        setTimeout(() => {
            socket.emit('relay', {
                code: "end_lie_viewing"
            })
        }, 4000)

    }


    useEffect(() => {
        playersChose.forEach((playerList, lie) => {
            if (lieList.get(lie) == null) {
                playerList.forEach((player) => { socket.emit('updateScore', player, 100) })
            }
            else {
                var playerWhoseLie = lieList.get(lie)
                socket.emit('updateScore', playerWhoseLie, 100 * playerList.length)
            }
        })
    }, [])


    var lieDisplay: JSX.Element[] = []
    var i = 0
    var truth = ""
    lieList.forEach((Player, lie) => {

        if (lieList.get(lie) == null) {
            truth = lie
            return;
        }
        var playersChoseThisLieDisplay: JSX.Element[] = []
        var j = 0
        var animDelay = i * 10;
        var bigAnimDelay = animDelay
        if (playersChose.has(lie)) {
            var playerList = playersChose.get(lie)
            i++
            playerList.forEach((player) => {
                var smallAnimDelay = animDelay + 2 + (j * 0.2)
                playersChoseThisLieDisplay.push(<span className={[styles.player_chose, sharedStyles.basic].join(" ")} style={{ animationDelay: smallAnimDelay + "s" }} key={player.name}>{player.name}</span>)
                j++;
            })

        }
        else {
            animDelay = (playersChose.size) * 10
            bigAnimDelay = -animDelay
        }



        lieDisplay.push(<div className={[styles.lie, sharedStyles.basic].join(" ")} style={{ animationDelay: bigAnimDelay + "s" }} key={lie}>
            {lie}
            {playersChoseThisLieDisplay}
            <div className={[styles.player_chose, sharedStyles.basic].join(" ")} style={{
                animationDelay: (animDelay) + "s",
                backgroundColor: "red"
            }}>{lieList.get(lie).name}'s Lie</div>
        </div>)



    })

    var playersChoseThisLieDisplay: JSX.Element[] = []
    var animDelay = i * 10;

    if (playersChose.has(truth)) {
        var playerList = playersChose.get(truth)
        console.log(playerList)
        var j = 0
        playerList.forEach((player) => {
            console.log(player)
            var smallAnimDelay = animDelay + 2 + (j * 0.2)
            playersChoseThisLieDisplay.push(<span className={[styles.player_chose, sharedStyles.basic].join(" ")} style={{ animationDelay: smallAnimDelay + "s" }} key={player.name}>{player.name}</span>)
            j++;
        })
    }


    lieDisplay.push(<div className={[styles.lie, sharedStyles.basic].join(" ")} style={{ animationDelay: animDelay + "s" }} key={truth}>
        {truth}
        <div>
            {playersChoseThisLieDisplay}
        </div>

        <div className={[styles.player_chose, sharedStyles.basic].join(" ")} style={{
            animationDelay: (animDelay + 5) + "s",
            backgroundColor: "green"
        }}>Correct</div>
    </div>)





    return (
        <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center" }}>
            <Transition close={close} open={false}></Transition>
            <div className={styles.container} ref={containerRef}>


                <div className={[styles.question, sharedStyles.basic].join(" ")}>
                    <h1>{currentQuestion[0]}</h1>
                </div>
                <div className={[styles.lie_container, sharedStyles.basic].join(" ")}>
                    {lieDisplay}
                </div>

                <div className={[styles.footer, sharedStyles.basic].join(" ")}>
                    <button className={sharedStyles.button} onClick={onContinue}>Continue</button>
                </div>


            </div >
        </div>



    )
}