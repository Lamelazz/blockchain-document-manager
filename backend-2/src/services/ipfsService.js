const crypto = require('crypto')

const ipfsService = {
  async uploadFile (fileBuffer) {
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')
    console.log(`[IPFS Mock] File uploaded, Hash: ${sha256Hash}`)
    return sha256Hash
  },

  async downloadFile (ipfsHash) {
    console.log(`[IPFS Mock] Downloading file with Hash: ${ipfsHash}`)
    return Buffer.from(`Nội dung tệp cho Hash: ${ipfsHash}. Đây là file giả lập.`)
  },

  // THÊM MỚI: Function cho documentController
  async uploadBase64 (filename, base64String) {
    const buffer = Buffer.from(base64String, 'base64')
    const cid = crypto.createHash('sha256').update(buffer).digest('hex')
    console.log(`[IPFS Mock] Uploaded ${filename}, CID: ${cid}`)

    return {
      cid: cid,
      gatewayUrl: `https://ipfs.io/ipfs/${cid}`
    }
  }
}

module.exports = ipfsService
