const Web3 = require("web3").default;
const web3 = new Web3("http://localhost:8545"); // or your Infura/Alchemy endpoint

const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
const relayerAccount = web3.eth.accounts.privateKeyToAccount(relayerPrivateKey);
web3.eth.accounts.wallet.add(relayerAccount);
