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

  function handleSubmit(file) {
    // Creo los mensajes de toast
    const noFile = () => toast.error("No has subido ningun archivo");
    const File = () => toast.success("Se ha subido bien el archivo...");
    // Si no hay un archivo
    if (!file) {
      // Muestro el error
      noFile();
      // Salgo de la funcion
      return;
    }

    // Muestro mensaje
    File();

    const mypromyse =apiRequest(file);

    const notify = () => toast.promise(mypromyse, {
      loading: 'Loading',
      success: 'Got the data',
      error: 'Error when fetching',
    }, {
      position: 'bottom-center'
    });
    notify();
  }

  async function apiRequest(file) {
    // Creo un formato de enviar archivo <File>filedata .dwadwdawdawd....</File>
    const FormData = require("form-data");
    let data = new FormData();
    // Añadir el archivo
    data.append("file", file);

    // Configuracion de que es request "POST" que significa escondido
    let config = {
      method: "post",
      // A donde se hace la request "Mi server en go"
      url: `${BASE_URL}/summary`,
      // La form que acabos de crear
      data: data,
    };

    function onceItResponds(response) {
      const positiveResponse = () => toast.success("Se ha generado todo de forma correcta") 
      // Dentro de then teines la respuesta y aqui creas una funcion (respuesta) => {}, en la que dices que haces
      // Una vez llegue la respuesta, esto se llama cuando el servidor responda
      console.log(JSON.stringify(response.data));
      console.log("Revieved response");
      setResult(response.data);
    }

    function isThereIsAnError(err) {
      console.log(err);
    }

    // Hago la peticion llamando a request
    return axios
      .request(config)
      // Es asyncrono, es decir hay que esperar por el servidor
      // Se añade un callback con .request().then(), porque request te devuelve una Promesa
      // Que es un valor que llegara despues de un rato
      .then(onceItResponds)
      // Y esto se llama en el caso que responda con un error
      .catch(isThereIsAnError);
  }

  function handleCounter(increment, event) {
    event.preventDefault();
    setDragginCounter((c) => c + increment);
  }

  function handleDrop(ev) {
    handleCounter(-1, ev);

    console.log("File(s) dropped");
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`);
      setSelectedFileName(file.name);
    });
  }

  function handleFileChange(event) {
    const messageUpload = ()=> toast.success("Se ha subido bien el archivo")
    const fileName = event.target.files[0]?.name || "";
    const file = event.target.files[0];
    setFile(file);
    setSelectedFileName(fileName);
    messageUpload( )
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
      .then((res) => res)
      .then((res) => setPreguntas(res));
  }, []);

    function notVisibleFile(e){
      const delated = () => toast.success("Se ha eliminado bien el archivo...")
      setSelectedFileName("")
      delated();
    }
  return (
    preguntas && (
      <div
        className={`exam-generator-container`}
        onDragOver={(e) => e.preventDefault()}
      >
        <Toaster />
        {!hidden && (
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              width: "100%",
              height: "100%",
              position: "absolute  ",
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
          <button
            onClick={() => {
              handleSubmit(file);
            }}
            className="Botones "
          >
            <p>Mapa mental</p>
          </button>
        </div>

        {result && (
          <img
            style={{ backgroundColor: "white" }}
            src={"data:image/jpeg;base64," + result}
          ></img>
        )}
      </div>
      
    )
  );
}
