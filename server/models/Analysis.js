const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema(
  {
    fileName: { type: String },
    text: { type: String },
    suggestions: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", AnalysisSchema);
