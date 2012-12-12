# signal-channel

A signal channel that empowers webrtc

## Motivation

WebRTC allows you to make a peer connection between two arbitary
    browsers. To be able to do so you need to exchange session
    descriptions that tell eachother where you are and how you
    can open a peer connection.

To exchange these session descriptions you need a signal channel.
    A server to which you can send descriptions and receive
    descriptions.

Once you've done the handshake through the signal channel you
    have an open peer to peer connection and don't need to deal
    with the signal channel server.

That's exactly what this is. It's a signal channel. It's hosted
    at `http://signalchannel.co/` and

Signal channel gives you a central end point which streams so
    you can easily make star shaped network topologies. That
    basically means everyone connects to the centralized signal
    channel server and the data flows through it to everyone.

## Channel example

A channel consists of two parts. A list of peers in the
    signalling channel and a network interface to open
    connections to them.

First you listen to the network, then you wait to hear about
    peers and then open connections.

For a true peer to peer system you should open connections
    deterministically, i.e. only one of the peers should connect
    the other should wait.

Note that we pass in a boolean as to whether we've opened to
    connection. The resulting peer connection we have is
    multiplexed so we either have to listen for streams
    that are opened or open one.

```js
var SignalChannel = require("../../index")
    , uuid = require("node-uuid")
    , WriteStream = require("write-stream")

    , channel = SignalChannel("unique namespace")
    , peers = channel.createPeers()
    , node = channel.createNode(onConnection)
    , id = uuid()

peers.on("join", function (peer) {
    if (peer.id <= id) {
        // other side will open this connection
        return
    }

    onConnection(node.connect(peer.id), true)
})

console.log("listening on", id)

node.listen(id)
peers.join({ id: id })

function onConnection(pc, opened) {
    if (opened) {
        return next(pc.createStream("x"))
    }

    pc.on("connection", next)

    function next(stream) {
        stream.pipe(WriteStream(function (data) {
            console.log("got data", data, "from", pc.peerId)
        }))

        stream.write("some data to " + pc.peerId)
    }
}

```

## Echo Example

All the examples below work in either browser or node. You can
    run the examples in the examples folder with `node index.js`
    or `make build && open static/index.html`

Let's say you want to send offers to other peers through the
signal channel.

```js
var echo = require("signal-channel/echo")
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
```

Signal channel doesn't give you magic out of the box. It gives
    you simple primitives like `echo`. Echo is just an echo
    stream.

Every time you connect to `echo` you get a stream which will
    echo back anything you write to it. It also echos it to
    everyone else connected to that namespace.

It's really simple to build a pub sub system on to of the `echo`
    stream. Note that it's not distributed (unless you take the
    server and implement it in a distributed fashion).

## [Scuttlebutt][2] example

Signal channel gives you a scuttlebutt end point. This is similar
    to the echo endpoint except its slightly more clever.

Echo just takes whatever you give it and broadcasts it to all
    the streams connected to it. Scuttlebutt takes whatever you
    gives it. Stores it in memory and passes that update along
    to all the other streams.

Note that signal channel uses [ExpiryModel][3] which is similar
    to [Scuttlebutt/Model][4] except it expires keys and purges
    them from memory, making it volatile storage.

```js
// Scuttlebutt stream connects to a single scuttlebutt model
// for that namespace and allows you to set and get state from
// it. Note that update gets called twice, once with the state
// from the server and once with the state your overwrite it with
var scuttlebutt = require("signal-channel/scuttlebutt")
    , Model = require("scuttlebutt/model")
    , uuid = require("node-uuid")

var stream3 = scuttlebutt("some other namespace")
    , stream4 = scuttlebutt("some other namespace")

var m1 = Model()
    , m2 = Model()

stream3.pipe(m1.createStream()).pipe(stream3)
stream4.pipe(m2.createStream()).pipe(stream4)

m2.on("update", function (key, value) {
    console.log("update", key, value)
})

m1.set("some key", "some value " + uuid())
```

## Relay example

The third end end point provided by signal channel is a relay
    end point.

Relay allows you to use the signal channel as a relay server.
    You open the relay stream and then pass a header which acts
    as a handshake that's similar to webrtc.

You pass it a local and remote token and the other side is
    supposed to pass the local and remote in the other order.

When that is done signal channel will act as a relay forwarding
    on all traffic between these two streams AND only those
    two streams.

This is being used by [peer-connection-shim][5] to emulate
    peer connection and data channels

```js

// Relay streams allow you to make a direct connection to
// another stream via a relay. This involves a handshake and
// exchanging local and remote identifiers
var relay = require("signal-channel/relay")
    , header = require("header-stream")
    , WriteStream = require("write-stream")

var stream5 = header(relay("namespace is optional"))
    , stream6 = header(relay("namespace is optional"))

stream5.setHeader("local", "12")
stream5.setHeader("remote", "22")
stream5.writeHead()

stream6.setHeader("local", "22")
stream6.setHeader("remote", "12")
stream6.writeHead()

stream5.pipe(WriteStream(function (msg) {
    console.log("relay message", msg)
}))

stream6.write("hello! relay")
```

## Installation

`npm install signal-channel`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://github.com/Raynos/peer-connection-shim
  [2]: https://github.com/dominictarr/scuttlebutt
  [3]: https://github.com/Raynos/expiry-model/blob/master/index.js
  [4]: https://github.com/dominictarr/scuttlebutt#scuttlebuttmodel
  [5]: https://github.com/Raynos/peer-connection-shim
