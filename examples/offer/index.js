var echo = require("../../echo")
    , RemoteEvents = require("remote-events")

var stream1 = echo("optional namespace")
    , stream2 = echo("optional namespace")
    , ee1 = new RemoteEvents()
    , ee2 = new RemoteEvents()

stream1.pipe(ee1.getStream()).pipe(stream1)
stream2.pipe(ee2.getStream()).pipe(stream2)

ee1.on("offer", function (peer, offer) {
    console.log("got offer", offer, "from peer", peer)
})

ee2.emit("offer", "peer id #222", "this is an offer")
