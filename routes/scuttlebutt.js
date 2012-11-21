var LRU = require("lru-cache")
    , ExpiryModel = require("expiry-model")
    , ReadWriteStream = require("read-write-stream")

    , streams = LRU({
        max: 500
        , maxAge: 1000 * 60 * 60
    })

module.exports = connection

function connection(stream, params) {
    var group = params.group
        , modelStream = streams.get(group)

    if (!modelStream) {
        var model = ExpiryModel()
        modelStream = model.createStream()
        streams.set(group, modelStream)
    }

    stream.pipe(modelStream, {
        end: false
    }).pipe(stream)
}
