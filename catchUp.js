/**
 * This code is indeed to be used only if we miss the window start, and need to figure out 
 * witch block is the first and count towards the chain tip.
 * @author: Davidson Souza
 * @date: April, 2021
 * @license: MIT
 */
const rpc  = require("node-bitcoin-rpc")
rpc.init(process.env.RPC_HOST || '192.168.42.9', process.env.RPC_PORT || 8332, process.env.RPC_USER || '', process.env.RPC_PASSWORD || '');
rpc.setTimeout(Number (process.env.TIMEOUT) || 1000000);

const WINDOW_START = 1619222400, WINDOW_END = 1628640000;
const DEPLOY_BIT = 2;    // Which bit will be used for signaling? 
const EPOCH_SPAN = 2016;

// Recursively find the first block inside the window
function findTheFirstBlockOfTheWindow(height, next)
{
    rpc.call("getblockhash", [height], (err, res) =>
    {
        if(err)
            throw err;
        rpc.call("getblockheader", [res.result], (err, res) =>
        {
            if(err)
                throw err;
            if(Number (res.result.mediantime) > WINDOW_START)
            {
                findTheFirstBlockOfTheWindow(height - 1, next);
            }
            else
            {
                next(height + 1)
            }
        })
    })
}
/** Recursively count the number of assigned blocks */
function countBlocks(now, end, count, next)
{
    rpc.call("getblockhash", [now], (err, res) =>
    {
        if(err)
            throw err;
        rpc.call("getblockheader", [res.result], (err, res) =>
        {
            if(!res)
                return

            if (Number(res.result.version) & (1 << DEPLOY_BIT))
            {
                count += 1;
            }
            if(now != end && res.result.mediantime < WINDOW_END)
                countBlocks(now + 1, end, count, next);
            else
            {
                next(count);
            }
        });
    })
}
module.exports =
{
    catchUp: () =>
    {
        return new Promise((resolve, reject) =>
        {
            rpc.call("getblockchaininfo", [], (err, res) =>
            {
                if(err)
                {
                    throw err
                }
                const tip  = res.result.blocks;
                const firstEpochBlock = (tip - (tip % EPOCH_SPAN));
                countBlocks(firstEpochBlock, tip, 0, c =>
                    {
                        resolve({count:c, total:(tip - firstEpochBlock) + 1, firstEpochBlock, lastEpochBlock:(firstEpochBlock + EPOCH_SPAN)})
                    })
                // Find the firs block within the window
/*                findTheFirstBlockOfTheWindow(tip, (height) =>
                {
                    countBlocks(height, tip, 0, c =>
                        {
                            resolve({c, count:tip - height});
                        })
                })*/
            });
        })
    }
}


