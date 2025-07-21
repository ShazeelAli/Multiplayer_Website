'use client'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import react_dom from "react-dom/client"
import { SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime'
let socket


export default function Home() {
    const router = useRouter()
    const socketRef = useRef(null)
    const [roomData, setRoomData] = useState({})
    const [frameSrc, setFrameSrc] = useState("/WebRTCTestIFrame2/WebRTCTest.html")


    // Iframe Messaging Setup
    const IFrameForMessage = useRef()
    const [gameFrame, setGameFrame] = useState(<iframe
        src={frameSrc}
        width={'100%'}
        ref={IFrameForMessage}
        height={'100%'}
    />)

    useEffect(() => {
        window.addEventListener("message", (event) => {
            console.log(event)
            if (event.data.code == "frame_loaded") {
                console.log("FRAME LOADED SENDING MESSAGE")
                var message = {
                    code: "Join",
                    room_code: router.query.room_code
                }
                console.log(message)
                message = JSON.stringify(message)
                console.log(message)
                gameFrame.ref.current.contentWindow.postMessage("" + message)
            }
        })
    }, [])

    useEffect(() => {
        setGameFrame(<iframe
            src={frameSrc}
            width={'100%'}
            ref={IFrameForMessage}
            height={'450px'}
        />)
    }, [frameSrc])

    useEffect(() => {
        if (!router.isReady) { return }

    }, [gameFrame, router.isReady])

    //Setup
    useEffect(() => {
        async function socketInitializer(params) {
            await fetch('/api/server')
            if (socketRef.current) {
                return;
            }
            socketRef.current = io()
            var socket = socketRef.current

            socket.on('connect', () => {
                //console.log('connected')
            })

            socket.on('message', msg => {
                var message = JSON.parse(msg);
                received_packet(message)
            })
        }
        socketInitializer()
    })

    function received_packet(message) {
        switch (message.code) {
            case "CONNECTION_SUCCESS":
                id = message.id
                switch (router.query.code) {
                    case "JOIN":
                        var message = {
                            "code": "JOIN",
                            "room_code": router.query.room_code
                        }
                        socket.emit("message", JSON.stringify(message))
                        break;
                    case "HOST":
                        var message = {
                            "code": "HOST",
                            "game_type": "Undecided",
                            "game_name": "Undecided"
                        }
                        socket.emit("message", JSON.stringify(message))
                }


                if (router.query.host) {
                    var message = {
                        "code": "HOST",
                        "game_type": "WebRTC",
                        "game_name": "WebRTCTest"
                    }
                    socket.emit("message", JSON.stringify(message))
                }

            case "HOST_SUCCESS":
                is_host = true;
            case "JOIN_SUCCESS":

                break;
            case "PLAYER_JOINED":
                //peerJoined.emit(message.id, true)
                break;
            case "ice":
                //iceComing.emit(message.mid, message.index, message.sdp, message.sender_id)
                break;
            case "session":
                //sessionComing.emit(message.type, message.sdp, message.sender_id)
                break;
        }




    }

    return (
        <div className="flex-container">
            {gameFrame}
        </ div>
    );
}
