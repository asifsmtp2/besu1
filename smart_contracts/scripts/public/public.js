const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

// abi and bytecode generated from simplestorage.sol:
// > solcjs --bin --abi simplestorage.sol
const contractJsonPath = path.resolve(__dirname, '../../','contracts','SerialHeaderContract.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;
const contractBytecode = contractJson.evm.bytecode.object

// Function to get details of a SerialDetail by ID

// Function to get details of a SerialHeader by ID
async function getSerialHeader(provider, deployedContractAbi, deployedContractAddress, serialHeaderId) {
  try {
    const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);

      const result = await contract.getSerialHeader(serialHeaderId);
      console.log("SerialHeader found:");
      console.log("Header Text:", result.headerTxt);
      console.log("Bill Of Lading:", result.billOfLanding);
      console.log("Document Date:", result.docDate);
      console.log("Posting Date:", result.postingDate);
      console.log("Reference Document Number:", result.refDocNo);
      console.log("Serial Detail IDs:", result.serialDetailIds);
  } catch (error) {
      console.error("Error fetching SerialHeader:", error);
  }
}

async function getValueAtAddress(provider, deployedContractAbi, deployedContractAddress,id){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const result = await contract.getSerialDetail(id);

  console.log("SerialDetail found:");
  console.log("Serial ID:", result.serialId);
  console.log("Date Code:", result.dateCode);
  console.log("Lot Code:", result.lotCode);
  console.log("PO Item:", result.poItem);
  console.log("PO Number:", result.poNumber);
  console.log("Quantity:", result.quantity);
  console.log("UOM:", result.uom);
  console.log("Receiving Location:", result.receivingLocation);
  console.log("Receiving Plant:", result.receivingPlant);
  console.log("Obtained value at deployed contract is: "+ result);
  return result
}



// Function to create a new SerialDetail
async function createSerialDetail(contractInstance, serialId, dateCode, lotCode, poItem, poNumber, quantity, uom, receivingLocation, receivingPlant) {
  try {
      const tx = await contractInstance.createSerialDetail(serialId, dateCode, lotCode, poItem, poNumber, quantity, uom, receivingLocation, receivingPlant);
      await tx.wait(); // Wait for the transaction to be mined
      console.log("SerialDetail created successfully.");
  } catch (error) {
      console.error("Error creating SerialDetail:", error);
  }
}

async function createContract(provider, wallet, contractAbi, contractByteCode) {
  const factory = new ethers.ContractFactory(contractAbi, contractByteCode, wallet);
  const contract = await factory.deploy();
  // The contract is NOT deployed yet; we must wait until it is mined
  const deployed = await contract.waitForDeployment();

  return contract
};

// You need to use the accountAddress details provided to Quorum to send/interact with contracts
async function setValueAtAddress(provider, wallet, deployedContractAbi, deployedContractAddress, serialId, dateCode, lotCode, poItem, poNumber, quantity, uom, receivingLocation, receivingPlant){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const contractWithSigner = contract.connect(wallet);
  const tx = await contractWithSigner.createSerialDetail(serialId, dateCode, lotCode, poItem, poNumber, quantity, uom, receivingLocation, receivingPlant);
  // verify the updated value
  await tx.wait();
  // const res = await contract.get();
  // console.log("Obtained value at deployed contract is: "+ res);
  return tx;
}

// Function to create a new SerialHeader
async function createSerialHeader(provider, wallet, deployedContractAbi, deployedContractAddress, serialHeaderId, headerTxt, billOfLanding, docDate, postingDate, refDocNo, serialDetailIds) {
  try {
    const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
    const contractWithSigner = contract.connect(wallet);

      const tx = await contractWithSigner.createSerialHeader(serialHeaderId, headerTxt, billOfLanding, docDate, postingDate, refDocNo, serialDetailIds);
      await tx.wait(); // Wait for the transaction to be mined
      console.log("SerialHeader created successfully.");
  } catch (error) {
      console.error("Error creating SerialHeader:", error);
  }
}

async function main(){
  const provider = new ethers.JsonRpcProvider(host);
  const wallet = new ethers.Wallet(accountPrivateKey, provider);

  createContract(provider, wallet, contractAbi, contractBytecode)
  .then(async function(contract){
    contractAddress = await contract.getAddress();
    console.log("Contract deployed at address: " + contractAddress);

    const serialHeaderId = "SH001";
    const headerTxt = "Sample Serial Header";
    const billOfLanding = "BOL123";
    const docDate = "2024-07-15";
    const postingDate = "2024-07-15";
    const refDocNo = "REF456";
    const serialDetailIds = [0]; // Assuming serial detail ID 0 is associated with this header
  
    // Call createSerialHeader function
    await createSerialHeader(provider, wallet, contractAbi, contractAddress, serialHeaderId, headerTxt, billOfLanding, docDate, postingDate, refDocNo, serialDetailIds);
  
    // Example usage: Getting details of a SerialHeader by ID
    await getSerialHeader(provider, contractAbi, contractAddress,  "SH001");
  
  //
    // Example usage: Creating a SerialDetail
    const serialId = "12345";
    const dateCode = "20240101";
    const lotCode = "ABC123";
    const poItem = "Item1";
    const poNumber = "PO123";
    const quantity = 100;
    const uom = "pcs";
    const receivingLocation = "Warehouse A";
    const receivingPlant = "Plant XYZ";
  
  //
    await setValueAtAddress(provider, wallet, contractAbi, contractAddress, serialId, dateCode, lotCode, poItem, poNumber, quantity, uom, receivingLocation, receivingPlant );
    // console.log("Verify the updated value that was set .. " )
  
    await getValueAtAddress(provider, contractAbi, contractAddress, 0);
  
  })
  .catch(console.error);


  //contractAddress = "0x6410E8e6321f46B7A34B9Ea9649a4c84563d8045";



//   // Example usage: Creating a SerialHeader
//   const serialHeaderId = "SH001";
//   const headerTxt = "Sample Serial Header";
//   const billOfLanding = "BOL123";
//   const docDate = "2024-07-15";
//   const postingDate = "2024-07-15";
//   const refDocNo = "REF456";
//   const serialDetailIds = [0]; // Assuming serial detail ID 0 is associated with this header

//   // Call createSerialHeader function
//   await createSerialHeader(provider, wallet, contractAbi, contractAddress, serialHeaderId, headerTxt, billOfLanding, docDate, postingDate, refDocNo, serialDetailIds);

//   // Example usage: Getting details of a SerialHeader by ID
//   await getSerialHeader(provider, contractAbi, contractAddress,  "SH001");

// //
//   // Example usage: Creating a SerialDetail
//   const serialId = "12345";
//   const dateCode = "20240101";
//   const lotCode = "ABC123";
//   const poItem = "Item1";
//   const poNumber = "PO123";
//   const quantity = 100;
//   const uom = "pcs";
//   const receivingLocation = "Warehouse A";
//   const receivingPlant = "Plant XYZ";

// //
//   await setValueAtAddress(provider, wallet, contractAbi, contractAddress, serialId, dateCode, lotCode, poItem, poNumber, quantity, uom, receivingLocation, receivingPlant );
//   // console.log("Verify the updated value that was set .. " )

//   await getValueAtAddress(provider, contractAbi, contractAddress, 0);
}

if (require.main === module) {
  main();
}

module.exports = exports = main
