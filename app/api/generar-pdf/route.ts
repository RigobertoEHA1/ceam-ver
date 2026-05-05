import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import QRCode from "qrcode";

export async function POST(req: Request) {
  try {
    const constancia = await req.json();

    const templatePath = path.join(process.cwd(), "public", "plantilla.pdf");
    
    let templateBytes;
    try {
      templateBytes = await fs.readFile(templatePath);
    } catch (e) {
      console.error("Plantilla PDF no encontrada en public/plantilla.pdf");
      return NextResponse.json(
        { error: "La plantilla PDF no existe. Coloca plantilla.pdf en la carpeta public." },
        { status: 404 }
      );
    }

    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Standard fonts (Helvetica is visually identical to Arial in PDFs)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const drawCentered = (text: string, font: any, size: number, centerX: number, y: number, color = rgb(0,0,0)) => {
      if (!text) return;
      const textWidth = font.widthOfTextAtSize(text, size);
      firstPage.drawText(text, {
        x: centerX - textWidth / 2,
        y: y,
        size: size,
        font: font,
        color: color,
      });
    };

    const drawWrappedString = (text: string, font: any, size: number, x: number, y: number, charsPerLine: number, lineHeight: number) => {
      const regex = new RegExp(`.{1,${charsPerLine}}`, "g");
      const lines = text.match(regex) || [];
      lines.forEach((line, i) => {
        firstPage.drawText(line, {
          x: x,
          y: y - (i * lineHeight),
          size: size,
          font: font,
          color: rgb(0.1, 0.1, 0.1),
        });
      });
    };

    // Leer configuración de coordenadas
    const configPath = path.join(process.cwd(), "pdf_coords.json");
    let coords: any = {};
    try {
      const coordsData = await fs.readFile(configPath, "utf-8");
      coords = JSON.parse(coordsData);
    } catch (e) {
      console.log("No se encontró pdf_coords.json, usando valores por defecto.");
      coords = {
        nombre: { x: 150, y: 535, w: 200 },
        primer_ap: { x: 306, y: 535, w: 150 },
        segundo_ap: { x: 462, y: 535, w: 150 },
        curp: { x: 306, y: 490, w: 200 },
        curso_line1: { x: 306, y: 435, w: 400 },
        programa: { x: 306, y: 395, w: 300 },
        registro: { x: 306, y: 365, w: 200 },
        tipo_formacion: { x: 170, y: 340, w: 150 },
        duracion: { x: 450, y: 340, w: 150 },
        modalidad: { x: 170, y: 295, w: 150 },
        periodo_line1: { x: 450, y: 302, w: 250 },
        lugar: { x: 170, y: 235, w: 250 },
        fecha: { x: 450, y: 235, w: 200 },
        sello: { x: 165, y: 160, w: 300 },
        qr: { x: 54, y: 70, w: 100, h: 100 }
      };
    }

    const fontSize = 12;

    // Helper para auto-wrap centrado (Horizontalmente, pero anclado arriba)
    const drawCenteredWrapped = (text: string, font: any, size: number, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(" ");
      let lines = [];
      let currentLine = words[0] || "";

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = font.widthOfTextAtSize(currentLine + " " + word, size);
        if (width > maxWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine += " " + word;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      // Anclaje Superior: el 'y' indica la primera línea, el resto baja.
      const startY = y;

      lines.forEach((line, index) => {
        drawCentered(line, font, size, x, startY - index * lineHeight);
      });
    };

    // Helper para Sello Digital (Alineación izquierda, con tracking/espaciado entre letras y wrap por caracteres)
    const drawSelloWrapped = (text: string, font: any, size: number, x: number, y: number, maxWidth: number, lineHeight: number, charGap = 1.0) => {
      let lines: string[] = [];
      let currentLine = "";
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        // Calculamos el ancho considerando el espaciado extra entre letras
        const width = font.widthOfTextAtSize(currentLine + char, size) + (currentLine.length * charGap);
        if (width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine += char;
        }
      }
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      lines.forEach((line, index) => {
        let currentX = x;
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            firstPage.drawText(char, {
                x: currentX,
                y: y - index * lineHeight,
                size: size,
                font: font,
                color: rgb(0,0,0),
            });
            currentX += font.widthOfTextAtSize(char, size) + charGap;
        }
      });
    };

    // 1. Datos Generales
    drawCenteredWrapped(constancia.nombre, fontBold, fontSize, coords.nombre.x, coords.nombre.y, coords.nombre.w || 300, 14);
    drawCenteredWrapped(constancia.primer_ap, fontBold, fontSize, coords.primer_ap.x, coords.primer_ap.y, coords.primer_ap.w || 300, 14);
    drawCenteredWrapped(constancia.segundo_ap || "", fontBold, fontSize, coords.segundo_ap.x, coords.segundo_ap.y, coords.segundo_ap.w || 300, 14);

    // 2. CURP
    drawCenteredWrapped(constancia.curp, fontBold, fontSize, coords.curp.x, coords.curp.y, coords.curp.w || 300, 14);

    // 3. Curso (Auto envuelto)
    drawCenteredWrapped(constancia.curso || "", fontBold, fontSize, coords.curso_line1.x, coords.curso_line1.y, coords.curso_line1.w || 400, 15);

    // Programa de formación
    drawCenteredWrapped("N/A", fontBold, fontSize, coords.programa.x, coords.programa.y, coords.programa.w || 300, 14);

    // Registro 2024
    drawCenteredWrapped("Registro 2024", fontBold, fontSize, coords.registro.x, coords.registro.y, coords.registro.w || 300, 14);

    // 4. Tipo / Duración
    drawCenteredWrapped(constancia.tipo_formacion, fontBold, fontSize, coords.tipo_formacion.x, coords.tipo_formacion.y, coords.tipo_formacion.w || 200, 14);
    drawCenteredWrapped(constancia.duracion, fontBold, fontSize, coords.duracion.x, coords.duracion.y, coords.duracion.w || 200, 14);

    // 5. Modalidad / Periodo (Auto envuelto)
    drawCenteredWrapped(constancia.modalidad, fontBold, fontSize, coords.modalidad.x, coords.modalidad.y, coords.modalidad.w || 200, 14);
    drawCenteredWrapped(constancia.periodo, fontBold, fontSize, coords.periodo_line1.x, coords.periodo_line1.y, coords.periodo_line1.w || 250, 15);

    // 6. Expedición (Lugar / Fecha)
    drawCenteredWrapped(constancia.lugar, fontBold, fontSize, coords.lugar.x, coords.lugar.y, coords.lugar.w || 250, 14);
    drawCenteredWrapped(constancia.fecha_expedicion, fontBold, fontSize, coords.fecha.x, coords.fecha.y, coords.fecha.w || 250, 14);

    // 7. Sello Digital (Helvetica 7, Alineado Izquierda, con Tracking 1.0 y LineHeight 10)
    drawSelloWrapped(constancia.token, fontRegular, 7, coords.sello.x, coords.sello.y, coords.sello.w || 250, 10, 1.0);

    // 8. Fecha de impresión
    const impCoords = coords.fecha_impresion || { x: 480, y: 20, w: 200 };
    let textoImpresion = constancia.fecha_impresion;

    if (!textoImpresion || textoImpresion.trim() === "") {
      const hoy = new Date();
      const opcionesMes: Intl.DateTimeFormatOptions = { month: 'long' };
      const dia = hoy.getDate();
      const mes = hoy.toLocaleDateString('es-ES', opcionesMes);
      const anio = hoy.getFullYear();
      textoImpresion = `Fecha de impresión: ${dia} de ${mes} de ${anio}`;
    } else {
      // Si el usuario escribió la fecha pero no puso "Fecha de impresión: ", se lo agregamos automáticamente
      if (!textoImpresion.toLowerCase().includes("fecha de impresión") && !textoImpresion.toLowerCase().includes("fecha de impresion")) {
        textoImpresion = `Fecha de impresión: ${textoImpresion}`;
      }
    }
    
    // Dibujamos con fuente Arial MT (Helvetica) tamaño 9
    drawCenteredWrapped(textoImpresion, fontRegular, 9, impCoords.x, impCoords.y, impCoords.w || 200, 10);

    // 9. Código QR
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const validationUrl = `${baseUrl}/ValidaQR.aspx?data=${constancia.data_hash}&token=${encodeURIComponent(constancia.token)}`;
    
    const qrDataUrl = await QRCode.toDataURL(validationUrl, {
      width: 200, 
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    });
    
    const pngImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(pngImageBytes);
    
    firstPage.drawImage(qrImage, {
      x: coords.qr.x,  
      y: coords.qr.y,  
      width: coords.qr.w,
      height: coords.qr.h,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Constancia_${constancia.curp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
