var MuxDemux = require("mux-demux")
    , PeerConnectionShim = require("peer-connection-shim")
    , Peers = require("peer-nodes")
    , inject = require("reconnect/inject")
    , uuid = require("node-uuid")
    , MuxMemo = require("mux-memo")
    , PeerConnectionPool = require("peer-connection-pool")

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
            , poolStream = echo(mdm, namespace)
            , createPeerConnection = options.createConnection ||
                createPeerConnectionShim
            , peers = Peers()
            , pool = PeerConnectionPool(createPeerConnection)

        peerStream.pipe(peers.createStream()).pipe(peerStream)
        poolStream.pipe(pool.createStream()).pipe(poolStream)

        callback(peers, pool)

        function createPeerConnectionShim() {
            return PeerConnectionShim({
                stream: relay(mdm, namespace)
            })
        }
    }).listen(uri)
}
