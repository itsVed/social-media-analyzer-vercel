const Tesseract = require("tesseract.js");

async function ocrExtract(filePath) {
  const result = await Tesseract.recognize(filePath, "eng", {
    logger: () => {},
  });
  const text = result.data && result.data.text ? result.data.text : "";
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

module.exports = ocrExtract;
