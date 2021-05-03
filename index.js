const count   = require("./count");
const express = require("express")
const cathUp  = require("./catchUp");

const app     = express();
const router  = express.Router();

const PORT    = process.env.PORT || 8080;

// Just in case we missed the window start
if(count.getStarted())
{
    cathUp.catchUp()
    .then((res) =>
    {
        count.setCount(res.count, res.total, res.firstEpochBlock, res.lastEpochBlock);
    });
}
router.get("/", (req, res) =>
{
    res.json
        ({
            started: count.getStarted(),
            ended: count.getEnded(),
            window: count.getWindow(),
            count: count.getCount(),
            windowTotal: count.getWindowTotal(),
            leftToBeAssigned: count.getLeftToBeAssigned(),
            leftToActivate: count.getLeftToActivate(),
            firstEpochBlock: count.getFirstEpochBlock(),
            lastEpochBlock: count.getLastEpochBlock()
        });
});

app.use(router);
app.listen(PORT, e =>
    {
        if(!e)
            console.log(`Listening to: ${PORT}`);
    });