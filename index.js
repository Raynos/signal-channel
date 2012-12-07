var MuxMemo = require("mux-memo")
    , Peers = require("peer-nodes")
    , PeerConnectionShim = require("peer-connection-shim")
    , Network = require("peer-connection-network")

    , echo = require("./echo")
    , scuttlebutt = require("./scuttlebutt")
    , relay = require("./relay")

module.exports = SignalChannel

function SignalChannel(namespace, options) {
    options = options || {}

    if (!namespace) {
        namespace = "default@namespace"
    }

    if (typeof options === "string") {
        options = { uri: options }
    }

    if (!options.uri) {
        options.uri = "//signalchannel.co/sock"
    }

    if (!options.createConnection) {
        options.createPeerConnection = createPeerConnection
    }

    var mdm = MuxMemo(options.uri)

    return {
        createPeers: createPeers
        , createNode: createNode
    }

    function createPeers() {
        var peerStream = scuttlebutt(mdm, namespace)
            , peers = Peers()

        peerStream
            .pipe(peers.createStream())
            .pipe(peerStream)

        return peers
    }

    function createNode(onConnection) {
        var networkStream = echo(mdm, namespace)
            , node = Network(createPeerConnection)

        networkStream
            .pipe(node.createStream())
            .pipe(networkStream)

        if (onConnection) {
            node.on("connection", onConnection)
        }

        return node
    }

    function createPeerConnection() {
        return PeerConnectionShim({
            stream: relay(mdm, namespace)
        })
    }
}
