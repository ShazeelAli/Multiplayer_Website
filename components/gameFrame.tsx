import { useEffect, useRef, useState } from 'react'
import { Game, GamesFull, GamesEnum, GameType } from '../utils/game'
import RoomState from '../utils/roomState'
import clientWebsocket from 'utils/clientWebsocket'
import styles from './gameFrame.module.css'
export default function gameFrame({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {
    const IFrameForMessage = useRef()
    const [display, setDisplay] = useState(<h1 style={{ width: "100%", height: "100%", display: 'flex', alignItems: "center", justifyContent: 'center' }}>LOADING</h1>)
    // const [display, setDisplay] = useState(<h1 style={{ width: "100%", height: "100%", display: 'flex', alignItems: "center", justifyContent: 'center' }}>LOADING</h1>)
    // var display = <h1 style={{ width: "100%", height: "100%", display: 'flex', alignItems: "center", justifyContent: 'center' }}>LOADING</h1>
    useEffect(() => {
        if (GamesFull.has(roomState.currentGame)) {
            var current_game = GamesFull.get(roomState.currentGame)
            if (current_game.gameType == GameType.GODOT) {
                var frameSrc = GamesFull.get(roomState.currentGame).urlImbed
                setDisplay(<iframe
                    src={frameSrc}
                    width='100%'
                    ref={IFrameForMessage}
                    height='100%'
                    scrolling='no'

                />)
            }
            else {
                setDisplay(<current_game.webComponent clientWebsocket={clientWebsocket} roomState={roomState}></current_game.webComponent>)
            }


        }
    }, [roomState])





    return (
        <div style={{ width: "100%", height: "100%" }}>
            {display}
        </div>

    )
}

