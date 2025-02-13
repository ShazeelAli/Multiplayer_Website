import { useEffect, useRef, useState } from 'react'
import styles from "./Sidebar.module.css"
import PlayerList from '../playerList';
import RoomState from 'utils/roomState';
import createQuery from 'utils/createQuery';
import { useQRCode } from 'next-qrcode';
import clientWebsocket from 'utils/clientWebsocket';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GamesEnum } from 'utils/game';

const sidebarWidth = "240px"
export default function Sidebar({ roomState, clientWebsocket }: { roomState: RoomState, clientWebsocket: clientWebsocket }) {
    const router = useRouter()
    //refs to the DOM elements for further style manipulations
    const sidebarRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const quickJoinButton = useRef<HTMLButtonElement>(null);
    const codeCopyButton = useRef<HTMLButtonElement>(null);
    const linkToShare = "" + createQuery("", { "room_code": roomState.roomCode })
    const { Canvas } = useQRCode();
    const toggle = () => {
        if (sidebarRef.current && toggleRef.current && containerRef.current) {
            //we check if the references to both of them exist
            if (containerRef.current.style.left == "0px") {
                containerRef.current.style.left = "-265px";
                toggleRef.current.innerText = "►"

            }
            else {
                containerRef.current.style.left = "0px";
                toggleRef.current.innerText = "◄"
            }
        }

    };

    const getQuickLink = () => {
        navigator.clipboard.writeText(linkToShare)
        quickJoinButton.current.textContent = "Copied to clipboard"
        setTimeout(() => {
            quickJoinButton.current.textContent = "Quick join link"
        }, 3000)
    }
    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomState.roomCode)
    }

    var returnToLobbyDisable = true
    if (clientWebsocket.socket) {
        if (clientWebsocket.socket?.id == roomState.host?.id) {
            returnToLobbyDisable = false
        }
    }
    return (
        <div ref={containerRef} className={styles.container}>
            <div ref={sidebarRef} className={styles.sidebar}>

                <span className={styles.top_half} >
                    <span className={styles.title_row}>
                        <h3 className={styles.room_code}>{roomState.roomCode}</h3>
                        <button onClick={copyRoomCode} style={{ fontSize: "25px", padding: 0, paddingBottom: "4px", marginLeft: "10px" }}>📋</button>
                    </span>
                    <button ref={quickJoinButton} onClick={getQuickLink}>Quick join link</button>
                    <Canvas text={linkToShare} options={{
                        color: {
                            light: "#ca9cf4",

                        }
                    }} />
                </span>

                <hr style={{ border: "5px solid #8a2be2" }}></hr>
                <PlayerList playerList={roomState.players}></PlayerList>
                <span style={{
                    display: "flex",
                    flexDirection: "row"
                }}>
                    <button onClick={() => { clientWebsocket.socket.emit('changeGame', GamesEnum.LOBBY) }} disabled={returnToLobbyDisable}>Return To Lobby</button>
                    <button onClick={() => { router.push("https://localhost") }}>Leave</button>
                </span>

            </div>
            <div ref={toggleRef} className={styles.toggle} onClick={toggle}>◄</div>
        </div>
    );
}
