var SignalChannel = require("../../index")
    , uuid = require("node-uuid")
    , WriteStream = require("write-stream")

    , channel = SignalChannel("unique namespace")
    , peers = channel.createPeers()
    , node = channel.createNode(onConnection)
    , id = uuid()

peers.on("join", function (peer) {
    if (peer.id <= id) {
        // other side will open this connection
        return
    }

    onConnection(node.connect(peer.id), true)
})

console.log("listening on", id)

node.listen(id)
peers.join({ id: id })

function onConnection(pc, opened) {
    if (opened) {
        return next(pc.createStream("x"))
    }

    pc.on("connection", next)

    function next(stream) {
        stream.pipe(WriteStream(function (data) {
            console.log("got data", data, "from", pc.peerId)
        }))

        stream.write("some data to " + pc.peerId)
    }
}
