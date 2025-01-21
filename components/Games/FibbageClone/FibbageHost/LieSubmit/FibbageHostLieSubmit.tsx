import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import styles from "./FibbageHostLieSubmit.module.css"
import FibbagePlayerDisplay from "../PlayerDisplay/FibbagePlayerDisplay";
import Transition from "../Transition/Transition";

export default function FibbageHostLieSubmit({ roomState, clientWebsocket, lieList, currentQuestion }: { roomState: RoomState, clientWebsocket: clientWebsocket, lieList: Map<string, Player>, currentQuestion: string[] }) {
    const timerRef = useRef<NodeJS.Timeout>(null)
    const [timerRemaining, setTimerRemaining] = useState<number>(71)
    const [close, setClose] = useState<boolean>(false)
    const socket = clientWebsocket.socket
    var amountOfPlayers = Object.keys(roomState.players).length - 1


    useEffect(() => {
        if (lieList.size == amountOfPlayers) {
            startChoosing()
        }
    }, [lieList.size])

    useEffect(() => {
        timerRef.current = setInterval(timerTick, 1000)
        return () => clearInterval(timerRef.current)
    }, [timerRemaining])

    const timerTick = () => {
        if (timerRemaining != 0) {
            setTimerRemaining(timerRemaining - 1)
        }
        else {
            startChoosing()
        }
    }

    const startChoosing = () => {
        if (timerRef.current != null) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        var newLieListObject = {}
        var newLieList = new Map<string, Player>(lieList)
        var random = Math.random()
        var randomInsert = Math.floor(random * (newLieList.size + 1))
        let i = 0
        console.log(random)
        console.log(randomInsert)
        newLieList.forEach((player, answer) => {
            console.log(i)
            if (i == randomInsert) {
                newLieListObject[currentQuestion[1]] = null
            }
            else {
                i++
            }
            newLieListObject[answer] = newLieList.get(answer)

        })
        if (i == newLieList.size) {
            newLieListObject[currentQuestion[1]] = null
        }
        setClose(true)
        setTimeout(() => {
            socket.emit('relay', {
                code: "lies_submission_finished",
                answerList: newLieListObject

            })
        }, 2000)


    }

    var player_names: string[] = []
    lieList.forEach((player) => {
        player_names.push(player.name)

    })

    return (
        <div>
            <Transition close={close} open={true}></Transition>
            <div className={styles.outer_container}>
                <FibbagePlayerDisplay player_names={player_names}></FibbagePlayerDisplay>
                <div className={styles.inner_spacing}>
                    <div className={styles.question}>
                        <h1>{currentQuestion[0]}</h1>
                    </div>
                    <div className={styles.center}>
                        <h1 className={styles.timer}>{timerRemaining}</h1>
                        <h2 className={styles.amount_lies}>{lieList.size}/{amountOfPlayers}</h2>
                    </div>
                </div>
            </div >
        </div>


    )
}