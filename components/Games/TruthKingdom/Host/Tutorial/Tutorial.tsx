import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";

import styles from "./Tutorial.module.css"

import Transition from "../Transition/Transition";

import sharedStyles from "components/Games/TruthKingdom/SharedStyles.module.css"
import useSound from "use-sound";
export default function HostTutorial({ clientWebsocket }: { clientWebsocket: clientWebsocket }) {
    const [introPlay, introData] = useSound("/TruthKingdom/VoiceLines/Intro.mp3", { interrupt: true, volume: 1 })
    const [introSkipPlay, introSkipData] = useSound("/TruthKingdom/VoiceLines/SkipIntro.mp3", { interrupt: true, volume: 1 })
    const [close, setClose] = useState<boolean>(false)
    const startGameRef = useRef<NodeJS.Timeout>(null)

    var socket = clientWebsocket.socket
    useEffect(() => {
        socket.on('relayReceive', (msg) => {
            if (msg['code'] == "skip") {
                skip()
            }
        })
    }, [startGameRef.current, introData])

    useEffect(() => {
        if (introData.sound) {
            setTimeout(introPlay, 4000)
            startGameRef.current = setTimeout(() => {
                socket.emit("relay", {
                    code: "start_game"
                })
            }, 50000)
        }

    }, [introData.sound])



    const skip = () => {
        clearTimeout(startGameRef.current)
        introData.stop()
        setClose(true)
        setTimeout(introSkipPlay, 3000)
        setTimeout(() => {
            socket.emit("relay", {
                code: "start_game"
            })
        }, 10000)
    }


    return (
        <div>
            <Transition close={close} open={true}></Transition>

            <div className={styles.inner_container}>
                <h1>STEP 1: TELL A BELIEVABLE LIE</h1>
                <h1>STEP 2: FIND THE TRUTH</h1>
            </div>
            <button className={sharedStyles.button} onClick={skip}>SKIP</button>
        </div >

    )
}