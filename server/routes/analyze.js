const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { enhanceWithAI } = require("../utils/aiEnhancer");
const pdfExtract = require("../utils/pdfExtract");
const ocrExtract = require("../utils/ocrExtract");
// Persistence removed — no DB model required

const router = express.Router();

// ====== FILE UPLOAD (MULTER) ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.mimetype))
      return cb(new Error("Invalid file type"));
    cb(null, true);
  }
});

// ====== MAIN API ENDPOINT ======
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, error: "No file uploaded" });

  try {
    const filePath = req.file.path;
    const mime = req.file.mimetype;

    const extractedText =
      mime === "application/pdf"
        ? await pdfExtract(filePath)
        : await ocrExtract(filePath);

    // call Gemini enhancer (might return null if AI quota finished)
    const aiResult = await enhanceWithAI(extractedText);

    // No DB persistence: respond to frontend with extracted text and AI (if available)
    return res.json({
      success: true,
      text: extractedText,
      ai: aiResult?.structured || null,
      model: aiResult?.model || null
    });

  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({
      success: false,
      error: "AI Service Failed: " + err.message
    });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

module.exports = router;