import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

async function measurePDF() {
  const templatePath = path.join(process.cwd(), "public", "plantilla.pdf");
  const templateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  console.log(`PDF Dimensions: Width=${width}, Height=${height}`);
}

measurePDF().catch(console.error);
