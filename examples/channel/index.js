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

    onConnection(node.connect(peer.id))
})

node.listen(id)
peers.join({ id: id })

function onConnection(stream) {
    stream.pipe(WriteStream(function (data) {
        console.log("got data", data, "from", stream.peerId)
    }))

    stream.write("some data to" + id)
}
