import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";


import Start from "./Start";
import LieSubmit from "./LieSubmit/LieSubmit";
import LieChoose from "./LieChoose/LieChoose";

import { GameStates } from "../Types";
import SharedStyles from "../SharedStyles.module.css"


export default function Client({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {
    const [gameState, setGameState] = useState<GameStates>(GameStates.START)
    const [answersList, setAnswersList] = useState<Map<string, Player>>()
    var socket = clientWebsocket.socket
    var display = <Start></Start>
    switch (gameState) {
        case GameStates.LIE_SUBMIT:
            display = <LieSubmit roomState={roomState} clientWebsocket={clientWebsocket}></LieSubmit>
            break;
        case GameStates.LIE_CHOOSE:
            display = <LieChoose roomState={roomState} clientWebsocket={clientWebsocket} answerList={answersList}></LieChoose>
            break;

    }

    useEffect(() => {
        socket.on('relayReceive', (msg) => {
            switch (msg['code']) {
                case "start_game":
                    setGameState(GameStates.LIE_SUBMIT)
                    break;
                case "lies_submission_finished":
                    var newAnswerList: Map<string, Player> = msg['answerList']
                    setAnswersList(newAnswerList)
                    setGameState(GameStates.LIE_CHOOSE)
                    break;

            }
        })
    }, [])




    return (
        <div className={SharedStyles.background_client}>
            {display}
        </div >

    )
}