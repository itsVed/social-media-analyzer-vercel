const fs = require("fs");
const pdfParse = require("pdf-parse");

async function pdfExtract(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return (data.text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

module.exports = pdfExtract;
