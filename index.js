const count   = require("./count");
const express = require("express")

const app     = express();
const router  = express.Router();

const PORT    = process.env.PORT || 8080;

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
            leftToActivate: count.getLeftToActivate()
        });
});

app.use(router);
app.listen(PORT, e =>
    {
        if(!e)
            console.log(`Listening to: ${PORT}`);
    });