
import { useRef, useEffect, MutableRefObject, useState } from "react"
import { useRouter } from "next/router"
import ClientWebsocket from "utils/clientWebsocket"
import GameFrame from "../components/gameFrame"
import RoomState from "../utils/roomState"
import { GamesEnum } from "../utils/game"
import styles from './room.module.css'
import Player from "../utils/player"
import Sidebar from "components/Sidebar/Sidebar"
import createQuery from "utils/createQuery"


export default function Room() {
    const router = useRouter()
    var clientWsRef: MutableRefObject<ClientWebsocket> = useRef<ClientWebsocket>(new ClientWebsocket())
    var [yourPlayer, setYourPlayer] = useState<Player>(null)
    var [roomName, setRoomName] = useState("HELLO")
    var [connected, setConnected] = useState(false)
    var [roomState, setRoomState] = useState<RoomState>(new RoomState('LOADING', GamesEnum.LOADING))
    var sidebarRef: MutableRefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)
    var mainContentRef: MutableRefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)
    var sidebarButtonRef: MutableRefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(null)


    function sendPlayerData() {
        var query = router.query
        // Send Player Name
        clientWsRef.current.socket.emit('sendPlayerData', query.player_name as string)
        // When Confirmed the Server has received PlayerData then either join or host 
        clientWsRef.current.socket.on('playerDataReceived', onPlayerDataReceived)
    }

    function onPlayerDataReceived() {
        var query = router.query
        if (query.code == "JOIN") {
            Join(query.room_code)
        } else if (query.code == "HOST") {
            Host()
        }
    }

    function Host() {
        clientWsRef.current.socket.emit('host')
        clientWsRef.current.socket.on('hostSuccess', (room) => { HostSuccess(room) })
    }

    function Join(room_code) {
        clientWsRef.current.socket.emit('join', room_code)
        clientWsRef.current.socket.on('joinSuccess', (room) => { JoinSuccess(room) })
        clientWsRef.current.socket.on('joinFail', (error_message) => { console.log(error_message) })
    }

    function JoinSuccess(room: RoomState) {
        setRoomState(room)
        clientWsRef.current.socket.on('updateRoomState', (room) => setRoomState(room))
    }

    function HostSuccess(room: RoomState) {
        router.push(createQuery(`room`, { "code": "JOIN", "room_code": room.roomCode, "player_name": router.query.player_name }))
        setRoomState(room)
        clientWsRef.current.socket.on('updateRoomState', (room) => setRoomState(room))

    }

    //Connect To Server
    useEffect(() => {
        clientWsRef.current.connect(() => {
            setConnected(true)
        })
    }, [])

    useEffect(() => {
        if (router.isReady && connected) {
            sendPlayerData()
        }
    }, [router.isReady, connected])


    var display = <GameFrame clientWebsocket={clientWsRef.current} roomState={roomState} ></GameFrame>
    var sidebar = <Sidebar roomState={roomState}></Sidebar>

    return (
        <div className="frameDiv">
            <div className={styles.content} ref={mainContentRef}>
                {sidebar}
                {display}
            </div>
        </div>

    )
}
