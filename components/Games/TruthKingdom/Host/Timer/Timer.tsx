
import { useEffect, useRef, useState } from "react";


export default function Timer({ onTimerTick, onTimerEnd, time }: { onTimerTick: CallableFunction, onTimerEnd: CallableFunction, time: number }) {
    const timerRef = useRef<NodeJS.Timeout>(null)
    const [timerRemaining, setTimerRemaining] = useState<number>(time)


    useEffect(() => {
        timerRef.current = setInterval(timerTick, 1000)
        return () => clearInterval(timerRef.current)
    }, [timerRemaining])

    const timerTick = () => {
        if (timerRemaining != 0) {
            setTimerRemaining(timerRemaining - 1)
            onTimerTick(timerRemaining - 1)
        }
        else {
            onTimerEnd()
        }
    }
    return (null)
}