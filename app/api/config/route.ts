import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

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
    const { data, error } = await supabase
      .from("pdf_config")
      .select("config")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log("No se encontró configuración en Supabase, usando valores por defecto.");
      return NextResponse.json(defaultCoords);
    }
    
    return NextResponse.json(data.config);
  } catch (e) {
    return NextResponse.json(defaultCoords);
  }
}

export async function POST(req: Request) {
  try {
    const coords = await req.json();
    
    // Intentamos actualizar la última configuración o insertar una nueva
    const { data: existing } = await supabase
      .from("pdf_config")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    let error;
    if (existing) {
      const result = await supabase
        .from("pdf_config")
        .update({ config: coords, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("pdf_config")
        .insert([{ config: coords }]);
      error = result.error;
    }

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving coords to Supabase:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
