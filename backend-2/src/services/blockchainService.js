const { ethers } = require("ethers");

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // << dán vào đây

const ABI = [
  "function register(bytes32 hash,string cid) external",
  "function verify(bytes32 hash) view returns(string cid,uint timestamp,bool exist)"
];

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const signer = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);

// convert string SHA256 -> bytes32
function toBytes32(hash) {
  return hash.startsWith("0x") ? hash : "0x" + hash.padStart(64,"0");
}

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

module.exports = {
  async commitHashToChain(hash, cid) {
    const tx = await contract.register(toBytes32(hash),cid);
    await tx.wait();
    return tx.hash;
  },

  async verifyHashOnChain(hash) {
    const [cid, timestamp, exist] = await contract.verify(toBytes32(hash));

    return exist
      ? { cid, timestamp: Number(timestamp), exist:true }
      : { cid:null, timestamp:null, exist:false };
  }
}
