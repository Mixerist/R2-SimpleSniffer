const net = require('net')
const fs = require('fs')

net.createServer(function (socket) {
    const client = new net.Socket().connect(11004, '186.2.171.35')

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
            data.writeUint16BE(11006, 243)

            socket.write(data)
        } else {
            socket.write(data)
        }
    })

    /* Исходящие */
    socket.on('data', function (data) {
        client.write(data)

        console.log(parsePacket(data))
    })
}).listen(22888)

function parsePacket(data) {
    if (!!data.readUint8(2)) {
        const encryptedPacket = data
        const xor = fs.readFileSync('xor.key')

        const result = encryptedPacket.map((first, second) => first ^ xor[second])

        return {
            length: result.readUInt16LE(0),
            is_encrypted: !!result.readUint8(2),
            number: result.readUint8(3),
            packet_id: result.readUInt16LE(4),
            data: result.slice(6).toString('hex')
        }
    }

    return {
        length: data.readUInt16LE(0),
        is_encrypted: !!data.readUint8(2),
        number: data.readUint8(3),
        packet_id: data.readUInt16LE(4),
        data: data.slice(6).toString('hex')
    }

}
