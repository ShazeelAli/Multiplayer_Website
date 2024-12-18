import { useEffect, useRef, useState } from 'react'
import styles from "./Sidebar.module.css"
import PlayerList from '../playerList';
import RoomState from 'utils/roomState';
import createQuery from 'utils/createQuery';
import { useQRCode } from 'next-qrcode';
const sidebarWidth = "240px"
export default function Sidebar({ roomState }: { roomState: RoomState }) {

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
                containerRef.current.style.left = "-260px";
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
            quickJoinButton.current.textContent = "Click for quick join link"
        }, 3000)
    }
    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomState.roomCode)
    }


    return (
        <div ref={containerRef} className={styles.container}>
            <div ref={sidebarRef} className={styles.sidebar}>

                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                        <h3 className={styles.roomCode}>{roomState.roomCode}</h3>
                        <button onClick={copyRoomCode} style={{ fontSize: "15px", padding: 0, marginLeft: "10px" }}>📋</button>
                    </span>
                    <button ref={quickJoinButton} onClick={getQuickLink}>Click for quick join link</button>
                    <Canvas text={linkToShare} />
                </span>

                <hr></hr>
                <PlayerList playerList={roomState.players}></PlayerList>

            </div>
            <div ref={toggleRef} className={styles.toggle} onClick={toggle}>◄</div>
        </div>
    );
}
