var sock = require("sockjs-stream")
    , MuxDemux = require("mux-demux")
    , Individual = require("individual")
    , uuid = require("node-uuid")

    , sockPool = Individual("__SIGNAL_CHANNEL_POOL", {})
    , defaultUri = "//signalchannel.co"

module.exports = Connection

function Connection(uri, namespace) {
    var mdm

    uri = uri || defaultUri

    if (sockPool[uri]) {
        mdm = sockPool[uri]
    } else {
        var stream = sock(uri + "/sock")
            , mdm = MuxDemux()

        stream.pipe(mdm).pipe(stream)
    }

    return mdm.createStream(namespace + "/" + uuid())
}
