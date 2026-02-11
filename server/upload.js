const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

// Store uploads temporarily
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
});

// POST /api/upload
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF uploaded. Use form-data key: resume"
      });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    const pdfData = await pdfParse(dataBuffer);
    const extractedText = (pdfData.text || "").trim();

    // delete file after reading
    fs.unlinkSync(filePath);

    if (!extractedText) {
      return res.status(200).json({
        success: false,
        error:
          "No selectable text found in this PDF. If it's a scanned/image PDF, pdf-parse can't extract text. Try uploading a text-based PDF or copy-paste resume text.",
        extractedText: ""
      });
    }

    res.json({
      success: true,
      extractedText
    });
  } catch (err) {
    console.error("PDF extract error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to extract PDF text",
      details: err.message
    });
  }
});

module.exports = router;
