import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import FibbageHostLieSubmit from "./FibbageHostLieSubmit";
import FibbageHostStart from "./FibbageHostStart";

import { FibbageStatesEnum } from "../FibbageTypes";
import FibbageHostLieChoose from "./FibbageHostLieChoose";
import FibbageHostLieChosen from "./FibbageHostLieChosen";
export default function FibbageHost({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {

    const [gameState, setGameState] = useState<FibbageStatesEnum>(FibbageStatesEnum.START)
    const [lieList, setLieList] = useState<Map<string, Player>>(new Map<string, Player>())
    const [playersChose, setPlayersChose] = useState<Map<string, Player[]>>(new Map<string, Player[]>())
    const [amountPlayersChosen, setAmountPlayersChosen] = useState<number>(0)
    const current_round = useRef<number>(1)
    const currentQuestion = useRef<number>(0)
    const alreadyChosenQuestions = useRef<number[]>([])
    const questions: string[][] = [

        ["THIS IS Q1", "Q1 Answer"],
        ["Q2", "Q2 Answer"],
        ['Q3', "Q3 Answer"]

    ]

    var socket = clientWebsocket.socket
    var message: string = ""

    var display = <FibbageHostStart roomState={roomState} clientWebsocket={clientWebsocket}></FibbageHostStart>
    switch (gameState) {
        case FibbageStatesEnum.LIE_SUBMIT:
            display = <FibbageHostLieSubmit roomState={roomState} clientWebsocket={clientWebsocket} lieList={lieList} currentQuestion={questions[currentQuestion.current]}></FibbageHostLieSubmit>
            break;
        case FibbageStatesEnum.LIE_CHOOSE:
            display = <FibbageHostLieChoose roomState={roomState} clientWebsocket={clientWebsocket} playersChose={playersChose} amountPlayersChosen={amountPlayersChosen} currentQuestion={questions[currentQuestion.current]}></FibbageHostLieChoose>
            break;
        case FibbageStatesEnum.LIE_CHOSEN:
            display = <FibbageHostLieChosen roomState={roomState} clientWebsocket={clientWebsocket} playersChose={playersChose} lieList={lieList} currentQuestion={questions[currentQuestion.current]}></FibbageHostLieChosen>


    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max)
    }

    useEffect(() => {
        socket.on('relayReceive', (msg) => {
            switch (msg['code']) {
                case "start_game":
                    while (alreadyChosenQuestions.current.includes(currentQuestion.current)) {
                        currentQuestion.current = getRandomInt(questions.length)

                    }
                    alreadyChosenQuestions.current.push(currentQuestion.current)
                    setLieList(new Map<string, Player>())
                    setAmountPlayersChosen(0)
                    setPlayersChose(new Map<string, Player[]>())
                    setGameState(FibbageStatesEnum.LIE_SUBMIT)
                    break;
                case "lie_submit":
                    setLieList(new Map<string, Player>(lieList.set(msg["lie"], msg['player'])))
                    break;
                case "lies_submission_finished":
                    var answerList: Object = msg['answerList']
                    var newLieList: Map<string, Player> = new Map<string, Player>()
                    for (const answer in answerList) {
                        newLieList.set(answer, answerList[answer])
                    }
                    var newPlayersChose: Map<string, Player[]> = new Map<string, Player[]>()
                    newLieList.forEach((player, lie) => {
                        newPlayersChose.set(lie, [])
                    })

                    setLieList(newLieList)
                    setPlayersChose(newPlayersChose)
                    setGameState(FibbageStatesEnum.LIE_CHOOSE)
                    break;
                case "lie_chose":
                    setAmountPlayersChosen(amountPlayersChosen + 1)
                    var newAnswerArray = [...playersChose.get(msg['lie']), msg['player']]
                    var newPlayersChose = new Map<string, Player[]>(playersChose)
                    newPlayersChose.set(msg['lie'], newAnswerArray)
                    setPlayersChose(newPlayersChose)

                    break;
                case "lies_chosen":
                    setGameState(FibbageStatesEnum.LIE_CHOSEN)
                    break;
                case "next_round":
                    if (current_round.current == 3) {
                        socket.emit('relay', {
                            code: "game_finish"
                        })
                        setGameState(FibbageStatesEnum.END)
                    } else {
                        current_round.current += 1
                        socket.emit('relay', {
                            code: 'start_game'
                        })
                    }
                    break;

            }
        }) // Include dependencies to ensure the effect updates with state changes
        return () => {
            socket.off('relayReceive')
        }
    }, [socket, lieList, playersChose, amountPlayersChosen, current_round.current])



    return (
        <div>
            {display}
        </div >

    )
}