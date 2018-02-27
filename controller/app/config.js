
module.exports = {
    SWITCH_PORTS: 48,
    SWITCH_DEFAULT_ADDRESS: "192.168.0.1",
    MCAST_GROUP_ADDR: "224.1.1.1",
    MCAST_CAMERA_COMMAND_PORT: 6502,
    MCAST_CAMERA_REPLY_PORT: 6501,
    SWITCHES: [
        {
            interface: "wan",
            hostAddress: "192.168.201.200",
            switchAddress: "192.168.201.100",
        }, {
            interface: "lan0",
            hostAddress: "192.168.202.200",
            switchAddress: "192.168.202.100"
        }, {
            interface: "lan1",
            hostAddress: "192.168.203.200",
            switchAddress: "192.168.203.100"
        }
    ]

};
