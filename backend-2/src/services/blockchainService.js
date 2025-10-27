// services/blockchainService.js
// ⚠️ THAY THẾ bằng Web3/Ethers.js client THỰC TẾ

const blockchainService = {
  async commitHashToChain (ipfsHash, ownerUsername) {
    console.log(`[BC Mock] Committing Hash: ${ipfsHash} by ${ownerUsername}`)
    return `0xBC_TX_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
  },

  async verifyHashOnChain (ipfsHash) {
    console.log(`[BC Mock] Verifying Hash: ${ipfsHash}`)
    return true
  }
}

module.exports = blockchainService
