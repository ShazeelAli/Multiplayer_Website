import Player from "utils/player"
import RoomState from "utils/roomState"
import { GamesEnum } from "utils/game"
export interface ServerToClientEvents {
    playerDataReceived: (player: Player) => void
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
    relayTarget: (targetID: string, msg: Object) => void
    updateScore: (playerToUpdate: Player, scoreToAdd: number) => void
    setScore: (playerToUpdate: Player, score: number) => void,
    updateScoreAll: (scoreToAdd: number) => void,
    setScoreAll: (score: number) => void,
    changeGame: (nextGame: GamesEnum) => void

}





