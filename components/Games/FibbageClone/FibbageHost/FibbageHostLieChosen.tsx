import PlayerList from "components/playerList";
import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";


export default function FibbageHostLieChosen({ roomState, clientWebsocket, playersChose, lieList, currentQuestion }: { roomState: RoomState, clientWebsocket: clientWebsocket, playersChose: Map<string, Player[]>, lieList: Map<string, Player>, currentQuestion: string[] }) {
    const socket = clientWebsocket.socket



    const endViewing = () => {
        socket.emit('relay', {
            code: "next_round"
        })

    }

    useEffect(() => {
        console.log("HEREEE")
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
    playersChose.forEach((playerList, lie) => {
        var playersChoseThisLieDisplay: JSX.Element[] = []
        playerList.forEach((player) => { playersChoseThisLieDisplay.push(<span key={player.name}>{player.name}</span>) })
        if (lieList.get(lie) == null) {
            lieDisplay.push(<div style={{ backgroundColor: "green" }} key={lie}>{lie} : {playersChoseThisLieDisplay} : CORRECT</div>)
        }
        else {
            lieDisplay.push(<div style={{ backgroundColor: "red" }} key={lie}>{lie} : {playersChoseThisLieDisplay} : {lieList.get(lie).name}'s Lie</div>)
        }
    })

    return (
        <div>
            <h1>Who Chose What</h1>
            <h2>Answer : People That Chose : Liar</h2>
            <h3>{lieDisplay}</h3>
            <button onClick={endViewing}>Continue</button>
        </div >

    )
}