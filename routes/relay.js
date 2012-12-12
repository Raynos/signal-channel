var header = require("header-stream")
    , LRU = require("lru-cache")
    , wrap = require("streams2")

    , streams = LRU({
        max: 500
        , maxAge: 1000 * 60 * 60
    })

module.exports = connection

function connection(stream, params) {
    var headerStream = header(stream)
        , group = params.group

    stream = wrap(headerStream)

    headerStream.on("header", function (options) {
        var remote = options.remote
            , local = options.local
            , other = streams.get(group + ":" + remote +
                ":" + local)

        if (other) {
            other.setHeader("open", true)
            headerStream.setHeader("open", true)
            other.writeHead()
            headerStream.writeHead()
            other.pipe(stream).pipe(other)
        } else {
            streams.set(group + ":" + local + ":" + remote
                , stream)
        }
    })
}
