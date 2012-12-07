var PeerConnectionShim = require("peer-connection-shim")
    , Peers = require("peer-nodes")
    , inject = require("reconnect/inject")
    , MuxMemo = require("mux-memo")
    , PeerConnectionNetwork = require("peer-connection-network")

    , echo = require("./echo")
    , scuttlebutt = require("./scuttlebutt")
    , relay = require("./relay")

    , reconnect = inject(MuxMemo)

module.exports = connect

function connect(options, callback) {
    var uri = options.uri
        , namespace = options.namespace

    reconnect(function (mdm) {
        var peerStream = scuttlebutt(mdm, namespace)
            , networkStream = echo(mdm, namespace)
            , createPeerConnection = options.createConnection ||
                createPeerConnectionShim
            , peers = Peers()
            , network = PeerConnectionNetwork(createPeerConnection)

        peerStream
            .pipe(peers.createStream())
            .pipe(peerStream)

        networkStream
            .pipe(network.createStream())
            .pipe(networkStream)

        callback(peers, network)

        function createPeerConnectionShim() {
            return PeerConnectionShim({
                stream: relay(mdm, namespace)
            })
        }
    }).listen(uri)
}
