import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";

import FibbageClient from "./Client/Client";
import FibbageHost from "./Host/Host";

import { MedievalSharp } from 'next/font/google'
export const medieval_sharp = MedievalSharp({ weight: ["400"], subsets: ["latin"], variable: "--font-medieval-sharp" })

import sharedStyles from "./SharedStyles.module.css"
export default function FibbageMain({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {
    const chatAreaRef = useRef<HTMLDivElement>();
    const [msgList, setMsgList] = useState<JSX.Element[]>([])
    const [canSend, setCanSend] = useState<boolean>(false)
    var socket = clientWebsocket.socket
    var message: string = ""
    var display = <FibbageClient roomState={roomState} clientWebsocket={clientWebsocket}></FibbageClient>
    if (roomState.host.id == clientWebsocket.socket.id) {
        display = <FibbageHost roomState={roomState} clientWebsocket={clientWebsocket}></FibbageHost>
    }



    return (
        <div className={sharedStyles.full} style={medieval_sharp.style}>
            {display}
        </div >

    )
}