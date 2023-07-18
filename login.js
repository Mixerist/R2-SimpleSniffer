import "dotenv/config.js"
import net from "net"
import {parsePacket} from "./helpers.js"

net.createServer(function (socket) {
    const client = new net.Socket().connect(process.env.LOGIN_REMOTE_PORT, process.env.LOGIN_REMOTE_IP)

    /* Входящие */
    client.on('data', function (data) {
        /* ID пакета размером 2 байта */
        const packetId = data.readUInt16LE(4)

        /* Подменяем реальный IP на IP прокси (пакет со списком серверов 3101) */
        if (packetId === 3101) {
            /* IP */
            data.writeUInt8(127, 239)
            data.writeUInt8(0, 240)
            data.writeUInt8(0, 241)
            data.writeUInt8(1, 242)

            /* Порт */
            data.writeUint16BE(process.env.GAME_LOCAL_PORT, 243)

            socket.write(data)
        } else {
            socket.write(data)
        }
    })

    /* Исходящие */
    socket.on('data', function (data) {
        console.log(parsePacket(data))

        client.write(data)
    })
}).listen(process.env.LOGIN_LOCAL_PORT)
