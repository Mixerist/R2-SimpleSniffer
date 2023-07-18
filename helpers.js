import fs from "fs"

export function parsePacket(data) {
    if (!!data.readUint8(2)) {
        const encryptedPacket = data
        const xorKey = fs.readFileSync('xor.key')

        const result = encryptedPacket.map((first, second) => first ^ xorKey[second])

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
