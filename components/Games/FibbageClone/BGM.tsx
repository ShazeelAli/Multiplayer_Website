"use client"
import { useEffect, useRef, useMemo } from "react"
import useSound from "use-sound"

export default function FibbageBGM({ play }: { play: boolean }) {
    const [BGMPlay, BGMData] = useSound("/TruthKingdom/BackgroundSong.mp3", { interrupt: true, volume: 0.5 })

    const BGMIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (BGMData.sound && BGMData.duration && play) {  // Ensure duration is available
            BGMPlay();
            BGMIntervalRef.current = setInterval(BGMPlay, BGMData.duration + 200);
        } else if (!play) {
            if (BGMIntervalRef.current) {
                clearInterval(BGMIntervalRef.current);
            }
            BGMData.stop();
        }

        return () => {
            if (BGMIntervalRef.current) {
                clearInterval(BGMIntervalRef.current);
            }
            BGMData.stop();
        };
    }, [BGMData.sound, play]);  // Dependencies ensure effect runs only when data is ready
    return null;
}