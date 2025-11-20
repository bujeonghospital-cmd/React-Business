const pdf = require("pdf-poppler");
const path = require("path");
const fs = require("fs");

async function generateThumbnails() {
  const pdfDir = path.join(__dirname, "../public/downloads/annual-reports");
  const thumbnailDir = path.join(__dirname, "../public/images/pdf-thumbnails");

  // Ensure thumbnail directory exists
  if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir, { recursive: true });
  }

  // Get all PDF files
  const pdfFiles = fs
    .readdirSync(pdfDir)
    .filter((file) => file.endsWith(".pdf"));

    for (const pdfFile of pdfFiles) {
    try {
      const pdfPath = path.join(pdfDir, pdfFile);
      const outputName = path.basename(pdfFile, ".pdf");

            const options = {
        format: "jpeg",
        out_dir: thumbnailDir,
        out_prefix: outputName,
        page: 1, // Only first page
        scale: 1024, // Good quality for thumbnails
      };

      await pdf.convert(pdfPath, options);

      // Rename the generated file to have a consistent naming
      const generatedFile = path.join(thumbnailDir, `${outputName}-1.jpg`);
      const finalFile = path.join(thumbnailDir, `${outputName}.jpg`);

      if (fs.existsSync(generatedFile)) {
        fs.renameSync(generatedFile, finalFile);
              }
    } catch (error) {
          }
  }

  }

// Run the function
generateThumbnails().catch(console.error);