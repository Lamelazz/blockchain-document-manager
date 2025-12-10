import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  "function register(bytes32 hash,string cid) external",
  "function verify(bytes32 hash) view returns(string cid,uint timestamp,bool exist)"
];

let provider:any=null
let signer:any=null

export async function connectWallet(){
  if(!window.ethereum) throw new Error("⚠ Chưa có MetaMask")

  await window.ethereum.request({method:"eth_requestAccounts"})
  provider = new ethers.BrowserProvider(window.ethereum)
  signer   = await provider.getSigner()

  return signer.address
}

export async function getContract(){
  if(!provider) await connectWallet()
  return new ethers.Contract(CONTRACT_ADDRESS,ABI,signer)
}
