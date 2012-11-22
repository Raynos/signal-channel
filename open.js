var uuid = require("node-uuid")

module.exports = open

function open(mdm, type, namespace) {
    return mdm.createStream("/v1/" + type + "/" +
        encodeURIComponent(namespace || "default") + "/" +
        encodeURIComponent(uuid()))
}
