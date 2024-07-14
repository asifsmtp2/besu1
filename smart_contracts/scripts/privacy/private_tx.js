const path = require("path");
const fs = require("fs-extra");
const Web3 = require("web3");
const Web3Quorum = require("web3js-quorum");

// WARNING: the keys here are demo purposes ONLY. Please use a tool like EthSigner for production, rather than hard coding private keys
const { tessera, besu } = require("../keys.js");
const chainId = 1337;
// abi and bytecode generated from simplestorage.sol:
// > solcjs --bin --abi simplestorage.sol
const contractJsonPath = path.resolve(
  __dirname,
  "../../",
  "contracts",
  "SimpleStorage.json"
);
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractBytecode = contractJson.evm.bytecode.object;
const contractAbi = contractJson.abi;

// Besu doesn't support eth_sendTransaction so we use the eea_sendRawTransaction(https://besu.hyperledger.org/en/latest/Reference/API-Methods/#eea_sendrawtransaction) for things like simple value transfers, contract creation or contract invocation
async function createContract(
  clientUrl,
  fromPrivateKey,
  fromPublicKey,
  toPublicKey
) {
  const web3 = new Web3(clientUrl);
  const web3quorum = new Web3Quorum(web3, chainId);
  // initialize the default constructor with a value `47 = 0x2F`; this value is appended to the bytecode
  const contractConstructorInit = web3.eth.abi
    .encodeParameter("uint256", "47")
    .slice(2);
  const txOptions = {
    data: "0x" + contractBytecode + contractConstructorInit,
    privateKey: fromPrivateKey,
    privateFrom: fromPublicKey,
    privateFor: [toPublicKey],
  };
  console.log("Creating contract...");
  // Generate and send the Raw transaction to the Besu node using the eea_sendRawTransaction(https://besu.hyperledger.org/en/latest/Reference/API-Methods/#eea_sendrawtransaction) JSON-RPC call
  const txHash = await web3quorum.priv.generateAndSendRawTransaction(txOptions);
  console.log("Getting contractAddress from txHash: ", txHash);
  const privateTxReceipt = await web3quorum.priv.waitForTransactionReceipt(
    txHash
  );
  console.log("Private Transaction Receipt: ", privateTxReceipt);
  return privateTxReceipt;
}

async function getValueAtAddress(
  clientUrl,
  nodeName = "node",
  address,
  contractAbi,
  fromPrivateKey,
  fromPublicKey,
  toPublicKey
) {
  const web3 = new Web3(clientUrl);
  const web3quorum = new Web3Quorum(web3, chainId);
  const contract = new web3quorum.eth.Contract(contractAbi);
  // eslint-disable-next-line no-underscore-dangle
  const functionAbi = contract._jsonInterface.find((e) => {
    return e.name === "get";
  });
  const functionParams = {
    to: address,
    data: functionAbi.signature,
    privateKey: fromPrivateKey,
    privateFrom: fromPublicKey,
    privateFor: [toPublicKey],
  };
  const transactionHash = await web3quorum.priv.generateAndSendRawTransaction(
    functionParams
  );
  // console.log(`Transaction hash: ${transactionHash}`);
  const result = await web3quorum.priv.waitForTransactionReceipt(
    transactionHash
  );
  console.log(
    "" + nodeName + " value from deployed contract is: " + result.output
  );
  return result;
}

async function setValueAtAddress(
  clientUrl,
  address,
  value,
  contractAbi,
  fromPrivateKey,
  fromPublicKey,
  toPublicKey
) {
  const web3 = new Web3(clientUrl);
  const web3quorum = new Web3Quorum(web3, chainId);
  const contract = new web3quorum.eth.Contract(contractAbi);
  // eslint-disable-next-line no-underscore-dangle
  const functionAbi = contract._jsonInterface.find((e) => {
    return e.name === "set";
  });
  const functionArgs = web3quorum.eth.abi
    .encodeParameters(functionAbi.inputs, [value])
    .slice(2);
  const functionParams = {
    to: address,
    data: functionAbi.signature + functionArgs,
    privateKey: fromPrivateKey,
    privateFrom: fromPublicKey,
    privateFor: [toPublicKey],
  };
  const transactionHash = await web3quorum.priv.generateAndSendRawTransaction(
    functionParams
  );
  console.log(`Transaction hash: ${transactionHash}`);
  const result = await web3quorum.priv.waitForTransactionReceipt(
    transactionHash
  );
  return result;
}

async function main() {
  createContract(
    besu.google.url,
    besu.google.accountPrivateKey,
    tessera.google.publicKey,
    tessera.vendor2.publicKey
  )
    .then(async function (privateTxReceipt) {
      console.log("Address of transaction: ", privateTxReceipt.contractAddress);
      let newValue = 123;

      //wait for the blocks to propogate to the other nodes
      await new Promise((r) => setTimeout(r, 20000));
      console.log(
        "Use the smart contracts 'get' function to read the contract's constructor initialized value .. "
      );
      await getValueAtAddress(
        besu.google.url,
        "google",
        privateTxReceipt.contractAddress,
        contractAbi,
        besu.google.accountPrivateKey,
        tessera.google.publicKey,
        tessera.vendor2.publicKey
      );
      console.log(
        `Use the smart contracts 'set' function to update that value to ${newValue} .. - from google to vendor2`
      );
      await setValueAtAddress(
        besu.google.url,
        privateTxReceipt.contractAddress,
        newValue,
        contractAbi,
        besu.google.accountPrivateKey,
        tessera.google.publicKey,
        tessera.vendor2.publicKey
      );
      //wait for the blocks to propogate to the other nodes
      await new Promise((r) => setTimeout(r, 20000));
      console.log(
        "Verify the private transaction is private by reading the value from all three members .. "
      );
      await getValueAtAddress(
        besu.google.url,
        "google",
        privateTxReceipt.contractAddress,
        contractAbi,
        besu.google.accountPrivateKey,
        tessera.google.publicKey,
        tessera.vendor2.publicKey
      );
      await getValueAtAddress(
        besu.vendor1.url,
        "vendor1",
        privateTxReceipt.contractAddress,
        contractAbi,
        besu.vendor1.accountPrivateKey,
        tessera.vendor1.publicKey,
        tessera.google.publicKey
      );
      await getValueAtAddress(
        besu.vendor2.url,
        "vendor2",
        privateTxReceipt.contractAddress,
        contractAbi,
        besu.vendor2.accountPrivateKey,
        tessera.vendor2.publicKey,
        tessera.google.publicKey
      );
    })
    .catch(console.error);
}

if (require.main === module) {
  main();
}

module.exports = exports = main;
