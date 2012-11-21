var LRU = require("lru-cache")
    , ReadWriteStream = require("read-write-stream")

    , streams = LRU({
        max: 500
        , maxAge: 1000 * 60 * 60
    })

module.exports = connection

function connection(stream, params) {
    var group = params.group
        , echoStream = LRU.get(group)

    if (!echoStream) {
        echoStream = ReadWriteStream()
        group.set(group, echoStream)
    }

    stream.pipe(echoStream, {
        end: false
    }).pipe(stream)
}
