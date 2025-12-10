require("dotenv").config();
const FormData = require("form-data");
const fetch = require("node-fetch");

async function uploadBase64(filename, base64) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  const buffer = Buffer.from(base64, "base64");

  const form = new FormData();
  form.append("file", buffer, { filename });

  const res = await fetch(url, {
    method: "POST",
    timeout: 60000, // ⬅ tăng timeout lên 60 giây
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET,
      ...form.getHeaders(), // ❗ CỰC QUAN TRỌNG
    },
    body: form,
  }).catch(e=>{
    throw new Error("❌ Network/PINATA REQUEST FAILED: " + e.message);
  });

  const json = await res.json().catch(()=>null);

  if (!json || !json.IpfsHash) {
    console.log("📌 PINATA RAW:", json);
    throw new Error("Network/IPFS failed");
  }

  console.log("📥 PINATA OK:", json.IpfsHash);

  return {
    cid: json.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${json.IpfsHash}`,
  };
}

module.exports = { uploadBase64 };
