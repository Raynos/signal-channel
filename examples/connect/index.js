var uuid = require("node-uuid")
    , WriteStream = require("write-stream")
    , connect = require("../../connect")

connect({
    uri: "//signalchannel.co/sock"
}, function (peers, pool) {
    var id = uuid()

    pool.listen(id).on("connection", gotStream)

    peers.on("join", function (peer) {
        if (peer.id <= id) {
            return
        }

        gotStream(pool.connect(peer.id))
    })

    peers.join({ id: id})

    function gotStream(stream) {
        console.log("got a stream", stream)
        stream.pipe(WriteStream(function (data) {
            console.log("got data", data, "from", stream.peerId)
        }))

        stream.write("some data to" + id)
    }
})
