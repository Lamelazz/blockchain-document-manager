const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const { Document, DocumentVersion, User } = require("../models");
const ShareAccess = require("../models/ShareAccess");
const ipfsService = require("../services/ipfsService");
const blockchain = require("../services/blockchainService");


/* ===========================================================
   1) CREATE DOCUMENT
=========================================================== */
exports.createValidators = [
  body("docId").notEmpty(),
  body("type").notEmpty(),
  body("hash").notEmpty()
];

exports.createDoc = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    const owner = await User.findOne({ where:{ username:req.user.username }});
    const { docId, type, hash, note, tags = [] } = req.body;

    const doc = await Document.create({
      id: docId,
      title: docId,
      documentType: type,
      currentHash: hash,
      note,
      tags,
      verified:false,
      state:"DRAFT",            // 🔥 MỚI TẠO = DRAFT
      ipfsCid:null,
      isDeleted:false,
      owner_id:owner.id,
      owner:owner.username
    });

    return res.status(201).json(doc);

  } catch {
    res.status(500).json({message:"create failed"});
  }
};



/* ===========================================================
   2) UPLOAD → IPFS + BLOCKCHAIN
=========================================================== */
exports.uploadValidators = [
  body("filename").notEmpty(),
  body("base64").notEmpty()
];

exports.uploadVersion = async(req,res)=>{
  try{
    const {id} = req.params;
    const doc = await Document.findByPk(id);
    if(!doc) return res.status(404).json({message:"not found"});

    const { filename, base64 } = req.body;

    const hashHex = crypto.createHash("sha256")
      .update(Buffer.from(base64,"base64")).digest("hex");

    const bytes32Hash = "0x"+hashHex;

    const ipfs = await ipfsService.uploadBase64(filename, base64);
    const tx = await blockchain.commitHashToChain(bytes32Hash, ipfs.cid);

    const last = await DocumentVersion.max("versionNo",{ where:{document_id:id}}) || 0;
    await DocumentVersion.create({
      document_id:id,
      versionNo:last+1,
      ipfsCid:ipfs.cid,
      contentHash:hashHex,
      bcTx:tx
    });

    doc.currentHash = hashHex;
    doc.ipfsCid = ipfs.cid;
    doc.state="ON_CHAIN_PENDING";     // 🔥 KHÔNG ĐƯỢC TỰ VERIFIED
    doc.verified=false;
    await doc.save();

    res.json({
      message:"UPLOADED + BLOCKCHAIN STORED",
      cid:ipfs.cid,
      tx, hash:bytes32Hash,
      status:"WAITING_ADMIN_APPROVE",
      version:last+1
    });

  }catch(e){
    console.log("UPLOAD ERROR:",e)
    res.status(500).json({message:"upload failed"});
  }
};



/* ===========================================================
   3) ADMIN VERIFY – PHẢI BẤM MỚI VERIFIED
=========================================================== */
exports.verifyDoc = async (req,res)=>{
  const doc = await Document.findByPk(req.params.id);
  if(!doc) return res.status(404).json({message:"not found"});

  const ok = await blockchain.verifyHashOnChain("0x"+doc.currentHash);
  if(!ok) return res.json({verified:false, message:"HASH INVALID"});

  doc.verified = true;
  doc.state = "APPROVED";       // 🔥 CHỈ LÚC NÀY MỚI APPROVED
  await doc.save();

  res.json({verified:true, message:"SUCCESSFULLY VERIFIED"});
};



/* ===========================================================
   4) UPDATE NOTE + TAGS
=========================================================== */
exports.updateDoc = async(req,res)=>{
  try{
    const doc = await Document.findByPk(req.params.id);
    if(!doc) return res.status(404).json({message:"not found"});

    const {note,tags} = req.body;
    if(note!==undefined) doc.note = note;
    if(tags!==undefined) doc.tags = tags;
    await doc.save();

    res.json({message:"updated", doc});
  }catch{
    res.status(500).json({message:"update failed"});
  }
};



/* ===========================================================
   5) DELETE
=========================================================== */
exports.deleteDoc = async(req,res)=>{
  const doc = await Document.findByPk(req.params.id);
  if(!doc) return res.status(404).json({message:"not found"});

  doc.isDeleted=true;
  await doc.save();
  res.json({message:"deleted"});
};



/* ===========================================================
   6) LIST + DETAIL VIEW
=========================================================== */
exports.listDocs = async (req,res)=>{
  res.json(await Document.findAll({where:{isDeleted:false}}));
};

exports.getDoc = async(req,res)=>{
  const d = await Document.findByPk(req.params.id);
  if(!d) return res.status(404).json({message:"not found"});
  res.json(d);
};
