import Player from "utils/player"
import RoomState from "utils/roomState"

export interface ServerToClientEvents {
    playerDataReceived: () => void
    hostSuccess: (room: RoomState) => void
    joinSuccess: (room: RoomState) => void
    joinFail: (error: string) => void
    updateRoomState: (room: RoomState) => void
    relayReceive: (msg: Object) => void
}

export interface ClientToServerEvents {
    sendPlayerData: (playerName: string) => void
    host: () => void
    join: (roomCode: string) => void
    relay: (msg: Object) => void
    updateScore: (playerToUpdate: Player, scoreToAdd: number) => void

}





