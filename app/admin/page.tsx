"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { PlusCircle, Download, Trash2, Edit, X, Settings } from "lucide-react";
import Link from "next/link";

interface Constancia {
  id?: string;
  data_hash: string;
  token: string;
  nombre: string;
  primer_ap: string;
  segundo_ap: string;
  curp: string;
  curso: string;
  tipo_formacion: string;
  duracion: string;
  modalidad: string;
  periodo: string;
  lugar: string;
  fecha_expedicion: string;
  funcionario: string;
  fecha_impresion?: string;
}

export default function AdminPage() {
  const [constancias, setConstancias] = useState<Constancia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Constancia>>({});
  const [originalData, setOriginalData] = useState<Partial<Constancia>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchConstancias();
  }, []);

  const fetchConstancias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("constancias")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching constancias:", error);
      } else {
        setConstancias(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateHashes = () => {
    const timestamp = Date.now().toString(16).toUpperCase();
    
    // Generate a high-entropy random hex string for data
    const arrayHex = new Uint8Array(20);
    crypto.getRandomValues(arrayHex);
    const randomHex = Array.from(arrayHex, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
    const data_hash = timestamp + randomHex; // Combina tiempo + aleatoriedad

    // Generate a high-entropy random base64 string for token (aprox 350 chars)
    const arrayBase64 = new Uint8Array(260);
    crypto.getRandomValues(arrayBase64);
    const token = btoa(String.fromCharCode(...Array.from(arrayBase64))).replace(/[^a-zA-Z0-9+/=]/g, '');
    
    return { data_hash, token };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        // Remover campos que no se deben actualizar o que pueden causar error si no existen
        const { id, created_at, ...updateData } = formData as any;
        const { error } = await supabase
          .from("constancias")
          .update(updateData)
          .eq("id", id);
          
        if (error) {
          if (error.message?.includes("fecha_impresion")) {
             alert("Error: Para guardar la Fecha de Impresión necesitas crear una columna llamada 'fecha_impresion' (tipo Text) en tu tabla de Supabase.");
             return;
          }
          throw error;
        }
      } else {
        const { data_hash, token } = generateHashes();
        // Si no existe la columna fecha_impresion en insert también dará error
        const { id, created_at, ...insertData } = formData as any;
        const { error } = await supabase
          .from("constancias")
          .insert([{ ...insertData, data_hash, token }]);
          
        if (error) {
          if (error.message?.includes("fecha_impresion")) {
             alert("Error: Para guardar la Fecha de Impresión necesitas crear una columna llamada 'fecha_impresion' (tipo Text) en tu tabla de Supabase.");
             return;
          }
          throw error;
        }
      }
      setIsModalOpen(false);
      setFormData({});
      fetchConstancias();
      
      // Mensaje de éxito intuitivo
      alert(isEditing ? "✅ ¡Constancia modificada exitosamente!" : "✅ ¡Constancia creada y guardada con éxito!");
      
    } catch (error: any) {
      console.error("Error saving:", error);
      alert("❌ Error al guardar la constancia: " + (error.message || ""));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta constancia de forma permanente?")) {
      await supabase.from("constancias").delete().eq("id", id);
      fetchConstancias();
      alert("🗑️ Constancia eliminada.");
    }
  };

  const handleGeneratePDF = async (constancia: Constancia) => {
    try {
      const response = await fetch("/api/generar-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(constancia),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Constancia_${constancia.curp}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error: any) {
      console.error(error);
      alert("❌ Hubo un error al generar el PDF: " + (error.message || ""));
    }
  };

  const openNewModal = () => {
    setIsEditing(false);
    setShowAdvanced(false);
    const defaults = {
      nombre: "", primer_ap: "", segundo_ap: "", curp: "",
      curso: "AVENTURAS EN PAPEL: HERRAMIENTAS PARA ASEGURAR EL DERECHO A LA ALFABETIZACIÓN",
      tipo_formacion: "DIPLOMADO", duracion: "200 horas", modalidad: "MIXTA",
      periodo: "21 de octubre de 2024 al 23 de junio de 2025",
      lugar: "Xalapa-Enriquez, Veracruz", fecha_expedicion: "23 de junio de 2025",
      funcionario: "Jorge Valente Melgarejo Salcido"
    };
    setFormData(defaults);
    setOriginalData(defaults);
    setIsModalOpen(true);
  };

  const openEditModal = (constancia: Constancia) => {
    setIsEditing(true);
    setShowAdvanced(false);
    setFormData(constancia);
    setOriginalData(constancia);
    setIsModalOpen(true);
  };

  const isSaveDisabled = () => {
    // Verificar campos requeridos
    const requiredFields = ['nombre', 'primer_ap', 'curp', 'curso', 'tipo_formacion', 'duracion', 'modalidad', 'periodo', 'lugar', 'fecha_expedicion', 'funcionario'];
    const hasMissingRequired = requiredFields.some(field => !formData[field as keyof Constancia]);
    
    if (hasMissingRequired) return true;

    // Si estamos editando, solo habilitar si hubo cambios
    if (isEditing) {
      return JSON.stringify(formData) === JSON.stringify(originalData);
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administración de Constancias</h1>
          <div className="flex gap-4">
            <Link 
              href="/admin/calibrar"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-all cursor-pointer shadow-sm hover:shadow-md"
              title="Ajustes técnicos de posición de campos"
            >
              <Settings className="w-4 h-4" />
              Calibrar PDF
            </Link>
            <button 
              onClick={openNewModal}
              className="flex items-center gap-2 bg-[#691C32] hover:bg-[#852541] text-white px-4 py-2 rounded-md font-medium transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              Nueva Constancia
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CURP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Validación</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {constancias.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.nombre} {item.primer_ap} {item.segundo_ap}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.curp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.curso.substring(0, 40)}{item.curso.length > 40 ? "..." : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                        <a href={`/ValidaQR.aspx?data=${item.data_hash}&token=${encodeURIComponent(item.token)}`} target="_blank" rel="noreferrer">
                          Ver Validación
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleGeneratePDF(item)} className="text-indigo-600 hover:text-indigo-900 cursor-pointer p-1 rounded-full hover:bg-indigo-50 transition-colors" title="Descargar PDF">
                            <Download className="w-5 h-5" />
                          </button>
                          <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-900 cursor-pointer p-1 rounded-full hover:bg-blue-50 transition-colors" title="Editar">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(item.id!)} className="text-red-600 hover:text-red-900 cursor-pointer p-1 rounded-full hover:bg-red-50 transition-colors" title="Eliminar">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {constancias.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No hay constancias registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Editar Constancia" : "Nueva Constancia"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre</label>
                  <input required type="text" value={formData.nombre || ""} onChange={e => setFormData({...formData, nombre: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Primer Apellido</label>
                  <input required type="text" value={formData.primer_ap || ""} onChange={e => setFormData({...formData, primer_ap: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Segundo Apellido</label>
                  <input type="text" value={formData.segundo_ap || ""} onChange={e => setFormData({...formData, segundo_ap: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CURP</label>
                  <input required type="text" value={formData.curp || ""} onChange={e => setFormData({...formData, curp: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Curso</label>
                  <input required type="text" value={formData.curso || ""} onChange={e => setFormData({...formData, curso: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de Formación</label>
                  <input required type="text" value={formData.tipo_formacion || ""} onChange={e => setFormData({...formData, tipo_formacion: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Duración</label>
                  <input required type="text" value={formData.duracion || ""} onChange={e => setFormData({...formData, duracion: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Modalidad</label>
                  <input required type="text" value={formData.modalidad || ""} onChange={e => setFormData({...formData, modalidad: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Periodo</label>
                  <input required type="text" value={formData.periodo || ""} onChange={e => setFormData({...formData, periodo: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lugar</label>
                  <input required type="text" value={formData.lugar || ""} onChange={e => setFormData({...formData, lugar: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha de Expedición</label>
                  <input required type="text" value={formData.fecha_expedicion || ""} onChange={e => setFormData({...formData, fecha_expedicion: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha de Impresión</label>
                  <input type="text" placeholder="Dejar vacío para hoy" value={formData.fecha_impresion || ""} onChange={e => setFormData({...formData, fecha_impresion: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 placeholder-gray-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Funcionario</label>
                  <input required type="text" value={formData.funcionario || ""} onChange={e => setFormData({...formData, funcionario: e.target.value})} className="block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50" />
                </div>
                
                <div className="md:col-span-2 border-t border-gray-100 pt-4">
                  {!showAdvanced ? (
                    <button 
                      type="button" 
                      onClick={() => setShowAdvanced(true)}
                      className="text-xs text-gray-400 hover:text-indigo-500 italic transition-colors cursor-pointer outline-none"
                    >
                      Mostrar campos de seguridad (No editar a menos que sea necesario)
                    </button>
                  ) : (
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-red-800 uppercase tracking-widest">⚠️ Campos de Seguridad</h3>
                        <button type="button" onClick={() => setShowAdvanced(false)} className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer">OCULTAR</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Hash de Datos</label>
                          <input type="text" value={formData.data_hash || ""} onChange={e => setFormData({...formData, data_hash: e.target.value})} className="block w-full border border-red-100 rounded-lg p-2 text-red-900 bg-white text-[10px] font-mono outline-none focus:ring-2 focus:ring-red-200" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Sello Digital (Token)</label>
                          <textarea rows={3} value={formData.token || ""} onChange={e => setFormData({...formData, token: e.target.value})} className="block w-full border border-red-100 rounded-lg p-2 text-red-900 bg-white text-[10px] font-mono outline-none focus:ring-2 focus:ring-red-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 pb-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaveDisabled()}
                  className={`px-8 py-2.5 rounded-xl text-white font-semibold transition-all shadow-lg cursor-pointer ${isSaveDisabled() ? 'bg-gray-300 shadow-none cursor-not-allowed' : 'bg-[#691C32] hover:bg-[#852541] active:scale-95'}`}
                >
                  {isEditing ? "Actualizar Datos" : "Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
