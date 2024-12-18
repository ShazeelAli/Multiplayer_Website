import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";


export default function FibbageHostStart({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {
    const chatAreaRef = useRef<HTMLDivElement>();
    const [msgList, setMsgList] = useState<JSX.Element[]>([])
    const [canSend, setCanSend] = useState<boolean>(false)
    var socket = clientWebsocket.socket
    var message: string = ""


    const startGame = () => {
        socket.emit("relay", {
            code: "start_game"
        })
    }

    return (
        <div>
            <h1> FIBBAGE </h1>
            <button onClick={startGame}>START GAME</button>
        </div >

    )
}