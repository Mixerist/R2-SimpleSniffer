import fs from 'fs';

function getPacketNameById(packetId) {
    let json;

    if (packetId >= 1000 && packetId <= 1131) {
        json = fs.readFileSync('packets/EFnlFwCTr.json');
    } else if (packetId >= 2000 && packetId <= 2129) {
        json = fs.readFileSync('packets/EFnlAppCTr.json');
    } else if (packetId >= 3000 && packetId <= 3128) {
        json = fs.readFileSync('packets/EChannelTr.json');
    } else if (packetId >= 5000 && packetId <= 6174) {
        json = fs.readFileSync('packets/EFieldTr.json');
    } else {
        throw new Error(`Unknown packet ${packetId}`);
    }

    const jsonObject = JSON.parse(json);

    return packetId in jsonObject ? jsonObject[packetId] : '';
}

export function parsePacket(data) {
    if (!!data.readUint8(2)) {
        const xorKey = fs.readFileSync('xor.key');
        const decrypted = data.map((value, index) => value ^ xorKey[index]);

        return {
            length: decrypted.readUInt16LE(0),
            is_encrypted: !!decrypted.readUint8(2),
            number: decrypted.readUint8(3),
            id: decrypted.readUInt16LE(4),
            name: getPacketNameById(decrypted.readUInt16LE(4)),
            data: decrypted.slice(6).toString('hex')
        };
    }

    return {
        length: data.readUInt16LE(0),
        is_encrypted: !!data.readUint8(2),
        number: data.readUint8(3),
        id: data.readUInt16LE(4),
        name: getPacketNameById(data.readUInt16LE(4)),
        data: data.slice(6).toString('hex')
    };
}
