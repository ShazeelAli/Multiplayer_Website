import { useEffect, useRef, useState } from "react";
import clientWebsocket from "utils/clientWebsocket";
import Player from "utils/player";
import RoomState from "utils/roomState";

export default function Chatroom({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {
    const chatAreaRef = useRef<HTMLDivElement>();
    const [msgList, setMsgList] = useState<JSX.Element[]>([])
    const [canSend, setCanSend] = useState<boolean>(false)
    var socket = clientWebsocket.socket
    var message: string = ""

    useEffect(() => {
        socket.on('relayReceive', (msg) => {
            console.log(msg)
            var playerName = msg['player'].name

            setMsgList([...msgList, <div key={msg['message']}>{playerName + ":" + msg["message"]}</div>])
        })
    }, [])


    const handleInputMessage = (e) => {
        const fieldValue = e.target.value;
        message = fieldValue
        if (message.length == 0) {
            setCanSend(false)
        }
        else {
            setCanSend(true)
        }
    }

    const sendMessage = () => {
        socket.emit('relay', {
            "message": message
        })
    }

    return (
        <div>
            <h1>CHATTTTT ROOOOMMMMMMMM!!!</h1>
            {msgList}
            <input type="text" name="Room_Code" onChange={handleInputMessage} />
            <button disabled={!canSend} onClick={sendMessage}> Send </button>
        </div >

    )
}