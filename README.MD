# Taproot Activation
## About
Taproot is a new softfork on bitcoin network that will enhance privace and scalability, as well power new novels of aplications on top of it

### Methodology
We will subscribe to bitcoind ZMQ notification system, witch send a notification every time something happens. In our case, every time a new block is found. Check wether the block was mined inside the defined window and if is signaling (has a very specific bit set on the header).

#### Data fetch
All the useful information will be exposed under a simple REST API, the returned data is a JSON as follow:
```   
    started - Does the window started?
    ended - Does the window ended?
    window - Return a JSON with the begin and end of the window in UNIX timestamp
    count - The number of blocks with the bit set
    windowTotal - How many blocks has been mined since the window started
    leftToBeAssigned - How many blocks left into the window
    leftToActivate - How many blocks left to reach the threshold
```
## Install
The program needs a Bitcoin Core (or any full node) synchronized with the network - prune is fine - with the ZMQ's `pushblockhash` option enabled. Also you need a instance of `nodejs` and `npm` installed, see [here](https://nodejs.org/en/).  
After setting up the core, you need clone the repository with:
```
    git clone https://github.com/Davidson-Souza/taproot-monitor.git
    cd taproot-monitor
```
Then install the required packages with `npm`
```
    npm install --save
```
Finaly, just run
```
    npm start
```
If your bitcoind has different settings, like port or password follow the steps bellow:
```
    cp .env_sample .env
    nano .env
```
Edit the `.env` file uncommenting what you need set by removing the `#`, as well inserting the proper informations. After that you can run with the `npm start` as above.  