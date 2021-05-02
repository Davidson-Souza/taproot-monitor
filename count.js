/** 
 * This code will track miners signaling for taproot's upgrade
 * 
 * @author: Davidson Souza
 * @date: April, 2021
 * @license: MIT
 */

const rpc  = require("node-bitcoin-rpc")
const zmq  = require("zeromq")

// ZMQ will send notifications every time a new block is found
const sock = zmq.socket("sub");
sock.connect(process.env.ZQM || 'tcp://127.0.0.1:29000');
sock.subscribe("hashblock");

// See bip 9-8 to more info
const DEPLOY_BIT = 2;    // Which bit will be used for signaling? 
const WINDOW_START = 1619222400, WINDOW_END = 1628640000;
const MIN_THRESHOLD = 90/100; // 90% off the mined blocks
const ESTIMATED_BLOCK_COUNT = ((WINDOW_END - WINDOW_START)/60) / 10; // How many blocks inside the window?
const FIRST_BLOCK = 681408;
const EPOCH_SPAN = 2016;

// RPC is used for fetching the block header
rpc.init(process.env.RPC_HOST || '127.0.0.1', process.env.RPC_PORT || 8333, process.env.RPC_USER || '', process.env.RPC_PASSWORD || '');
rpc.setTimeout(process.env.TIMEOUT || 10000);

// The RPC only allow string, but ZMQ will send a byteArray. This function will convert byteArray in HexString
function toHexString(byteArray) {
  return Array.from(byteArray, function(byte)
  {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

var assignedCount = 0, totalSoFar = 0, assignedThisEpoch = 0, epoch = 1, totalEpoch = 0;

// Handle ZMQ's notifications
sock.on("message", function(topic, message) 
{
    // We are inside the window?
    if(Math.floor (Date.now() * (1/1000)) > WINDOW_START && Math.floor (Date.now() * (1/1000)) < WINDOW_END)
    {
        // We got one!
        totalSoFar += 1;
        totalEpoch += 1;
        // Get the header
        rpc.call("getblockheader", [toHexString(message)], (err, res) =>
        {
            // Error? Not good!
            if(err)
            {
                let errMsg = "Error when calling bitcoin RPC: " + err;
                console.log(errMsg);
                throw new Error(errMsg);
            }

            if((res.result.height % EPOCH_SPAN) == 0)
            {
                epoch += 1;
                assignedThisEpoch = 0;
                totalEpoch = 0;
            }
            // let's see wether the bit is set...
            if (Number(res.result.version) & (1 << DEPLOY_BIT))
            {
                //... if so, we are 1 block closer to the activation!
                assignedThisEpoch += 1;
                assignedCount+= 1;
            }
        })
    }
});

module.exports = 
{
    // Does it started?
    getStarted: () =>
    {
        return (Math.floor (Date.now() * (1/1000)) > WINDOW_START)
    },
    // Does it ended?
    getEnded: () =>
    {
        return (Math.floor (Date.now() * (1/1000)) > WINDOW_END)
    },
    getWindow: () =>
    {
        return {WINDOW_START, WINDOW_END}
    },
    getCount: () =>
    {
        return assignedThisEpoch;
    },
    getWindowTotal: () =>
    {
        return totalEpoch;
    },
    // How many blocks we still have inside the window?
    getLeftToBeAssigned: () =>
    {        
        return ( EPOCH_SPAN - totalEpoch );
    },
    // How many left to reach the activation threshold?
    getLeftToActivate: () =>
    {
        return Math.floor(( EPOCH_SPAN * MIN_THRESHOLD ) - assignedThisEpoch)
    },
    setCount: (_assigned, _total) =>
    {
        assignedThisEpoch = _assigned;
        totalEpoch = _total;
    }
}