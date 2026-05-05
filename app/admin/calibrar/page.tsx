"use client";

import { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

const DraggableBox = ({
  id,
  label,
  initialX,
  initialY,
  maxWidth,
  isActive,
  onActivate,
  onDrag,
  onResize,
  fontSize = "12px",
  isLeftAligned = false
}: {
  id: string;
  label: string;
  initialX: number;
  initialY: number;
  maxWidth: number;
  isActive: boolean;
  onActivate: (id: string) => void;
  onDrag: (key: string, data: any) => void;
  onResize: (id: string, newW: number) => void;
  fontSize?: string;
  isLeftAligned?: boolean;
}) => {
  const nodeRef = useRef(null);

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startW = maxWidth || 200;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Si está centrado, crece de ambos lados. Si está a la izquierda, crece solo hacia la derecha.
      const newW = Math.max(50, startW + (isLeftAligned ? deltaX : deltaX * 2));
      onResize(id, newW);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: initialX, y: initialY }}
      onStart={() => onActivate(id)}
      onDrag={(e, data) => onDrag(id, data)}
      bounds="parent"
      cancel=".resize-handle"
    >
      <div ref={nodeRef} style={{ position: "absolute", left: 0, top: 0, cursor: "move", zIndex: isActive ? 999 : 1 }}>
        {/* Recuadro de Ancho Máximo */}
        {isActive && maxWidth && (
          <div
            style={{
              position: "absolute",
              transform: isLeftAligned ? "translate(0%, -100%)" : "translate(-50%, -100%)",
              width: maxWidth,
              height: "20px", 
              border: "1px dashed rgba(255, 165, 0, 0.8)",
              backgroundColor: "rgba(255, 165, 0, 0.1)",
              pointerEvents: "none",
            }}
          >
            {/* Agarradera de redimensionamiento */}
            <div
              className="resize-handle"
              onMouseDown={startResize}
              style={{
                position: "absolute",
                right: "-10px",
                top: 0,
                width: "20px",
                height: "100%",
                cursor: "ew-resize",
                backgroundColor: "orange",
                borderRadius: "3px",
                pointerEvents: "auto",
                opacity: 0.8,
              }}
            />
          </div>
        )}
        
        <div
          style={{
            position: "absolute",
            transform: isLeftAligned ? "translate(0%, -100%)" : "translate(-50%, -100%)", 
            border: isActive ? "2px solid #00C851" : "1px dashed red",
            backgroundColor: isActive ? "rgba(0, 200, 81, 0.3)" : "rgba(255, 0, 0, 0.2)",
            padding: "0px",
            fontSize: fontSize,
            fontWeight: "bold",
            fontFamily: "Helvetica, Arial, sans-serif",
            color: "black",
            whiteSpace: id === "sello" ? "normal" : "nowrap",
            wordBreak: id === "sello" ? "break-all" : "normal",
            maxWidth: id === "sello" ? maxWidth : "none",
            boxShadow: isActive ? "0px 0px 10px #00C851" : "none",
            textAlign: isLeftAligned ? "left" : "center",
            pointerEvents: "auto"
          }}
        >
          {label}
        </div>
        <div style={{ position: "absolute", width: isActive ? "6px" : "4px", height: isActive ? "6px" : "4px", backgroundColor: isActive ? "#00C851" : "black", borderRadius: "50%", transform: "translate(-50%, -50%)" }}></div>
      </div>
    </Draggable>
  );
};

const DraggableQR = ({
  id,
  initialX,
  initialY,
  width,
  height,
  isActive,
  onActivate,
  onDrag,
  onResize
}: {
  id: string;
  initialX: number;
  initialY: number;
  width: number;
  height: number;
  isActive: boolean;
  onActivate: (id: string) => void;
  onDrag: (key: string, data: any) => void;
  onResize: (id: string, newW: number, newH: number) => void;
}) => {
  const nodeRef = useRef(null);

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = width;
    const startH = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      onResize(id, Math.max(20, startW + deltaX), Math.max(20, startH + deltaY));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: initialX, y: initialY }}
      onStart={() => onActivate(id)}
      onDrag={(e, data) => onDrag(id, data)}
      bounds="parent"
      cancel=".resize-handle"
    >
      <div ref={nodeRef} style={{ position: "absolute", left: 0, top: 0, cursor: "move", zIndex: isActive ? 10 : 1 }}>
        <div
          style={{
            position: "absolute",
            transform: "translate(0%, -100%)",
            border: isActive ? "3px solid #00C851" : "2px solid blue",
            backgroundColor: isActive ? "rgba(0, 200, 81, 0.4)" : "rgba(0, 0, 255, 0.3)",
            width: width,
            height: height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            boxShadow: isActive ? "0px 0px 10px #00C851" : "none",
          }}
        >
          QR
          {isActive && (
            <div
              className="resize-handle"
              onMouseDown={startResize}
              style={{
                position: "absolute",
                right: "-5px",
                bottom: "-5px",
                width: "10px",
                height: "100%",
                cursor: "se-resize",
                backgroundColor: "orange",
                borderRadius: "3px",
              }}
            />
          )}
        </div>
        <div style={{ position: "absolute", width: isActive ? "8px" : "6px", height: isActive ? "8px" : "6px", backgroundColor: isActive ? "#00C851" : "blue", borderRadius: "50%", transform: "translate(-50%, -50%)" }}></div>
      </div>
    </Draggable>
  );
};

export default function Calibrador() {
  const [coords, setCoords] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        const updated = { ...data };
        Object.keys(updated).forEach(key => {
          if (updated[key].w === undefined) updated[key].w = 200;
        });
        if (!updated.fecha_impresion) {
          updated.fecha_impresion = { x: 480, y: 20, w: 200 };
        }
        setCoords(updated);
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (!activeId || !coords) return;
      
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      setCoords((prev: any) => {
        const current = prev[activeId];
        let newX = current.x;
        let newPdfY = current.y;

        if (e.key === "ArrowLeft") newX -= 1;
        if (e.key === "ArrowRight") newX += 1;
        if (e.key === "ArrowUp") newPdfY += 1;   
        if (e.key === "ArrowDown") newPdfY -= 1; 

        return {
          ...prev,
          [activeId]: {
            ...current,
            x: newX,
            y: newPdfY,
          },
        };
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId, coords]);

  const handleDrag = (key: string, data: any) => {
    const newPdfY = PAGE_HEIGHT - data.y;
    setCoords((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        x: data.x,
        y: newPdfY,
      },
    }));
  };

  const handleResizeText = (id: string, newW: number) => {
    setCoords((prev: any) => ({
      ...prev,
      [id]: { ...prev[id], w: newW }
    }));
  };

  const handleResizeQR = (id: string, newW: number, newH: number) => {
    setCoords((prev: any) => ({
      ...prev,
      [id]: { ...prev[id], w: newW, h: newH }
    }));
  };

  const updateProp = (prop: string, value: string) => {
    if (!activeId || !coords) return;
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    setCoords((prev: any) => ({
      ...prev,
      [activeId]: {
        ...prev[activeId],
        [prop]: num
      }
    }));
  };

  const saveConfig = async () => {
    setSaving(true);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coords),
    });
    setSaving(false);
    alert("Coordenadas guardadas correctamente.");
  };

  if (!coords) return <div>Cargando...</div>;

  const getWebY = (pdfY: number) => PAGE_HEIGHT - pdfY;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", display: "flex", gap: "20px" }} onClick={(e) => {
      if (e.target === e.currentTarget) setActiveId(null);
    }}>
      <div style={{ flex: 1 }}>
        <h2>Calibrador Visual de PDF (Ancho + Salto Automático)</h2>
        <p>
          Selecciona un elemento y <strong>arrastra la pestaña naranja</strong> en sus bordes para ajustar su tamaño visualmente.
        </p>
        <button
          onClick={saveConfig}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar Coordenadas"}
        </button>

        <div style={{ overflowX: "auto" }}>
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveId(null);
            }}
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              border: "2px solid #ccc",
              position: "relative",
              backgroundImage: "url('/ejemplo.png')",
              backgroundSize: "100% 100%",
              backgroundColor: "#f9f9f9",
            }}
          >
            <DraggableBox id="nombre" label="NOHEMI" initialX={coords.nombre?.x || 150} initialY={getWebY(coords.nombre?.y || 535)} maxWidth={coords.nombre?.w || 200} isActive={activeId === "nombre"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="primer_ap" label="ALVARADO" initialX={coords.primer_ap?.x || 306} initialY={getWebY(coords.primer_ap?.y || 535)} maxWidth={coords.primer_ap?.w || 150} isActive={activeId === "primer_ap"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="segundo_ap" label="ARGUELLES" initialX={coords.segundo_ap?.x || 462} initialY={getWebY(coords.segundo_ap?.y || 535)} maxWidth={coords.segundo_ap?.w || 150} isActive={activeId === "segundo_ap"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="curp" label="AAAN730416MVZLRH06" initialX={coords.curp?.x || 306} initialY={getWebY(coords.curp?.y || 490)} maxWidth={coords.curp?.w || 200} isActive={activeId === "curp"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="curso_line1" label="AVENTURAS EN PAPEL: HERRAMIENTAS PARA ASEGURAR EL DERECHO A LA ALFABETIZACIÓN" initialX={coords.curso_line1?.x || 306} initialY={getWebY(coords.curso_line1?.y || 435)} maxWidth={coords.curso_line1?.w || 400} isActive={activeId === "curso_line1"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="programa" label="N/A" initialX={coords.programa?.x || 306} initialY={getWebY(coords.programa?.y || 395)} maxWidth={coords.programa?.w || 300} isActive={activeId === "programa"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="registro" label="Registro 2024" initialX={coords.registro?.x || 306} initialY={getWebY(coords.registro?.y || 365)} maxWidth={coords.registro?.w || 200} isActive={activeId === "registro"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="tipo_formacion" label="DIPLOMADO" initialX={coords.tipo_formacion?.x || 170} initialY={getWebY(coords.tipo_formacion?.y || 340)} maxWidth={coords.tipo_formacion?.w || 150} isActive={activeId === "tipo_formacion"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="duracion" label="200 horas" initialX={coords.duracion?.x || 450} initialY={getWebY(coords.duracion?.y || 340)} maxWidth={coords.duracion?.w || 150} isActive={activeId === "duracion"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="modalidad" label="MIXTA" initialX={coords.modalidad?.x || 170} initialY={getWebY(coords.modalidad?.y || 295)} maxWidth={coords.modalidad?.w || 150} isActive={activeId === "modalidad"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="periodo_line1" label="21 de octubre de 2024 al 23 de junio de 2025" initialX={coords.periodo_line1?.x || 450} initialY={getWebY(coords.periodo_line1?.y || 302)} maxWidth={coords.periodo_line1?.w || 250} isActive={activeId === "periodo_line1"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="lugar" label="Xalapa-Enriquez, Veracruz" initialX={coords.lugar?.x || 170} initialY={getWebY(coords.lugar?.y || 235)} maxWidth={coords.lugar?.w || 250} isActive={activeId === "lugar"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="fecha" label="10 de noviembre de 2025" initialX={coords.fecha?.x || 450} initialY={getWebY(coords.fecha?.y || 235)} maxWidth={coords.fecha?.w || 200} isActive={activeId === "fecha"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} />
            <DraggableBox id="sello" label={"EZeE3Eez4y6KFlvs7pfP2hHBWZg2mf8VRgJWV3nOflWnXNK1qw2OxGWe2Y+dgfX7xgRyghAB8rdyj/uIdagyXHCW2SzZe/npiN5fmEbpWlCthjJQvfuO92X6Bn9sOIc/GV75NKwvTPJ+hCk7pqtGp1EttemZjdR3ZB4qztEMrKw1UZbU0isZyFwTq/qi1movHrS5C/nkGpmXON4mti/k/ncZXkVP90Erw9pL03biN4pWEDptn14DoUOfTWsKY4Y2gPSr1SR0Sv0MrSoA318grJIm2glm7ACdEFBZKtCITycD14+0cS7nY0fXrsaTcgISGn24aZrbvF/IaP2Ml3ouiQ=="} initialX={coords.sello?.x || 165} initialY={getWebY(coords.sello?.y || 160)} maxWidth={coords.sello?.w || 250} isActive={activeId === "sello"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} fontSize="7px" isLeftAligned={true} />
            <DraggableBox id="fecha_impresion" label={coords.fecha_impresion?.text || "Fecha de impresión: 4 de mayo de 2026"} initialX={coords.fecha_impresion?.x || 480} initialY={getWebY(coords.fecha_impresion?.y || 20)} maxWidth={coords.fecha_impresion?.w || 200} isActive={activeId === "fecha_impresion"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeText} fontSize="10px" />
            <DraggableQR id="qr" initialX={coords.qr?.x || 54} initialY={getWebY(coords.qr?.y || 70)} width={coords.qr?.w || 100} height={coords.qr?.h || 100} isActive={activeId === "qr"} onActivate={setActiveId} onDrag={handleDrag} onResize={handleResizeQR} />
          </div>
        </div>
      </div>

      {/* Panel Derecho de Propiedades */}
      <div style={{ width: "300px", borderLeft: "2px solid #eee", paddingLeft: "20px" }}>
        <h3>Propiedades</h3>
        {!activeId && <p style={{ color: "#666" }}>Selecciona un elemento para editar sus valores.</p>}
        {activeId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p><strong>Elemento:</strong> {activeId}</p>
            
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Posición X:
              <input type="number" value={coords[activeId].x || 0} onChange={(e) => updateProp("x", e.target.value)} style={{ width: "80px", padding: "5px" }} />
            </label>
            
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Posición Y (PDF):
              <input type="number" value={coords[activeId].y || 0} onChange={(e) => updateProp("y", e.target.value)} style={{ width: "80px", padding: "5px" }} />
            </label>
            
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Ancho Máx (W):
              <input type="number" value={coords[activeId].w || 0} onChange={(e) => updateProp("w", e.target.value)} style={{ width: "80px", padding: "5px" }} />
            </label>

            {activeId === "qr" && (
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Alto (H):
                <input type="number" value={coords[activeId].h || 0} onChange={(e) => updateProp("h", e.target.value)} style={{ width: "80px", padding: "5px" }} />
              </label>
            )}

            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
              * Tip: El ancho máximo define cuándo el texto saltará automáticamente a la siguiente línea.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
