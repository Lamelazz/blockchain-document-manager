const express = require("express");
const router = express.Router();

const doc = require("../controllers/documentController");
const share = require("../controllers/shareController");
const { requireAuth, requireAdmin } = require("../middlewares/auth");


// ORDER QUAN TRỌNG — ROUTES CỤ THỂ TRƯỚC /:id 🔥

// ================= SHARE =================
router.get("/shared/list", requireAuth, share.getSharedDocuments);
router.get("/:id/share/viewers", requireAuth, share.getViewers);
router.post("/:id/share/add", requireAuth, share.addViewer);
router.post("/:id/share/remove", requireAuth, share.removeViewer);
router.get("/:id/can-view", requireAuth, share.canView);


// ================= VERIFY ADMIN 🔥 đặt TRƯỚC /:id =================
router.put("/verify/:id", requireAuth, requireAdmin, doc.verifyDoc);


// ================= CRUD =================
router.get("/", requireAuth, doc.listDocs);
router.post("/", requireAuth, doc.createValidators, doc.createDoc);
router.post("/:id/upload", requireAuth, doc.uploadValidators, doc.uploadVersion);
router.put("/:id", requireAuth, doc.updateDoc);
router.delete("/:id", requireAuth, doc.deleteDoc);


// ================= GET SINGLE DOC (ĐỂ CUỐI) =================
router.get("/:id", requireAuth, doc.getDoc);


module.exports = router;
