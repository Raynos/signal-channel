var sock = require("sockjs-stream")
    , MuxDemux = require("mux-demux")
    , Individual = require("individual")

    , sockPool = Individual("__SIGNAL_CHANNEL_POOL", {})

module.exports = Connection

function Connection(uri, namespace) {
    var mdm
    if (sockPool[uri]) {
        mdm = sockPool[uri]
    } else {
        var stream = sock(uri + "/sock")
            , mdm = MuxDemux()

        stream.pipe(mdm).pipe(stream)
    }

    return mdm.createStream(namespace)
}
