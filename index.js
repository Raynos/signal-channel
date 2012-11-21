var shoe = require("shoe")
    , MuxDemux = require("mux-demux")
    , Router = require("stream-router")

    , sock = shoe(connection)

module.exports = sock

function connection(stream) {
    var router = Router()
        , mdm = MuxDemux(router)

    router.addRoute("/v1/relay/:group?"
        , require("./routes/relay"))
    router.addRoute("/v1/echo/:group?"
        , require("./routes/echo"))
    router.addRoute("/v1/scuttlebutt/:group?"
        , require("./routes/scuttlebutt"))

    mdm.pipe(stream).pipe(mdm)
}
