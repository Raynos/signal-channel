var MuxDemux = require("mux-demux")
    , PeerConnectionShim = require("peer-connection-shim")
    , Peers = require("peer-nodes")
    , reconnect = require("reconnect/sock")
    , uuid = require("node-uuid")
    , PeerConnectionPool = require("peer-connection-pool")

module.exports = connect

function connect(options, callback) {
    var uri = options.uri
        , namespace = options.namespace

    // Connect to the remote sockJS server which acts as a
    // signal channel and a relay server
    reconnect(function (stream) {

        // Multiplex the connection due to sockJS limitation
        // Open up three streams for peer list replication,
        // signal channel for the pool & and the relay stream
        // for the peer connection shim
        var mdm = MuxDemux()

        stream.pipe(mdm).pipe(stream)

        var peerStream = open(mdm, "scuttlebutt", namespace)
            , poolStream = open(mdm, "echo", namespace)
            , peers = Peers()
            // Pass the pool a function which generates a new
            // PeerConnection. In this case use the shim but in
            // the future just use webrtc
            , pool = PeerConnectionPool(function () {
                var relayStream = open(mdm, "relay", namespace)
                return PeerConnectionShim({
                    stream: relayStream
                })
            })

        // pump the streams up
        peerStream.pipe(peers.createStream()).pipe(peerStream)
        poolStream.pipe(pool.createStream()).pipe(poolStream)

        // pass peers & pool to callback
        callback(peers, pool)
    }).listen(uri)
}

function open(mdm, type, namespace) {
    return mdm.createStream("/v1/" + type + "/" +
        encodeURIComponent(namespace || "@") + "/" +
        encodeURIComponent(uuid()))
}
