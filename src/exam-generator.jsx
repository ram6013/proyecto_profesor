import React, { useCallback, useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import UNIE_IMAGE from "./images/unieLogo.png";
import FileUploader from "./FileUploader";
import DialogPopUp from "./DialogPopUp";

import "./exam-generator.css";

const BASE_URL = "http://localhost:8080/api";
const QUESTION_LIMIT = 30;

async function apiRequest(file, endpoint) {
  const formData = new FormData();
  formData.append("file", file);

  const config = {
    method: "POST",
    url: `${BASE_URL}/${endpoint}`,
    data: formData,
  };

  return axios.request(config);
}

export function ExamGenerator() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultMapaMental, setResultMapaMental] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const fieldSetRef = useRef();

  const [correctos, setCorrectos] = useState([]);
  const [incorrectos, setIncorrectos] = useState([]);
  const [tipoDeSolicitud, setTipoDeSolicitud] = useState(null);
  const [preguntasAbiertas, setPreguntasAbiertas] = useState(null);

  function handleSubmit() {
    if (!selectedFile) {
      toast.error("No has subido ningún archivo");
      return;
    }

    setLoading(true);
    const request = apiRequest(selectedFile, "summary")
      .then((response) => setResultMapaMental(response.data))
      .catch((error) => console.error("Error al generar la imagen:", error))
      .finally(() => setLoading(false));

    toast.promise(request, {
      loading: "Generando imagen...",
      success: "Imagen generada correctamente!",
      error: "Error al generar la imagen.",
    });
  }

  async function handleTipoTestSubmit() {
    if (!selectedFile) {
      toast.error("Seleccione un archivo");
      return;
    }

    toast.promise(apiRequest(selectedFile, "generate"), {
      success: (res) => {
        console.log(res.data);
        setQuestions(res.data);
        setDialogOpen(false);
        return "Generado!";
      },
      loading: "Generando preguntas...",
      error: "Error",
    });
  }
  function handleRespuestasAbiertas() {
    document.querySelectorAll("textarea").forEach((textarea, index) => {
      preguntasAbiertas[index].answer = textarea.value;
    });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");

    const raw = JSON.stringify(preguntasAbiertas);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const request = fetch(BASE_URL + "/correct", requestOptions)
      .then((response) => response.json())
      .then((result) => setPreguntasAbiertas(result))
      .catch((error) => console.error(error));

    toast.promise(request, {
      success: "Corregido!",
      loading: "Corrigiendo examen...",
      error: (error) => "Error: " + error,
    });
  }

  function correct() {
    const correct = [];
    const incorrect = [];
    for (let i = 0; i < questions.length; i++) {
      document
        .querySelectorAll(`input[name="option-${i}"]`)
        .forEach((input, index) => {
          if (input.checked) {
            const q1 = questions[i];
            if (q1.answer === index) {
              correct.push(input.value);
            } else {
              incorrect.push(input.value);
            }
          }
        });
    }
    setCorrectos(correct);
    setIncorrectos(incorrect);
  }
  function handlePreguntasAbiertas() {
    if (!selectedFile) {
      toast.error("No se ha seleccionado ningun archivo");
      return;
    }

    toast.promise(apiRequest(selectedFile, "generate/open"), {
      success: (res) => {
        setPreguntasAbiertas(res.data);
        setDialogOpen(false);
        return "Success";
      },
      loading: "Generando preguntas...",
      error: "Error",
    });
  }

  function onInputChange(event) {
    let value = event.target.value;
    if (isNaN(parseInt(value))) {
      toast.error("El valor introducido no es un número!", { duration: 500 });
      return;
    }
    value = Math.max(5, Math.min(value, QUESTION_LIMIT));
    setNumberOfQuestions(value);
  }

  const toggleDialog = useCallback(() => setDialogOpen((d) => !d), []);

  const botones = [
    {
      name: "Tipo Test",
      onClick: () => {
        setTipoDeSolicitud("Tipo Test");
        toggleDialog();
      },
    },
    {
      name: "Preguntas Abiertas",
      onClick: () => {
        setTipoDeSolicitud("Preguntas abiertas");
        toggleDialog();
      },
    },
    { name: "Mapa mental", onClick: handleSubmit },
  ];

  return (
    <div
      className={`exam-generator-container`}
      onDragOver={(e) => e.preventDefault()}
      style={{ minHeight: "100vh" }}
    >
      {/* Ramon: Aqui lw cambie el tag de div a header, solo para que sea mas facil de entender*/}
      <header className="espacio-texto">
        <img src={UNIE_IMAGE} alt="logo" className="logo" />
        <h1 className="generador">
          <b>TuProfesor</b>
        </h1>
        <h2>
          <b className="seleccion-frase">La mejor</b> forma de preparar tus
          examenes
        </h2>
      </header>

      <Toaster />

      <DialogPopUp
        numeroPreguntas={numberOfQuestions}
        onInputChange={onInputChange}
        open={dialogOpen}
        toggleDialog={toggleDialog}
        selectedFile={selectedFile}
        handleSubmit={() => {
          if (tipoDeSolicitud === "Tipo Test") {
            handleTipoTestSubmit();
          } else if (tipoDeSolicitud === "Preguntas abiertas") {
            handlePreguntasAbiertas();
          }
        }}
      />

      {!(loading || resultMapaMental || questions || preguntasAbiertas) && (
        <>
          {/* 
            Ramon: Este title es el nombre que se muestra en la pestaña del navegador
            esto va es en el del html, que no se puede modificar desde react
            <title>ProfesorGPT</title> 
            */}
          <FileUploader
            setSelectedFile={setSelectedFile}
            selectedFile={selectedFile}
          />
          <div>
            {botones.map((tipo, i) => (
              <button
                key={i}
                className="botones"
                onClick={tipo.onClick || toggleDialog}
              >
                <p>{tipo.name}</p>
              </button>
            ))}
          </div>
        </>
      )}
      {loading && (
        <div>
          <h3>Cargando imagen...</h3>
        </div>
      )}
      {resultMapaMental && (
        <div>
          <img
            alt="Mapa mental"
            className="mapa-mental"
            src={resultMapaMental}
            /*Ramon: es solo abrir la imagen en otra ventana*/
            onClick={() => window.open(resultMapaMental, "_blank")}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              border: "10px solid black",
            }}
          >
            <button
              className="buttonVolverMapaConceptual"
              onClick={() => {
                setResultMapaMental(null);
              }}
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {questions && (
        <div>
          {questions?.map((question, index) => (
            <div style={{ marginTop: "5%", marginBottom: "5%" }}>
              <h4 className="content-tipo-test">
                {index + 1}. {question.content}
              </h4>
              <div style={{ marginLeft: "5%" }}>
                <fieldset
                  ref={fieldSetRef}
                  id={"Eje " + index}
                  style={{ border: 0 }}
                >
                  {question.options?.map((option, i) => {
                    const color = correctos.includes(option)
                      ? "green"
                      : incorrectos.includes(option)
                      ? "red"
                      : "";
                    return (
                      <div
                        key={i}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <div
                          style={{
                            color: color,
                            gap: 10,
                            display: "flex",
                            content: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <input
                            style={{ cursor: "pointer" }}
                            type="radio"
                            value={option}
                            id={"option-" + index + i}
                            name={"option-" + index}
                          ></input>
                          <label
                            htmlFor={"option-" + index + i}
                            style={{ cursor: "pointer" }}
                          >
                            {option}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </fieldset>
              </div>
            </div>
          ))}

          <button
            className="button-tipo-test"
            onClick={() => {
              setQuestions(null);
            }}
          >
            Volver
          </button>
          <button id="Corregir" onClick={correct} className="button-tipo-test">
            Corregir
          </button>
        </div>
      )}

      {preguntasAbiertas && (
        <div className="contenedorPreguntasAbiertas">
          {preguntasAbiertas?.map((question, index) => {
            return (
              <div key={index}>
                <h4 style={{ marginTop: "1%", fontSize: "2em" }}>
                  {question.content}
                </h4>
                <textarea
                  id={"abierta " + index}
                  placeholder="Escribe aquí su respuesta"
                ></textarea>
                {question.answer && (
                  <div>
                    <h4>{question.correct ? "Correcto" : "Incorrecto"}</h4>
                    <h5>Respuesta: {question.chunk}</h5>
                  </div>
                )}
                {/*question.correct
                question.chunk
                question.reason*/}
              </div>
            );
          })}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              className="botonesPreguntasAbiertas"
              onClick={() => {
                setPreguntasAbiertas(null);
              }}
            >
              Volver
            </button>
            <button
              className="botonesPreguntasAbiertas"
              onClick={handleRespuestasAbiertas}
            >
              Corregir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
