import "dotenv/config.js"
import net from "net"

net.createServer(function (socket) {
    const client = new net.Socket().connect(process.env.GAME_REMOTE_PORT, process.env.GAME_REMOTE_IP)

    /* Входящие */
    client.on('data', function (data) {
        socket.write(data)
    })

    /* Исходящие */
    socket.on('data', function (data) {
        client.write(data)
    })
}).listen(process.env.GAME_LOCAL_PORT)
