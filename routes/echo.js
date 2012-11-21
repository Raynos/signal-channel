var LRU = require("lru-cache")
    , through = require("through")

    , streams = LRU({
        max: 500
        , maxAge: 1000 * 60 * 60
    })

module.exports = connection

function connection(stream, params) {
    var group = params.group
        , echoStream = streams.get(group)

    if (!echoStream) {
        echoStream = through()
        streams.set(group, echoStream)
    }

    stream.pipe(echoStream, {
        end: false
    }).pipe(stream)
}
