"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Constancia {
  id: string;
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
  token: string;
}

export default function ValidaClient({
  dataHash,
  token,
}: {
  dataHash: string;
  token: string;
}) {
  const [constancia, setConstancia] = useState<Constancia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchConstancia = async () => {
      if (!dataHash || !token) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("constancias")
          .select("*")
          .eq("data_hash", dataHash)
          .eq("token", token)
          .single();

        if (error || !data) {
          console.error("No se encontró la constancia:", error);
          setError(true);
        } else {
          setConstancia(data);
        }
      } catch (err) {
        console.error("Error al validar:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConstancia();
  }, [dataHash, token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Cargando...
      </div>
    );
  }

  if (error || !constancia) {
    if (typeof window !== "undefined") {
      window.location.href = "https://siceam.sev.gob.mx/ValidaQR.aspx";
    }
    return null;
  }

  return (
    <>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
      <style>{`
        body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }
        iframe { height: 380px; width: 99%  }
        input[type="image"] { cursor: pointer; }
        
        /*clases propias*/
        .banner-geda { background: url('http://cdn.sev.gob.mx/img/sistemas/sev-educacion.png') no-repeat; border-bottom: 2px solid #d66b53; height: 5em; padding-right: .5em; text-align: right; background-size: contain; }
        
        .mensajeError-geda {color:red; font-size:larger}
        
        /*clases sobreescritas*/
        .table-responsive-xs-geda { font-size: 1rem; } 
        .container-fluid { width: 90%; max-width: none; margin: 0 auto; }
        .rbl-geda label { display: inline; padding: 0.5rem; }
        .panel-default > .panel-heading { background-color: #818285;  color: #fff;}
        .texto-jumbo-geda { font-size: 2rem; }
        .texto-glyphicon-geda { margin-left: 0.5rem; margin-right: 0.5rem; }
        .no-gutter-geda { margin-right: 0; margin-left: 0; }
        .no-gutter-geda > [class*="col-"] { padding-right: 0; padding-left: 0; }

        .valida-title { font-size: 63px; }
        .custom-jumbotron { padding: 48px 30px; }

        @media (max-width: 767px) {
          .valida-title { font-size: 36px; text-align: center; }
          .custom-jumbotron { padding: 30px 15px; }
          .banner-geda { height: 3.5em; background-size: contain; background-position: left center; }
          .container-fluid { width: 95%; padding-left: 10px; padding-right: 10px; }
          h3 { font-size: 20px; }
          .panel-body { padding: 10px; }
        }
      `}</style>

      <div className="container-fluid" style={{ marginTop: "20px" }}>
        <div className="banner-geda"></div>          

        <div id="pValido">
            <div className="jumbotron custom-jumbotron" style={{ backgroundColor: "#eee", marginTop: "20px", borderRadius: "6px" }}>
                <h1 className="valida-title" style={{ fontWeight: "500", marginTop: "10px", marginBottom: "10px", color: "#333" }}>
                    La constancia es válida
                </h1>
            </div>
        </div>

        <div id="pConstancia">
            <h4>El documento escaneado es válido y pertenece a:</h4>

            <div className="row" style={{ marginTop: "20px" }}>
                <h3 style={{ marginLeft: "15px" }}>Datos Generales</h3>
                    
                <div className="panel panel-default" style={{ margin: "0 15px" }}>
                    <div className="panel-body">
                        <div className="col-sm-3"><strong>Nombre:</strong>
                            <div className="form-group">
                                <p className="form-control-static">
                                    <span id="lNombre">{constancia.nombre}</span>
                                </p>
                            </div>
                        </div>  
                        
                        <div className="col-sm-3"><strong>1er. apellido:</strong>
                            <div className="form-group">
                                <p className="form-control-static">
                                    <span id="lPrimerAp">{constancia.primer_ap}</span>
                                </p>
                            </div>
                        </div>  

                        <div className="col-sm-3"><strong>2o. apellido:</strong>
                            <div className="form-group">
                                <p className="form-control-static">
                                    <span id="lSegundoAp">{constancia.segundo_ap || "N/A"}</span>
                                </p>
                            </div>
                        </div>  

                        <div className="col-sm-3"><strong>CURP:</strong>
                            <div className="form-group">
                                <p className="form-control-static">
                                    <span id="lCURP">{constancia.curp}</span>
                                </p>
                            </div>
                        </div>  
                    </div>
                </div>
            </div>    

            <div className="row" style={{ marginTop: "20px" }}>
                <h3 style={{ marginLeft: "15px" }}>Datos de la formación</h3>

                <div className="panel panel-default" style={{ margin: "0 15px" }}>
                    <div className="panel-body">

                        <div className="row">
                            <div className="col-sm-4"><strong><span id="lNombreEtiqueta">Nombre de la Acción de formación</span></strong>
                                    <div className="form-group">
                                    <p className="form-control-static">
                                        <span id="lNombreCurso">{constancia.curso}</span>
                                    </p>
                                </div>
                            </div>  

                            <div className="col-sm-4"><strong>Programa de formación:</strong>
                                <div className="form-group">
                                    <p className="form-control-static">
                                        <span id="lProgFormacion">N/A</span>
                                    </p>
                                </div>
                            </div>  

                            <div className="col-sm-4"><strong>Tipo de formación:</strong>
                                <div className="form-group">
                                    <p className="form-control-static">
                                        <span id="lTipoFormacion">{constancia.tipo_formacion}</span>
                                    </p>
                                </div>
                            </div> 
                            
                        </div>

                        <div className="row">
                            <div className="col-sm-4"><strong>Duración:</strong>
                                <div className="form-group">
                                    <p className="form-control-static">
                                        <span id="lDuracion">{constancia.duracion}</span>
                                    </p>
                                </div>
                            </div>  

                            <div className="col-sm-4"><strong>Modalidad:</strong>
                                <div className="form-group">
                                    <p className="form-control-static">
                                        <span id="lModalidad">{constancia.modalidad}</span>
                                    </p>
                                </div>
                            </div>  

                            <div className="col-sm-4"><strong>Periodo:</strong>
                                <div className="form-group">
                                    <p className="form-control-static">
                                        <span id="lPeriodo">{constancia.periodo}</span>
                                    </p>
                                </div>
                            </div>  

                        </div>

                    </div>
                </div>
        
            </div>
            
            <div className="row" style={{ marginTop: "20px", marginBottom: "50px" }}>
                <h3 style={{ marginLeft: "15px" }}>Datos de la Expedición</h3>

                <div className="panel panel-default" style={{ margin: "0 15px" }}>
                    <div className="panel-body">

                        <div className="col-sm-4"><strong>Lugar:</strong>
                            <div className="form-group">
                                <p className="form-control-static">
                                    <span id="lLugar">{constancia.lugar}</span>
                                </p>
                            </div>
                        </div>  

                        <div className="col-sm-4"><strong>Fecha:</strong>
                            <div className="form-group">
                                <p className="form-control-static">
                                    <span id="lFecha">{constancia.fecha_expedicion}</span>
                                </p>
                            </div>
                        </div>  

                        <div className="col-sm-4"><strong>Quien firma:</strong>
                            <div className="form-group">
                                <p className="form-control-static">
                                    <span id="lfuncionario">{constancia.funcionario}</span>
                                </p>
                            </div>
                        </div>  

                        <div className="col-sm-12"><strong>Sello digital:</strong>
                            <div className="form-group">
                                <div style={{ overflowWrap: "break-word" }}>
                                    <span id="lSelloDigital">{constancia.token}</span>
                                </div>
                            </div>
                        </div>  
                        
                    </div>
                </div>
                    
            </div>
            
        </div>
      </div>
    </>
  );
}
