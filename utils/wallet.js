const Web3 = require("web3");
const web3 = new Web3(); // No provider needed for wallet generation

const generateWallet = () => {
  const wallet = web3.eth.accounts.create();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}
module.exports = {generateWallet};
