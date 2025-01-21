import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";

import FibbageHostLie from "../FibbageHost/LieSubmit/FibbageHostLieSubmit";
import FibbageClientStart from "./FibbageClientStart";
import FibbageClientLieSubmit from "./FibbageClientLieSubmit";
import { FibbageStatesEnum } from "../FibbageTypes";
import FibbageClientLieChoose from "./FibbageClientLieChoose";


export default function FibbageClient({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {



    const [gameState, setGameState] = useState<FibbageStatesEnum>(FibbageStatesEnum.START)
    const [answersList, setAnswersList] = useState<Map<string, Player>>()
    var socket = clientWebsocket.socket

    var display = <FibbageClientStart></FibbageClientStart>
    switch (gameState) {
        case FibbageStatesEnum.LIE_SUBMIT:
            display = <FibbageClientLieSubmit roomState={roomState} clientWebsocket={clientWebsocket}></FibbageClientLieSubmit>
            break;
        case FibbageStatesEnum.LIE_CHOOSE:
            display = <FibbageClientLieChoose roomState={roomState} clientWebsocket={clientWebsocket} answerList={answersList}></FibbageClientLieChoose>
            break;

    }

    useEffect(() => {
        socket.on('relayReceive', (msg) => {
            switch (msg['code']) {
                case "start_game":
                    setGameState(FibbageStatesEnum.LIE_SUBMIT)
                    break;
                case "lies_submission_finished":
                    var newAnswerList: Map<string, Player> = msg['answerList']
                    setAnswersList(newAnswerList)
                    setGameState(FibbageStatesEnum.LIE_CHOOSE)
                    break;

            }
        })
    }, [])




    return (
        <div style={{ width: "100%", height: "100%" }}>
            {display}
        </div >

    )
}