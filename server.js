var shoe = require("shoe")
    , MuxDemux = require("mux-demux")
    , Router = require("stream-router")
    , Logger = require("mux-demux-logger")
    , util = require("util")

    , sock = shoe(connection)

module.exports = sock

function connection(stream) {
    var router = Router()
        , mdm = MuxDemux(Logger(router, false))

    mdm.on("error", function (err) {
        console.log("error", util.inspect(err, false, 10))
        var stream = err.stream
        stream.end && stream.end()
        stream.destroy && stream.destroy()
    })

    router.addRoute("/v1/relay/:group/*"
        , require("./routes/relay"))
    router.addRoute("/v1/echo/:group/*"
        , require("./routes/echo"))
    router.addRoute("/v1/scuttlebutt/:group/*"
        , require("./routes/scuttlebutt"))

    mdm.pipe(stream).pipe(mdm)
}
