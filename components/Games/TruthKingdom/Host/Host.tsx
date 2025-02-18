import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";
import LieSubmit from "./LieSubmit/LieSubmit";
import Start from "./Start/Start";

import { GameStates } from "../Types";
import LieChoose from "./LieChoose/LieChoose";
import LieChosen from "./LieChosen/LieChosen";
import ViewScore from "./View_Score/ViewScore";
import styles from "./Host.module.css"
import Win from "./Win/Win";
import HostTutorial from "./Tutorial/Tutorial";
export default function Host({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {

    const [gameState, setGameState] = useState<GameStates>(GameStates.START)
    const [lieList, setLieList] = useState<Map<string, Player>>(new Map<string, Player>())
    const [playersChose, setPlayersChose] = useState<Map<string, Player[]>>(new Map<string, Player[]>())
    const [amountPlayersChosen, setAmountPlayersChosen] = useState<number>(0)

    const current_round = useRef<number>(1)
    const currentQuestion = useRef<number>(0)
    const alreadyChosenQuestions = useRef<number[]>([])


    const questions: string[][] = [
        ["Who was the 3rd wife of Claudius renowned for her promiscuity?", "Valeria Messalina", "3rdWifeClaudius.mp3"],
        ["If you need some quick cash, a Harvard graduate made a website in 2015 stating that he'll give somebody $10,000 if they simply ____", "find him a girlfriend", "Harvard$10k.mp3"],
        ['Due to a highly unusual service they offer, the Gideon Putnam Resort & Spa in New York is informally known as the _____ Hotel.', "Divorce", "GideonPutnamHotel.mp3"],
        ["Instead of putting baby teeth under the pillow for the Tooth Fairy, children in Greece are advised to take their baby teeth and _____.", "throw them on the roof", "BabyTeethThrow.mp3"],
        ["Michelle Joni operates a unique preschool in Brooklyn. All the students in the preschool are ____.", "Adults", "AdultPreschool.mp3"],
        ["The Hilton Chicago Magnificent Mile hotel asked guests in the spring and summer of 2015 to keep their windows closed. They were concerned about ____.", "Flying Spiders", "FlyingSpiders.mp3"],
        ["Because it would 'only lead to teasing or disparaging thoughts', a French judge ruled in 2014 that a couple could not name their newborn child ____.", "Nutella"],
    ]

    var socket = clientWebsocket.socket
    var message: string = ""

    var display = <Start roomState={roomState} clientWebsocket={clientWebsocket}></Start>
    switch (gameState) {
        case GameStates.TUTORIAL:
            display = <HostTutorial clientWebsocket={clientWebsocket}></HostTutorial>
            break
        case GameStates.LIE_SUBMIT:
            display = <LieSubmit roomState={roomState} clientWebsocket={clientWebsocket} lieList={lieList} currentQuestion={questions[currentQuestion.current]}></LieSubmit>
            break;
        case GameStates.LIE_CHOOSE:
            display = <LieChoose roomState={roomState} clientWebsocket={clientWebsocket} playersChose={playersChose} lieList={lieList} amountPlayersChosen={amountPlayersChosen} currentQuestion={questions[currentQuestion.current]}></LieChoose>
            break;
        case GameStates.LIE_CHOSEN:
            display = <LieChosen roomState={roomState} clientWebsocket={clientWebsocket} playersChose={playersChose} lieList={lieList} currentQuestion={questions[currentQuestion.current]}></LieChosen>
            break;
        case GameStates.VIEW_SCORE:
            display = <ViewScore roomState={roomState} clientWebsocket={clientWebsocket} playersChose={playersChose} lieList={lieList} currentQuestion={questions[currentQuestion.current]}></ViewScore>
            break;
        case GameStates.END:
            display = <Win roomState={roomState} clientWebsocket={clientWebsocket}></Win>

    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max)
    }

    useEffect(() => {
        socket.on('relayReceive', (msg) => {
            switch (msg['code']) {
                case "start_tutorial":
                    setGameState(GameStates.TUTORIAL)
                    break
                case "start_game":
                    while (alreadyChosenQuestions.current.includes(currentQuestion.current)) {
                        currentQuestion.current = getRandomInt(questions.length)

                    }
                    alreadyChosenQuestions.current.push(currentQuestion.current)
                    setLieList(new Map<string, Player>())
                    setAmountPlayersChosen(0)
                    setPlayersChose(new Map<string, Player[]>())
                    setGameState(GameStates.LIE_SUBMIT)
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

                    setLieList(newLieList)
                    setPlayersChose(newPlayersChose)
                    setGameState(GameStates.LIE_CHOOSE)
                    break;
                case "lie_chose":
                    setAmountPlayersChosen(amountPlayersChosen + 1)
                    var newPlayersChose = new Map<string, Player[]>(playersChose)
                    if (!newPlayersChose.has(msg['lie'])) {
                        newPlayersChose.set(msg['lie'], [msg['player']])
                    } else {
                        var newAnswerArray = [...playersChose.get(msg['lie']), msg['player']]
                        newPlayersChose.set(msg['lie'], newAnswerArray)
                    }
                    setPlayersChose(newPlayersChose)

                    break;
                case "lies_chosen":
                    setGameState(GameStates.LIE_CHOSEN)
                    break;
                case "end_lie_viewing":
                    if (current_round.current >= 3) {
                        setGameState(GameStates.END)
                    }
                    else {
                        setGameState(GameStates.VIEW_SCORE)
                    }
                    break;
                case "next_round":
                    if (current_round.current == 3) {
                        socket.emit('relay', {
                            code: "game_finish"
                        })

                    } else {
                        current_round.current += 1
                        socket.emit('relay', {
                            code: 'start_game'
                        })
                    }
                    break;
                case "restart":
                    alreadyChosenQuestions.current = []
                    socket.emit('setScoreAll', 0)
                    setGameState(GameStates.START)


            }
        })
        return () => {
            socket.off('relayReceive')
        }
    }, [socket, lieList, playersChose, amountPlayersChosen, current_round.current])


    return (
        <div className={styles.outer_container} >

            {display}
        </div >

    )
}