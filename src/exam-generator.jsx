import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// Ramon: por convencion las constantes se escriben en formato de SCREAMING_SNAKE_CASE
// las variables y funciones en camelCase y las clases en PascalCase
import UNIE_IMAGE from "./images/unieLogo.png";
// Ramon: El css al final para que se aplique a librerias y tal que importemos
import "./exam-generator.css";
import FileUploader from "./FileUploader";
import DialogPopUp from "./DialogPopUp";

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
    // Ramon: Como nos dan el file directamente, cambie el tener 2 useState a uno solo
    // ya que selectedFile tiene el .name y no se necesita fileName
    const [selectedFile, setSelectedFile] = useState(null);
    const [numeroPreguntas, setNumeroPreguntas] = useState(5);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [, setPreguntas] = useState(null);
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

        setLoadingImage(true);
        const request = apiRequest(file)
            .then((response) => setResult(response.data))
            .catch((error) => console.error("Error al generar la imagen:", error))
            .finally(() => setLoadingImage(false));

        toast.promise(request, {
            loading: "Generando imagen...",
            success: "Imagen generada correctamente!",
            error: "Error al generar la imagen."
        });
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
        setNumeroPreguntas(value);
    }

    function handleVisibilityChange() {
        setMapaMentalVisible(true);
        handleSubmit(selectedFile);
    }

    // Ramon: aqui creo la funcion con el hook useCallback
    // Para que cada vez que react refresque los componentes, no se vuelva a crear 
    const toggleDialog = useCallback(() => setDialogOpen(d => !d), []);

    // Ramon: Aqui cree un array de botones, que es lo que se va a mostrar
    // Y genero el html con codigo, para que sea mas facil
    const botones = [{ name: "Tipo Test" }, { name: "Preguntas Abiertas" }, { name: "Mapa mental", onClick: handleVisibilityChange }];

    return <div className={`exam-generator-container`} onDragOver={(e) => e.preventDefault()}>
        <header className="espacio-texto">
            <img src={UNIE_IMAGE} alt="logo" className="logo" />
            <h1 className="generador"><b>TuProfesor</b></h1>
            <h2>
                <b className="seleccion-frase">La mejor</b> forma de preparar tus
                examenes
            </h2>
        </header>
        <Toaster />
        <DialogPopUp
            numeroPreguntas={numeroPreguntas}
            onInputChange={onInputChange}
            dialogOpen={dialogOpen}
            toggleDialog={toggleDialog}
            handleSubmit={handleSubmit}
            selectedFile={selectedFile}
        />
        {!mapaMentalVisible && <>
            {/* 
            Ramon: Este title es el nombre que se muestra en la pestaña del navegador
            esto va es en el del html, que no se puede modificar desde react
            <title>ProfesorGPT</title> 
            */}
            <FileUploader setSelectedFile={setSelectedFile} selectedFile={selectedFile} />
            <div>
                {botones.map((tipo, i) => (
                    <button
                        key={i}
                        className="botones"
                        onClick={tipo.onClick || toggleDialog}>
                        <p>{tipo.name}</p>
                    </button>
                ))}
            </div>
        </>
        }
        {loadingImage && <div> <h3>Cargando imagen...</h3> </div>}
        {result &&
            <div>
                <img
                    alt="Mapa mental"
                    className="mapa-mental"
                    src={result}
                    onClick={() => window.open(result, "_blank")}
                />
                <button onClick={() => {
                    setMapaMentalVisible(!mapaMentalVisible);
                    setResult(null);
                }}>Volver</button>
            </div>
        }
    </div>
}
