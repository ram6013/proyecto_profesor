import React, { useCallback, useEffect, useRef, useState } from "react";
import axios, { isCancel } from "axios";
import toast, { Toaster } from "react-hot-toast";
// Ramon: por convencion las constantes se escriben en formato de SCREAMING_SNAKE_CASE
// las variables y funciones en camelCase y las clases en PascalCase
import UNIE_IMAGE from "./images/unieLogo.png";
import FileUploader from "./FileUploader";
import DialogPopUp from "./DialogPopUp";

// Ramon: El css al final para que se aplique a librerias y tal que importemos
import "./exam-generator.css";

const BASE_URL = "http://localhost:8080/api";
const QUESTION_LIMIT = 30;

// Ramon: esta funcion no necesita ningun useState, por lo que se puede poner fuera

//Pregunta: Esta función sirve para  coger el file que nosotros subimos y lo posteamos en el servidor no? es asincrona porque no bloqueamos la interfaz mientras este file se envía?
async function apiRequest(file) {
  const formData = new FormData();
  formData.append("file", file);

  const config = {
    method: "post",
    url: `${BASE_URL}/summary`,
    data: formData,
  };

  return axios.request(config);
  //Pregunta: Esto que devuelve? y para que se usa?
}

export function ExamGenerator() {
  // Ramon: Como nos dan el selectedFile directamente, cambie el tener 2 useState a uno solo
  // ya que selectedFile tiene el .name y no se necesita fileName
  const [selectedFile, setSelectedFile] = useState(null);
  // Ramon: puse que sea 5 por defecto, como minimo
  // No tendria sentido menos preguntas xd
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultMapaMental, setResultMapaMental] = useState(null);
  const [questions, setQuestions] = useState(null);
  // Ramon: Cambie el nombre a de loadingImage a loading, para utilizarlo para mas cosas
  const [loading, setLoading] = useState(false);
  const fieldSetRef = useRef();

  const [correctos, setCorrectos] = useState([]);
  const [incorrectos, setIncorrectos] = useState([]);
  const [tipoDeSolicitud, setTipoDeSolicitud] = useState(null);
  const [preguntasAbiertas, setpreguntasAbiertas] = useState(null);

  //Pregunta: Esto se puede borrar no?
  function handleSubmit() {
    if (!selectedFile) {
      // Ramon: Es una funcion, lo puedes llamar directamente!
      toast.error("No has subido ningún archivo");
      return;
    }

    setLoading(true);
    const request = apiRequest(selectedFile)
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

    toast.promise(
      new Promise(async (resolve, reject) => {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const config = {
          method: "post",
          url: `${BASE_URL}/generate`,
          data: formData,
        };
        const res = await axios.request(config);
        if (res.data) {
          setQuestions(res.data);
          resolve(res.data);
          setDialogOpen(false);
        } else {
          reject(res.data);
        }
      }),
      {
        success: "Success",
        loading: "Cargando archivo...",
        error: "Error",
      }
    );
  }
  function handleRespuestasAbiertas() {
    toast.promise(
      new Promise(async (resolve, reject) => {
        const divAbiertas = document.getElementById("abiertas");
        divAbiertas.querySelectorAll("textarea").forEach((textarea, index) => {
          const ix = preguntasAbiertas[index];
          ix.answer = textarea.value;
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

        fetch("http://localhost:8080/api/correct", requestOptions)
          .then((response) => response.json())
          .then((result) => {
            setpreguntasAbiertas(result);
            resolve(result);
            })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
      }),
      {
        success: "Success",
        loading: "Cargando archivo...",
        error: "Error",
      }
    );
  }

  function correct() {
    const correct = [];
    const incorrect = [];
    for (let i = 0; i < questions.length; i++) {
      const fieldSet = document.getElementById("Eje " + i);
      fieldSet
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

    toast.promise(
      new Promise(async (resolve, reject) => {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const config = {
          method: "post",
          url: `${BASE_URL}/generate/open`,
          data: formData,
        };
        const res = await axios.request(config);
        if (res.data) {
          setpreguntasAbiertas(res.data);
          resolve(res.data);
          setDialogOpen(false);
        } else {
          reject(res.data);
        }
      }),
      {
        success: "Success",
        loading: "Cargando archivo...",
        error: "Error",
      }
    );
  }

  // Ramon: Este se llamaba valorInput, que no esta mal
  // pero generalmente cosas como eventos, se les pone "on" al principio
  function onInputChange(event) {
    let value = event.target.value;
    if (isNaN(parseInt(value))) {
      // Ramon: Un error aqui aprovechando que tenemos toast
      toast.error("El valor introducido no es un número!", { duration: 500 });
      return;
    }
    // Ramon: el codigo complicado que mencione, esto resume el if else
    value = Math.max(5, Math.min(value, QUESTION_LIMIT));
    setNumberOfQuestions(value);
  }

  // Ramon: aqui creo la funcion con el hook useCallback
  // Para que cada vez que react refresque los componentes, no se vuelva a crear.
  //Pregunta: Por que la importancia de esto?
  const toggleDialog = useCallback(() => setDialogOpen((d) => !d), []);

  // Ramon: Aqui cree un array de botones, que es lo que se va a mostrar
  // Y genero el html con codigo, para que sea mas facil

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
        // Pregunta: No entiendo esto
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

          <button
            style={{
              cursor: "pointer",
              backgroundColor: "Black",
              color: "white",
              padding: "5%",
            }}
            onClick={() => {
              // Ramon: No olvides limpiar el resultado y asi no tienes que verificar if mapaMentalVisible
              // Solamente si no esta loading, o si hay resultado
              setResultMapaMental(null);
            }}
          >
            Volver
          </button>
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
                            //Agrego el index para que diferencie de cada pregunta porque solo se cambiaba de la pregunta 1.
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
              <div id="abiertas" key={index}>
                <h4 style={{ marginTop: "1%", fontSize: "2em" }}>
                  {question.content}
                </h4>
                <textarea
                  id={"abierta " + index}
                  placeholder="Escribe aquí su respuesta"
                ></textarea>
                { question.answer && (
                  <div>
                <h4>Correcto: {question.correct ? "Correcto" : "Incorrecto"}</h4>
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
                setpreguntasAbiertas(null);
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
