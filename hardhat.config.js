require("dotenv").config();
require("@nomiclabs/hardhat-web3");

const path = require("path");

const rawPrivateKey = process.env.RELAYER_PRIVATE_KEY;
const rpcUrl = process.env.POLYGON_RPC_URL;

if (!rawPrivateKey || !rpcUrl) {
  console.error("❌ Please set RELAYER_PRIVATE_KEY and POLYGON_RPC_URL in .env");
  process.exit(1);
}

// Strip '0x' only for Hardhat
const privateKey = rawPrivateKey.replace(/^0x/, "");

module.exports = {
  solidity: "0.8.0",
  paths: {
    sources: path.resolve(__dirname, "./contracts"),
    artifacts: path.resolve(__dirname, "./artifacts"),
  },
  networks: {
    polygon_amoy: {
      url: rpcUrl,
      accounts: [privateKey],
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    // },
  },
};
