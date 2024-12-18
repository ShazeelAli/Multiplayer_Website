import { Server } from 'socket.io'
import { ServerToClientEvents, ClientToServerEvents } from "common"
import RoomState from "../../../utils/roomState"
import { GamesEnum, GamesFull } from '../../../utils/game';
import Player from "../../../utils/player"
import { Socket } from 'socket.io';
const clients = new Map<Socket<ClientToServerEvents, ServerToClientEvents>, Player>();
const rooms = new Map<string, RoomState>();
const ROOM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
var peers_count = 0;

function create_room_code() {
    var id = ""
    for (let i = 0; i < 5; i++) {
        var random_number = Math.floor(Math.random() * ROOM_CODE_CHARS.length)
        var random_char = ROOM_CODE_CHARS[random_number]
        id += random_char
    }
    if (rooms.has(id)) {
        return create_room_code()
    }
    return id
}

function create_peer_id() {
    return Math.floor(Math.random() * 100000)
}

const SocketHandler = (req, res) => {
    var query;
    if (Object.keys(req.query).length > 0) {
        query = req.query.socket;
    }
    if (query) {
        switch (query[0]) {
            case "room_code":
                console.log(rooms)
                if (rooms.has(query[1])) {
                    res.status(200)
                    console.log(GamesFull.get(rooms.get(query[1]).currentGame).gameName)
                    res.send({
                        "code": "success",
                        "gameName": GamesFull.get(rooms.get(query[1]).currentGame).gameName,
                    })
                } else {
                    res.status(200)
                    res.send({
                        "code": "fail",
                    })
                }
                break;
        }
        return;
    }

    if (res.socket.server.io) {

    } else {

        const io = new Server<ClientToServerEvents, ServerToClientEvents>(res.socket.server)
        res.socket.server.io = io

        io.on("connection", socket => {
            socket.on('sendPlayerData', (playerName: string) => {
                createPlayer(playerName, socket)
                socket.emit('playerDataReceived')
            })

            socket.on('host', () => {
                var room = new RoomState(create_room_code(), GamesEnum.FIBBAGE, clients.get(socket))
                room.addPlayer(clients.get(socket))
                rooms.set(room.roomCode, room)
                console.log(rooms)
                clients.get(socket).room_code = room.roomCode
                socket.join(room.roomCode)
                socket.emit('hostSuccess', room)
            })

            socket.on('join', (room_code) => {
                if (rooms.has(room_code)) {
                    var room = rooms.get(room_code)
                    var player = clients.get(socket)
                    console.log(room.inactive_players)
                    console.log(player.name)
                    console.log(room.inactive_players.hasOwnProperty(player.name))
                    if (room.inactive_players.hasOwnProperty(player.name)) {
                        var oldPlayer = room.inactive_players[player.name]
                        room.reactivatePlayer(oldPlayer, socket.id)
                        clients.set(socket, oldPlayer)

                    } else if (room.players.hasOwnProperty(player.name)) {
                        socket.emit('joinFail', "NAME TAKEN")
                        return
                    } else {
                        room.addPlayer(clients.get(socket))
                    }

                    clients.get(socket).room_code = room.roomCode
                    socket.join(room.roomCode)
                    socket.emit('joinSuccess', room)
                    syncRoomState(io, room)
                }
                else {
                    socket.emit('joinFail', "ROOM NOT FOUND")
                }

            })

            socket.on('relay', (msg) => {
                var player: Player = clients.get(socket)
                var room: RoomState = rooms.get(player.room_code)
                msg['player'] = player
                io.to(player.room_code).emit('relayReceive', msg)
            })

            socket.on('disconnect', () => {

                var player: Player = clients.get(socket)
                console.log("Disconnect")
                console.log(player)
                if (player.room_code != "") {
                    var room = rooms.get(player.room_code)
                    room.deactivatePlayer(player)
                    clients.delete(socket)
                    syncRoomState(io, room)
                }
                socket.leave(player.room_code)

            })

            socket.on('updateScore', (playerToUpdate, scoreToAdd) => {
                var tempSocket = io.sockets.sockets.get(playerToUpdate.id)
                var player = clients.get(tempSocket)
                player.score += scoreToAdd
                syncRoomState(io, rooms.get(clients.get(socket).room_code))

            })
        })


    }


    res.end()
}


function createPlayer(playerName, socket) {
    var player = new Player(playerName, socket.id)
    clients.set(socket, player)
}

function syncRoomState(io: Server<ClientToServerEvents, ServerToClientEvents>, roomToSync: RoomState) {
    io.to(roomToSync.roomCode).emit('updateRoomState', roomToSync)
}



export default SocketHandler