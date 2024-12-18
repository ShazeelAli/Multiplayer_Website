import { ClientToServerEvents, ServerToClientEvents } from "common"
import { Socket } from "socket.io-client"

export default class Player {
    name: string
    id: string
    room_code: string
    score: number
    constructor(name: string, id: string) {
        this.id = id
        this.name = name
        this.room_code = ""
        this.score = 0
    }
}