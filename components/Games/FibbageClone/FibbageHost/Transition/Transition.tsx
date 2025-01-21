'use client'
import { useRef, useEffect } from "react"
import styles from "./Transition.module.css"
export default function Transition({ close, open }: { close: boolean, open: boolean }) {
    const topLayerRef = useRef<HTMLDivElement>();
    useEffect(() => {
        if (topLayerRef.current != null) {
            if (close) {
                topLayerRef.current.classList.add(styles.shutter_close)
                topLayerRef.current.classList.remove(styles.shutter_open)

            } else {
                topLayerRef.current.classList.remove(styles.shutter_close)
            }


        }
    }, [topLayerRef, close])

    useEffect(() => {
        if (topLayerRef.current != null) {
            if (open) {
                topLayerRef.current.classList.remove(styles.shutter_close)
                topLayerRef.current.classList.add(styles.shutter_open)
            } else {
                topLayerRef.current.classList.remove(styles.shutter_open)
            }

        }
    }, [topLayerRef, open])

    return (
        <div ref={topLayerRef} className={styles.top_layer} >

        </div >

    )
}