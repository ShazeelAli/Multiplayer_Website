import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { GamesFull } from "../utils/game";
import createQuery from "utils/createQuery";
export default function Home() {
  /** @type {[string, (value: string) => void]} */
  const [gameName, setGameName] = useState("NO ROOM FOUND");
  const [roomCode, setRoomCode] = useState("")
  const [validRoom, setValidRoom] = useState(false)
  const [playerName, setPlayerName] = useState("")
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
    const fieldValue = e.target.value;
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
      setGameName("NO ROOM FOUND");
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
    <div className="frameDiv">
      <h1>{gameName}</h1>
      < div className='nameBox' >
        <label>Name : </label> <input type="text" name="Name" onChange={handleInputName} />
      </div>
      < div className='joinBox' >
        <label>Room_Code : </label>
        < input type="text" name="Room_Code" onChange={handleInputRoom} defaultValue={roomCode} />
        <button onClick={onPressJoin} disabled={!validRoom || !(playerName.trim().length > 0)
        } > Join </button>
      </div>
      <div>
        <button onClick={onPressHost} disabled={!(playerName.trim().length > 0)}> Host </button>
      </div>


    </ div >

  );
}

