import { Socket } from "socket.io-client"
import { Game, GamesEnum } from "./game"
import Player from "./player"
import { ClientToServerEvents, ServerToClientEvents } from "common"

export default class RoomState {
    roomCode: string
    host: Player
    players: Object
    inactive_players: Object
    currentGame: GamesEnum
    constructor(roomCode: string, currentGame: GamesEnum, host: Player) {
        this.roomCode = roomCode
        this.currentGame = currentGame
        this.host = host
        this.players = {}
        this.inactive_players = {}
    }

    addPlayer(playerToAdd: Player) {
        this.players[playerToAdd.name] = playerToAdd
    }

    deactivatePlayer(playerToDeactivate: Player) {
        delete this.players[playerToDeactivate.name]
        this.inactive_players[playerToDeactivate.name] = playerToDeactivate
        playerToDeactivate.id = ""
    }

    reactivatePlayer(playerToReactivate: Player, newSocketID: string) {
        delete this.inactive_players[playerToReactivate.name]
        this.players[playerToReactivate.name] = playerToReactivate
        playerToReactivate.id = newSocketID
    }

    setHost(hostPlayer: Player) {
        this.host = hostPlayer
    }

}