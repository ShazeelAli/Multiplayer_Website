import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { GamesFull } from "../utils/game";
import createQuery from "utils/createQuery";
import styles from "./index.module.css"
export default function Home() {
  /** @type {[string, (value: string) => void]} */
  const [gameName, setGameName] = useState("Enter a room code or host a game");
  const [roomCode, setRoomCode] = useState("")
  const [validRoom, setValidRoom] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [charactersRemaining, setCharactersRemaining] = useState(15)
  const router = useRouter()



  const onPressJoin = (e) => {
    if (validRoom) {
      router.push(createQuery(`room`, { "code": "JOIN", "room_code": roomCode, "player_name": playerName }))
      console.log(roomCode);
    }
  }

  const onPressHost = (e) => {
    router.push(createQuery(`room`, { "code": "HOST", "player_name": playerName }))
  }

  const handleInputRoom = (e) => {
    const fieldValue = e.target.value;
    getRoomAvailable(fieldValue);

  }

  const handleInputName = (e) => {
    const fieldValue: string = e.target.value;
    setCharactersRemaining(15 - fieldValue.length)
    setPlayerName(fieldValue)
  }

  useEffect(() => {
    if (router.query.room_code) {
      setRoomCode(router.query.room_code as string)
      getRoomAvailable(router.query.room_code as string)
    }
  }, [router.isReady])

  async function getRoomAvailable(roomCodeToFind) {
    setRoomCode(roomCodeToFind)
    if (!roomCodeToFind) {
      setGameName("Enter a room code or host a game")
      setValidRoom(false);
      return;
    }

    var url = `/api/server/room_code/${roomCodeToFind}`;
    try {
      const response = await fetch(url, {
        cache: "no-store",
      });
      if (!response.ok) {
        setGameName("Failed to connect to server")
        setValidRoom(false)
        throw new Error(`Response status: ${response.status}`);
      }
      console.log(response)
      const json = await response.json();

      if (json.code == "success") {
        setGameName(json.gameName);
        setValidRoom(true);
      }
      else {
        setGameName("NO ROOM FOUND")
        setValidRoom(false)
      }

    } catch (error) {
      console.error(error.message);
    }

  }
  return (
    <div className={styles.outerFrame}>

      <div className={styles.headerBar}>
        <h1>RANDOM PARTY PACK</h1>
      </div>

      <div className={styles.innerFrame}>
        <h3>{gameName}</h3>
        <div className={styles.input_container} >

          <div className={styles.name_label_container}>
            <div className={styles.label}>Name</div>
            <div>{charactersRemaining}</div>
          </div>

          <input type="text" name="Name" onChange={handleInputName} className={styles.text_input} maxLength={15} />
        </div>


        < div className={styles.input_container} >
          <p className={styles.label}>Room Code</p>
          <input type="text" name="Room_Code" onChange={handleInputRoom} defaultValue={roomCode} className={styles.text_input} />
        </div>

        <div className={styles.button_container}>
          <button onClick={onPressHost} disabled={!(playerName.trim().length > 0)} className={styles.button}> Host </button>
          <button onClick={onPressJoin} disabled={!validRoom || !(playerName.trim().length > 0)} className={styles.button} > Join </button>
        </div>
      </div>
    </ div >

  );
}

