import React, { useEffect, useState } from "react";
import "./exam-generator.css";
import cloudImage from "./images/cloud.png";
import UnieImage from "./images/unieLogo.png";
import CerrarImage from "./images/cerrar.png";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ACCEPT_TYPES =
  "application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const BASE_URL = "http://metal.engineer/api";

export function ExamGenerator() {
  const [draggingCounter, setDragginCounter] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [file, setFile] = useState(null);
  const [hidden, setHidden] = useState(true);
  const [numeroPreguntas, setNumeroPreguntas] = useState(0);
  const [result, setResult] = useState(null);
  const [preguntas, setPreguntas] = useState();
  const [mapaMentalVisible, setMapaMentalVisible] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  function handleSubmit(file) {
    const noFile = () => toast.error("No has subido ningún archivo");
    const File = () => toast.success("Se ha subido bien el archivo...");
    if (!file) {
      noFile();
      return;
    }

    File();

    setLoadingImage(true);
    apiRequest(file)
      .then((response) => {
        setResult(response.data);
      })
      .catch((error) => {
        console.error("Error al generar la imagen:", error);
        toast.error("Error al generar la imagen.");
      })
      .finally(() => {
        setLoadingImage(false);
      });
  }

  async function apiRequest(file) {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      method: "post",
      url: `${BASE_URL}/summary`,
      data: formData,
    };

    return axios.request(config);
  }

  function handleCounter(increment, event) {
    event.preventDefault();
    setDragginCounter((c) => c + increment);
  }

  function handleDrop(ev) {
    handleCounter(-1, ev);
    [...ev.dataTransfer.files].forEach((file, i) => {
      setSelectedFileName(file.name);
    });
  }

  function handleFileChange(event) {
    const fileName = event.target.files[0]?.name || "";
    const file = event.target.files[0];
    setFile(file);
    setSelectedFileName(fileName);
  }

  function ValorInput(event) {
    let value = event.target.value;
    if (value < 0) {
      value = 0;
    }
    if (value > 15) {
      value = 15;
    }
    if (isNaN(parseInt(value))) {
      value = "No corresponde con el formato";
    }

    setNumeroPreguntas(value);
  }

  useEffect(() => {
    fetch(BASE_URL + "/template")
      .then((response) => response.json())
      .then((res) => setPreguntas(res))
      .catch((error) => console.error("Error al obtener las preguntas:", error));
  }, []);

  function notVisibleFile(e) {
    setSelectedFileName("");
  }

  function HandleVisibilityChange() {
    setMapaMentalVisible(true);
    handleSubmit(file);
  }

  return (
    preguntas && (
      <div className={`exam-generator-container`} onDragOver={(e) => e.preventDefault()}>
        <Toaster />
        {!mapaMentalVisible && (
          <>
            {!hidden && (
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                }}
                onClick={() => setHidden(!hidden)}
              >
                <dialog
                  open
                  className="dialog"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <h4 id="textoDialogo">¿Cuántas preguntas quieres?</h4>
                  <input
                    className="botongenerado 1"
                    type="number"
                    min={0}
                    max={15}
                    value={numeroPreguntas}
                    onChange={ValorInput}
                  ></input>
                  <div className="BotonesAlert">
                    <button
                      className="botonesocultos CerrarD"
                      onClick={() => setHidden(!hidden)}
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => {
                        handleSubmit(file);
                      }}
                      className="botonesocultos Submit"
                    >
                      submit
                    </button>
                  </div>
                </dialog>
              </div>
            )}
            <title>ProfesorGPT</title>
            <div className="EspacioTexto">
              <img src={UnieImage} alt="" className="Logo" />
              <h1 className="Generador">
                <b>TuProfesor</b>
              </h1>
              <h2>
                <b className="seleccionfrase">La mejor</b> forma de preparar tus
                examenes
              </h2>
            </div>
            <div className="space_file">
              <div className="Contenedor_file">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept={ACCEPT_TYPES}
                  hidden
                />
                <label
                  onDragEnter={(e) => handleCounter(1, e)}
                  onDragLeave={(e) => handleCounter(-1, e)}
                  onDrop={handleDrop}
                  className={`selectFile  ${
                    draggingCounter === 0 ? "" : "dragging"
                  }`}
                  htmlFor="file"
                >
                  <img className="imagen_nube" src={cloudImage} alt="" />
                  <br />
                  <span>Subir archivo</span>
                </label>
              </div>
              <div className="contenedorCentrado">
                <img
                  style={{
                    visibility: selectedFileName == "" ? "hidden" : "visible",
                  }}
                  onClick={notVisibleFile}
                  className="CerrarImagen"
                  src={CerrarImage}
                ></img>
                <span hidden={selectedFileName === ""} className="lineanombre">
                  Archivo seleccionado: <br />{" "}
                  <b className="nombrearchivo">{selectedFileName}</b>
                </span>
              </div>
            </div>
            <div></div>

            <div>
              <button
                className="Botones TipoTest"
                onClick={() => setHidden(!hidden)}
              >
                <p>Tipo Test</p>
              </button>
              <button
                className="Botones PreguntasAbiertas"
                onClick={() => setHidden(!hidden)}
              >
                <p>Preguntas Abiertas</p>
              </button>
              <button onClick={HandleVisibilityChange} className="Botones ">
                <p>Mapa mental</p>
              </button>
            </div>
          </>
        )}
        {mapaMentalVisible && (
          <>
            {loadingImage && (<div><button onClick={()=>setMapaMentalVisible(!mapaMentalVisible)}>Volver</button>
            <h3>Cargando imagen...</h3></div>)}
            {result && (
              <div>
              
              <img
                style={{ backgroundColor: "white" }}
                src={"data:image/jpeg;base64," + result}
              />
              </div>
            )}
          </>
        )}
      </div>
    )
  );
}
