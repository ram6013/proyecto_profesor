import CLOUD_IMAGE from "./images/cloud.png";
import CERRAR_IMAGE from "./images/cerrar.png";
import { useState } from "react";

// Ramon: Esto es solo para mostrarte como puedes hacer una lista y volverla una string
const ACCEPT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    ".csv"
].join(",");

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

export default function FileUploader({ setSelectedFile, selectedFile }) {
    const { draggingCounter, handleCounter } = useDragSemaphore();

    function handleDrop(ev) {
        handleCounter(-1, ev);
        setSelectedFile(ev.dataTransfer.files[0]);
    }

    return <div className="space-file">
        <div className="contenedor-file">
            <input
                id="file"
                type="file"
                /*Ramon: como se usa en un solo lugar, cambie la funcion a que se cree aqui mismo*/
                onChange={(event) => setSelectedFile(event.target.files[0])}
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
            />
            <span hidden={!selectedFile} className="linea-nombre">
                Archivo seleccionado: <br />{" "}
                <b className="nombre-archivo">{selectedFile?.name}</b>
            </span>
        </div>
    </div>
}

