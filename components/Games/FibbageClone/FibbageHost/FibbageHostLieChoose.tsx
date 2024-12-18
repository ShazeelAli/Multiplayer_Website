import PlayerList from "components/playerList";
import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";


export default function FibbageHostChoose({ roomState, clientWebsocket, playersChose, amountPlayersChosen, currentQuestion }: { roomState: RoomState, clientWebsocket: clientWebsocket, playersChose: Map<string, Player[]>, amountPlayersChosen: number, currentQuestion: string[] }) {
    const timerRef = useRef<NodeJS.Timeout>(null)
    const [timerRemaining, setTimerRemaining] = useState<number>(60)
    const socket = clientWebsocket.socket
    var amountOfPlayers = Object.keys(roomState.players).length - 1


    useEffect(() => {
        if (amountPlayersChosen == amountOfPlayers) {
            endChoosing()
        }
    }, [amountPlayersChosen])

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

    const endChoosing = () => {
        if (timerRef.current != null) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        socket.emit('relay', {
            code: "lies_chosen"
        })

    }

    var lieDisplay: JSX.Element[] = []
    playersChose.forEach((playerArray, lie) => {
        lieDisplay.push(<div key={lie}>{lie}</div>)

    })

    return (
        <div>
            <h1>CHOSE THE TRUTH {timerRemaining}s left</h1>
            <h1>{currentQuestion[0]}</h1>
            <h2>People Chosen : {amountPlayersChosen}/{amountOfPlayers}</h2>
            <h3>{lieDisplay}</h3>
        </div >

    )
}