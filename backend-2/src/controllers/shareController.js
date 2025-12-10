// controllers/shareController.js
const ShareAccess = require('../models/ShareAccess')
const Document = require('../models/Document')


/* ====================== CHECK USER HAS DOCUMENT ====================== */
async function hasOwnDocument(username) {
  const doc = await Document.findOne({ where:{ owner:username } })
  return !!doc
}


/* ====================== CHECK CAN VIEW (OWNER + SHARED) ====================== */
exports.canView = async (req,res)=>{
  const { id } = req.params
  const username = req.user.username

  const doc = await Document.findByPk(id)
  if(!doc) return res.status(404).json({ allowed:false })

  if(doc.owner === username)
    return res.json({ allowed:true, owner:true })

  const check = await ShareAccess.findOne({
    where:{ documentId:id, viewerEmail:username }
  })

  return res.json({ allowed: !!check })
}


/* ====================== ADD VIEWER — OWNER ONLY + VERIFIED REQUIRED ====================== */
exports.addViewer = async (req,res)=>{
  const { id } = req.params
  const { email } = req.body

  // Owner must exist
  if(!await hasOwnDocument(req.user.username))
    return res.status(403).json({ message:"🚫 Bạn chưa có tài liệu" })

  const doc = await Document.findByPk(id)
  if(!doc || doc.owner !== req.user.username)
    return res.status(403).json({ message:"❌ Không phải chủ sở hữu tài liệu" })

  // ⛔ Không cho chia sẻ nếu chưa admin verify
  if (!doc.verified)
    return res.status(403).json({ message:"⚠ Tài liệu chưa được Admin xác thực — KHÔNG THỂ chia sẻ!" })

  try{
    const shared = await ShareAccess.create({ documentId:id, viewerEmail:email })
    return res.status(201).json({ message:"✔ Đã chia sẻ tài liệu!", shared })
  }catch(e){
    return res.status(400).json({ message:"⚠ Người này đã có quyền xem!", error:e.message })
  }
}


/* ====================== REMOVE VIEWER ====================== */
exports.removeViewer = async (req,res)=>{
  const { id } = req.params
  const { email } = req.body

  if(!await hasOwnDocument(req.user.username))
    return res.status(403).json({ message:"🚫 Bạn chưa có tài liệu" })

  const doc = await Document.findByPk(id)
  if(!doc || doc.owner !== req.user.username)
    return res.status(403).json({ message:"❌ Không phải chủ sở hữu" })

  await ShareAccess.destroy({ where:{ documentId:id, viewerEmail:email } })
  return res.json({ message:"🗑 Đã xoá quyền xem của " + email })
}


/* ====================== GET LIST USERS WHO CAN VIEW THIS DOC ====================== */
exports.getViewers = async(req,res)=>{
  const { id } = req.params

  if(!await hasOwnDocument(req.user.username))
    return res.status(403).json({ message:"🚫 Bạn chưa có tài liệu" })

  const doc = await Document.findByPk(id)
  if(!doc || doc.owner !== req.user.username)
    return res.status(403).json({ message:"❌ Không phải chủ sở hữu" })

  const share = await ShareAccess.findAll({ where:{ documentId:id } })
  return res.json(share.map(x=>x.viewerEmail))
}


/* ====================== GET ALL DOCUMENTS USER CAN VIEW ====================== */
exports.getSharedDocuments = async(req,res)=>{
  const email = req.user.username     // nếu dùng email thật → đổi thành req.user.email
  const shared = await ShareAccess.findAll({ where:{ viewerEmail:email }})

  return res.json(shared.map(x=>x.documentId))
}
