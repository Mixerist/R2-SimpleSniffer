const net = require('net')

net.createServer(function (socket) {
    const client = new net.Socket().connect(11006, '186.2.171.35')

    /* Входящие */
    client.on('data', function (data) {
        socket.write(data)
    })

    /* Исходящие */
    socket.on('data', function (data) {
        client.write(data)
    })
}).listen(11006)
