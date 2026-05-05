import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Una consulta súper ligera para despertar a Supabase
    const { error } = await supabase.from("constancias").select("id").limit(1);
    
    if (error) throw error;

    return NextResponse.json({ 
      status: "ok", 
      message: "Sistema y base de datos activos",
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      message: "Error al conectar con la base de datos" 
    }, { status: 500 });
  }
}
