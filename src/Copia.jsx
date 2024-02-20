import React, { useState } from "react";
import "./exam-generator.css";
import cloudImage from "./images/cloud.png";  
import UnieImage from "./images/unieLogo.png";
import CerrarImage from "./images/cerrar.png"
export function ExamGenerator() {
  const [draggingCounter, setDragginCounter] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [hidden, setHidden] = useState(true);
  const [numeroPreguntas, setNumeroPreguntas] = useState(0);

  function handleCounter(increment, event) {
    event.preventDefault();
    setDragginCounter(c => c + increment);
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
    const fileName = event.target.files[0].name;
    console.log(`Archivo seleccionado: ${fileName}`);
    setSelectedFileName(fileName);
  }
  function Remove() {
    setSelectedFileName("");
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
  
  function MostrarNombre(event) {
    const fileName = event.target.files[0].name;
    console.log(`Archivo seleccionado: ${fileName}`);
    setSelectedFileName(fileName);
  }
  
  return (
    <div className={`exam-generator-container`} onDragOver={(e) => e.preventDefault()}>
      <title>ProfesorGPT</title>
      <div className="EspacioTexto">
      <img src={UnieImage} alt="" className="Logo"/>
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
            hidden
          />
          <label
            onDragEnter={(e) => handleCounter(1, e)}
            onDragLeave={(e) => handleCounter(-1, e)}
            onDrop={handleDrop}
            className={`selectFile  ${draggingCounter === 0 ? "" : "dragging"}`}
            htmlFor="file"
          >
            <img className="imagen_nube" src={cloudImage} alt="" />
            <br />
            <span>Subir archivo</span>
          </label>
        </div>
        
        <div className="contenedorCentrado">
        <img onClick={Remove} className="CerrarImagen" src={CerrarImage}></img>
        <span className="lineanombre">Archivo seleccionado: <br/> <b className="nombrearchivo">{selectedFileName}</b></span>
        </div>
      </div>
      <div>
      </div>
      <div className="contenedorBotonOculto" hidden={hidden} >
        <dialog open className="dialog">
        <h4>¿Cuántas preguntas quieres?</h4>
        <input
          className="botongenerado 1"
          type="number" 
          min={0} 
          max={15} 
          value={numeroPreguntas}
          onChange={ValorInput}  
        ></input>
        </dialog>  
      </div>
      <div>
        <button className="Botones TipoTest" onClick={()=>setHidden(!hidden)}>
          <p>Tipo Test</p>
        </button>
        <button className="Botones PreguntasAbiertas" onClick={()=>setHidden(!hidden)}>
          <p>Preguntas Abiertas</p>
        </button>
        <button className="Botones">
          <p>Mapa mental</p>
        </button>
      </div>
    </div>
  );
}



