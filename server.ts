import http from 'http'
import https from 'https'
import fs from 'fs'
import { parse } from 'url'
import next from 'next'

const port = parseInt(process.env.PORT || '443', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()


// This line is from the Node.js HTTPS documentation.
const options = {
    key: fs.readFileSync('https/key.pem'),
    cert: fs.readFileSync('https/cert.pem')
};

app.prepare().then(() => {
    https.createServer((req, res) => {
        const parsedUrl = parse(req.url!, true)
        handle(req, res, parsedUrl)
    }).listen(port)

    console.log(
        `> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV
        }`
    )
})
