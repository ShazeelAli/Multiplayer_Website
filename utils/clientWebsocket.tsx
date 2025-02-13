
import { ClientToServerEvents, ServerToClientEvents } from 'common'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { Socket } from 'socket.io-client'
import io from 'socket.io-client'



async function socketInitializer(clientws: clientWebsocket, _callback: Function) {
    await fetch('/api/server')
    clientws.socket = io()
    clientws.socket.on('connect', () => {
        console.log('connected')
        _callback()
    })
}



export default class clientWebsocket {
    name: String
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
    constructor() {
        this.socket = null
    }

    connect(_callback: Function) {
        socketInitializer(this, _callback)

    }


}


