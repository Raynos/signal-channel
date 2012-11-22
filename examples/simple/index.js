var echo = require("../../echo")
    , scuttlebutt = require("../../scuttlebutt")
    , relay = require("../../relay")
    , WriteStream = require("write-stream")
    , Model = require("scuttlebutt/model")
    , header = require("header-stream")
    , uuid = require("node-uuid")

// Echo connections just echo everything back to you. Consider
// it pub sub. You subscribe to it by piping from it and publish
// by writing to it

var stream1 = echo("some namespace")
    , stream2 = echo("some namespace")
    , stream3 = echo("some namespace")

stream1.pipe(WriteStream(function (msg) {
    console.log("echo message 1", msg)
}))

stream2.pipe(WriteStream(function (msg) {
    console.log("echo message 2", msg)
}))

stream2.write("hello! 2")
stream3.write("hello! 3")

// Scuttlebutt stream connects to a single scuttlebutt model
// for that namespace and allows you to set and get state from
// it. Note that update gets called twice, once with the state
// from the server and once with the state your overwrite it with

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

// Relay streams allow you to make a direct connection to
// another stream via a relay. This involves a handshake and
// exchanging local and remote identifiers

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
