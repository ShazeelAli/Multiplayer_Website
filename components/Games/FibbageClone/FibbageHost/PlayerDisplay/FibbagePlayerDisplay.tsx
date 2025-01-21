'use client'
import { useEffect, useState } from "react"
import Player from "utils/player"
import styles from "./FibbagePlayerDisplay.module.css"

export default function FibbagePlayerDisplay({ player_names }: { player_names: string[] }) {

    const [windowWidth, setWindowWidth] = useState(0)
    const [windowHeight, setWindowHeight] = useState(0)
    var playerDisplays: JSX.Element[] = []

    var radius = Math.min(windowWidth / 4, windowHeight / 3)
    var partitions = 2 * Math.PI / player_names.length
    var i = 0;

    var x_center = window.innerWidth / 2
    var y_center = window.innerHeight / 2
    player_names.forEach((player_name) => {
        var currentAngle = (partitions * i)

        var right = radius * Math.sin(currentAngle) - 55
        var up = -(radius * Math.cos(currentAngle))

        playerDisplays.push(<div key={player_name} className={styles.player_icon} style={{
            left: x_center + right,
            top: y_center + up,
        }}>{player_name}</div>)

        i++
    })


    useEffect(() => {
        window.addEventListener("resize", () => {
            setWindowHeight(innerHeight)
            setWindowWidth(innerWidth)
        })
        setWindowHeight(innerHeight)
        setWindowWidth(innerWidth)

    }, [])

    return (
        <div className={styles.outer_container}>
            {playerDisplays}
        </div >

    )
}