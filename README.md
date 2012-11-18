# signal-channel

A signal channel that empowers webrtc

Used internally by [`peer-connection-shim`][1].

Allows you to open connections to a signal channel server.

## Example

```
var Conn = require("signal-channel/connection")

    , stream = Conn("http://myserver.com", "namespace")

// do stuff with stream
```

## Installation

`npm install signal-channel`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://github.com/Raynos/peer-connection-shim
