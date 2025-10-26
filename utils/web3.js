const Web3 = require('web3');
require('dotenv').config({ path: '../.env' });
const rpcUrl = process.env.POLYGON_RPC_URL;
// Connect to Ganache (or Matic Mainnet/Testnet later)
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

module.exports = web3;
