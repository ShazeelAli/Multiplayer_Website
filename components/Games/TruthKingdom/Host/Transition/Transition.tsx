'use client'
import { useRef, useEffect } from "react"
import styles from "./Transition.module.css"
import useSound from "use-sound";
export default function Transition({ close, open }: { close: boolean, open: boolean }) {
    const [moveSoundPlay, moveSoundData] = useSound("/TruthKingdom/Gate/Sounds/portcullis-move.mp3", { interrupt: true, volume: 1 })
    const topLayerRef = useRef<HTMLDivElement>();
    useEffect(() => {
        if (topLayerRef.current != null) {
            if (close) {
                topLayerRef.current.classList.add(styles.shutter_close)
                topLayerRef.current.classList.remove(styles.shutter_open)
                moveSoundPlay()
            } else {
                topLayerRef.current.classList.remove(styles.shutter_close)
            }



        }


    }, [close])

    useEffect(() => {
        if (topLayerRef.current != null) {
            if (open && moveSoundData.sound) {
                topLayerRef.current.classList.remove(styles.shutter_close)
                topLayerRef.current.classList.add(styles.shutter_open)
                setTimeout(moveSoundPlay, 2000)
            } else {
                topLayerRef.current.classList.remove(styles.shutter_open)
            }
        }

    }, [open, moveSoundData.sound])

    return (
        <div ref={topLayerRef} className={styles.top_layer} >

        </div >

    )
}