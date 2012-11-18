var shoe = require("shoe")
    , MuxDemux = require("mux-demux")
    , Router = require("stream-router")

    , sock = shoe(connection)

module.exports = sock

function connection(stream) {
    var router = Router()
        , mdm = MuxDemux(router)

    router.addRoute("/v1/relay", require("./routes/relay"))

    mdm.pipe(stream).pipe(mdm)
}
