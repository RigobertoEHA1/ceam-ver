import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const configPath = path.join(process.cwd(), "pdf_coords.json");

const defaultCoords = {
  nombre: { x: 150, y: 525, w: 200 },
  primer_ap: { x: 306, y: 525, w: 150 },
  segundo_ap: { x: 462, y: 525, w: 150 },
  curp: { x: 306, y: 475, w: 200 },
  curso_line1: { x: 306, y: 420, w: 400 },
  curso_line2: { x: 306, y: 405, w: 400 },
  programa: { x: 306, y: 375, w: 300 },
  registro: { x: 306, y: 350, w: 200 },
  tipo_formacion: { x: 170, y: 330, w: 150 },
  duracion: { x: 450, y: 330, w: 150 },
  modalidad: { x: 170, y: 285, w: 150 },
  periodo_line1: { x: 450, y: 292, w: 250 },
  periodo_line2: { x: 450, y: 277, w: 250 },
  lugar: { x: 170, y: 225, w: 250 },
  fecha: { x: 450, y: 225, w: 200 },
  sello: { x: 165, y: 115, w: 300 },
  qr: { x: 54, y: 70, w: 100, h: 100 },
  fecha_impresion: { x: 480, y: 20, w: 200 }
};

export async function GET() {
  try {
    const data = await fs.readFile(configPath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (e) {
    // If file doesn't exist, return defaults
    return NextResponse.json(defaultCoords);
  }
}

export async function POST(req: Request) {
  try {
    const coords = await req.json();
    await fs.writeFile(configPath, JSON.stringify(coords, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving coords:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
