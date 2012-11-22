var MuxMemo = require("mux-memo")

    /*global open:true*/
    , open = require("./open")

    , defaultUri = "//signalchannel.co/sock"

module.exports = Connection

function Connection(type) {
    return function openConnection(mdm, namespace) {
        if (typeof mdm === "string") {
            namespace = mdm
            mdm = MuxMemo(defaultUri)
        }

        return open(mdm, type, namespace)
    }
}
