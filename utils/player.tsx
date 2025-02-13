import { ClientToServerEvents, ServerToClientEvents } from "common"
import { Socket } from "socket.io-client"

export default class Player {
    name: string
    id: string
    webRTCID: number
    room_code: string
    score: number
    constructor(name: string, id: string, webRTCID: number) {
        this.id = id
        this.name = name
        this.room_code = ""
        this.webRTCID = webRTCID
        this.score = 0
    }
}