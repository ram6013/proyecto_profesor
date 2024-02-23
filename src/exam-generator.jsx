import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// Ramon: por convencion las constantes se escriben en formato de SCREAMING_SNAKE_CASE
// las variables y funciones en camelCase y las clases en PascalCase
import CLOUD_IMAGE from "./images/cloud.png";
import UNIE_IMAGE from "./images/unieLogo.png";
import CERRAR_IMAGE from "./images/cerrar.png";
// Ramon: El css al final para que se aplique a librerias y tal que importemos
import "./exam-generator.css";

// Ramon: Esto es solo para mostrarte como puedes hacer una lista y volvera una string
const ACCEPT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    ".csv"
].join(",");

const BASE_URL = "http://metal.engineer/api";
const QUESTION_LIMIT = 15;

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

// Ramon: Aqui cree mi propio hook, que es una funcion que devuelve un objeto
// Asi funcionan los de react por dentro, esta es para lo del drag and drop
function useDragSemaphore() {
    const [draggingCounter, setDragginCounter] = useState(0);

    const handleCounter = (increment, event) => {
        event.preventDefault();
        setDragginCounter((c) => c + increment);
    };

    return { draggingCounter, handleCounter };
}

export function ExamGenerator() {
    const { draggingCounter, handleCounter } = useDragSemaphore();
    // Ramon: Como nos dan el file directamente, cambie el tener 2 useState a uno solo
    // ya que selectedFile tiene el .name y no se necesita fileName
    const [selectedFile, setSelectedFile] = useState(null);
    const [numeroPreguntas, setNumeroPreguntas] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [, setPreguntas] = useState();
    const [mapaMentalVisible, setMapaMentalVisible] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);

    useEffect(() => {
        // Ramon: Bien hecho aqui
        fetch(BASE_URL + "/template")
            .then((response) => response.json())
            .then((res) => setPreguntas(res))
            .catch((error) => console.error("Error al obtener las preguntas:", error));
    }, []);

    function handleSubmit(file) {
        if (!file) {
            // Ramon: Es una funcion, lo puedes llamar directamente!
            toast.error("No has subido ningún archivo");
            return;
        }
        toast.success("Se ha subido bien el archivo...");

        setLoadingImage(true);
        apiRequest(file)
            .then((response) => { setResult(response.data); })
            .catch((error) => {
                console.error("Error al generar la imagen:", error);
                toast.error("Error al generar la imagen.");
            })
            .finally(() => { setLoadingImage(false); });
    }

    function handleDrop(ev) {
        handleCounter(-1, ev);
        setSelectedFile(ev.dataTransfer.files[0]);
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
        value = Math.max(0, Math.min(value, QUESTION_LIMIT));
        setNumeroPreguntas(value);
    }

    function handleVisibilityChange() {
        // setMapaMentalVisible(true);
        handleSubmit(selectedFile);
    }

    // Ramon: Aqui cree un componente para el dialogo, que es simplemente una funcion
    // que devuelve un JSX, asi no se mezcla con el resto del codigo
    // Luego lo puedes llamar como un tag <DialogPopUp />
    // y si quieres que tenga props, se los pasas como si fuera un tag normal
    // <DialogPopUp open={dialogOpen} />
    // Eso si en la declaracion de la funcion le pones (props) y luego usas props.open
    // funcion DialogPopUp(props) { return <dialog open={props.open} ... }
    function DialogPopUp() {
        return <div style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            width: "100%",
            height: "100%",
            position: "absolute",
        }}
            hidden={!dialogOpen}
            onClick={() => setDialogOpen(!dialogOpen)}>
            <dialog
                open={dialogOpen}
                className="dialog"
                onClick={(e) => e.stopPropagation()} >
                <h4 id="texto-dialogo">¿Cuántas preguntas quieres?</h4>
                <input
                    className="dialog-input"
                    type="number"
                    maxLength={3}
                    value={numeroPreguntas}
                    onChange={onInputChange}
                ></input>
                <div className="botones-alert">
                    <button
                        className="botones-ocultos cerrar-d"
                        onClick={() => setDialogOpen(!dialogOpen)}
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={() => handleSubmit(selectedFile)}
                        className="botones-ocultos submit"
                    >
                        submit
                    </button>
                </div>
            </dialog>
        </div>;
    }

    return <div className={`exam-generator-container`} onDragOver={(e) => e.preventDefault()}>
        <Toaster />
        {!mapaMentalVisible && (
            <>
                <DialogPopUp />

                {/* 
                Ramon: Este title es el nombre que se muestra en la pestaña del navegador
                esto va es en el del html, que no se puede modificar desde react
                <title>ProfesorGPT</title> 
                */}

                <div className="espacio-texto">
                    <img src={UNIE_IMAGE} alt="" className="logo" />
                    <h1 className="generador">
                        <b>TuProfesor</b>
                    </h1>
                    <h2>
                        <b className="seleccion-frase">La mejor</b> forma de preparar tus
                        examenes
                    </h2>
                </div>
                <div className="space-file">
                    <div className="contenedor-file">
                        <input
                            id="file"
                            type="file"
                            /*Ramon: como se usa en un solo lugar, cambie la funcion a que se cree aqui mismo*/
                            onChange={(event) => setSelectedFile(event.target.files[0])}
                            required
                            accept={ACCEPT_TYPES}
                            hidden
                        />
                        <label
                            onDragEnter={(e) => handleCounter(1, e)}
                            onDragLeave={(e) => handleCounter(-1, e)}
                            onDrop={handleDrop}
                            className={`select-file  ${draggingCounter === 0 ? "" : "dragging"}`}
                            htmlFor="file"
                        >
                            <img className="imagen-nube" src={CLOUD_IMAGE} alt="" />
                            <br />
                            <span>Subir archivo</span>
                        </label>
                    </div>
                    <div className="contenedor-centrado">
                        <img alt="Imagen de cerrar"
                            style={{
                                visibility: !selectedFile ? "hidden" : "visible",
                            }}
                            /* Ramon: aqui habia una funcion, y como se usa una sola vez la cambie */
                            onClick={() => setSelectedFile(null)}
                            className="cerrar-imagen"
                            src={CERRAR_IMAGE}
                        ></img>
                        <span hidden={!selectedFile} className="linea-nombre">
                            Archivo seleccionado: <br />{" "}
                            <b className="nombre-archivo">{selectedFile?.name}</b>
                        </span>
                    </div>
                </div>
                <div>
                    <button
                        className="botones"
                        onClick={() => setDialogOpen(!dialogOpen)}
                    >
                        <p>Tipo Test</p>
                    </button>
                    <button
                        className="botones"
                        onClick={() => setDialogOpen(!dialogOpen)}
                    >
                        <p>Preguntas Abiertas</p>
                    </button>
                    <button onClick={handleVisibilityChange} className="botones">
                        <p>Mapa mental</p>
                    </button>
                </div>
            </>
        )}
        {mapaMentalVisible && (
            <>
                {loadingImage && (<div><button onClick={() => setMapaMentalVisible(!mapaMentalVisible)}>Volver</button>
                    <h3>Cargando imagen...</h3></div>)}
                {result && (
                    <div>

                        <img
                            alt="Mapa mental"
                            style={{ backgroundColor: "white" }}
                            src={result}
                        />
                    </div>
                )}
            </>
        )}
    </div>
}
