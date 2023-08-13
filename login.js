import 'dotenv/config.js';
import net from 'net';
import {parsePacket} from './helpers.js';

net.createServer(function (socket) {
    const client = new net.Socket().connect(process.env.LOGIN_REMOTE_PORT, process.env.LOGIN_REMOTE_IP);

    /* Входящие */
    client.on('data', function (data) {
        const packet = parsePacket(data);

        /* Подменяем реальный IP на IP прокси (пакет со списком серверов 3101) */
        if (packet.id === 3101) {
            replaceIpAndPortToLocal(data);
        }

        socket.write(data);
    });

    /* Исходящие */
    socket.on('data', function (data) {
        client.write(data);
    });
}).listen(process.env.LOGIN_LOCAL_PORT);

function replaceIpAndPortToLocal(buffer) {
    const countServers = Math.round(buffer.byteLength / 119);

    let offset = 120;

    for (let i = 0; i < countServers; i++) {
        process.env.LOCAL_IP.split('.').forEach(value => {
            buffer.writeUInt8(value, offset++);
        });

        buffer.writeUint16BE(process.env.GAME_LOCAL_PORT, offset);

        offset += 115;
    }
}
