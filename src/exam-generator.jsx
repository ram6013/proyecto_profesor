import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// Ramon: por convencion las constantes se escriben en formato de SCREAMING_SNAKE_CASE
// las variables y funciones en camelCase y las clases en PascalCase
import UNIE_IMAGE from "./images/unieLogo.png";
import FileUploader from "./FileUploader";
import DialogPopUp from "./DialogPopUp";

// Ramon: El css al final para que se aplique a librerias y tal que importemos
import "./exam-generator.css";

const BASE_URL = "http://metal.engineer/api";
const QUESTION_LIMIT = 30;

// Ramon: esta funcion no necesita ningun useState, por lo que se puede poner fuera
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

  useEffect(() => {
    // Ramon: Bien hecho aqui
    fetch(BASE_URL + "/template")
      .then((response) => response.json())
      .then((res) => setQuestions(res))
      .catch((error) =>
        console.error("Error al obtener las preguntas:", error)
      );
  }, []);

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
        loading: "Carganod archivo...",
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
  // Para que cada vez que react refresque los componentes, no se vuelva a crear
  const toggleDialog = useCallback(() => setDialogOpen((d) => !d), []);

  // Ramon: Aqui cree un array de botones, que es lo que se va a mostrar
  // Y genero el html con codigo, para que sea mas facil
  const botones = [
    { name: "Tipo Test" },
    { name: "Preguntas Abiertas" },
    { name: "Mapa mental", onClick: handleSubmit },
  ];

  return (
    <div
      className={`exam-generator-container`}
      onDragOver={(e) => e.preventDefault()}
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
        handleSubmit={handleTipoTestSubmit}
      />
      {!(loading || resultMapaMental || questions) && (
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
              <h4 className="ContnetTipoTest">
                {index + 1}. {question.content}
              </h4>
              <div style={{ marginLeft: "5%" }}>
                <fieldset id={"Eje " + index} style={{border: 0}}>
                  {question.options?.map((option, index) => {
                    return (
                      <>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
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
                              name={"Eje " + questions.indexOf(question)}
                            ></input>
                            <p>{option}</p>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </fieldset>
              </div>
            </div>
          ))}

          <button
            className="ButtonTipoTest"
            onClick={() => {
              setQuestions(null);
            }}
          >
            Volver
          </button>
          <button className="ButtonTipoTest">Corregir</button>
        </div>
      )}
    </div>
  );
}
