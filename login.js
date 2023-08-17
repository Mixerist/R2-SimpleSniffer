import 'dotenv/config.js';
import net from 'net';
import { parsePacket } from './helpers.js';

net.createServer(function (socket) {
    const client = new net.Socket().connect(process.env.LOGIN_REMOTE_PORT, process.env.LOGIN_REMOTE_IP);

    /* Входящие */
    client.on('data', data => {
        const packet = parsePacket(data);

        if (packet.id === 3101) {
            getServerInfo(data);
            replaceIpAndPortToLocal(data);
        }

        socket.write(data);
    });

    /* Исходящие */
    socket.on('data', data => client.write(data));
}).listen(process.env.LOGIN_LOCAL_PORT);

/**
 * Подмена реального IP и порта на локальный.
 *
 * @param {Buffer} buffer
 */
function replaceIpAndPortToLocal(buffer) {
    let offset = 120;

    for (let i = 0; i < buffer.readUint8(14); i++) {
        process.env.LOCAL_IP.split('.').forEach(value => {
            buffer.writeUInt8(value, offset++);
        });

        buffer.writeUint16BE(process.env.GAME_LOCAL_PORT, offset);

        offset += 115;
    }
}

/**
 * Информация о доступных серверах.
 *
 * @param {Buffer} buffer
 */
function getServerInfo(buffer) {
    let offset = 15;

    for (let i = 0; i < buffer.readUint8(14); i++) {
        console.log({
            IsValid: buffer.readUint8(offset),
            Field: buffer.readUint16LE(offset + 1),
            WorldNm: buffer.slice(offset + 3, offset + 103).filter(value => value).toString('ascii'),
            SvrState: buffer.readUint8(offset + 104),
            Ip: `${buffer.readUint8(offset + 105)}.${buffer.readUint8(offset + 106)}.${buffer.readUint8(offset + 107)}.${buffer.readUint8(offset + 108)}`,
            Port: buffer.readUint16BE(offset + 109),
            ServerType: buffer.readInt32LE(offset + 111),
            IsChaosBattle: buffer.readInt32LE(offset + 115)
        });

        offset += 119;
    }
}
