export default function DialogPopUp({ numeroPreguntas, onInputChange, open, toggleDialog, handleSubmit  }) {
    return <div style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        width: "100%",
        height: "100%",
        position: "absolute",
        overflowY: "hidden",
        minHeight: "100vh"
    }}
        hidden={!open}
        onClick={toggleDialog}>
        <dialog
            open={open}
            className="dialog"
            onClick={(e) => e.stopPropagation()} >
            <h4 id="texto-dialogo">¿Cuántas preguntas quieres?</h4>
            <input
                className="dialog-input"
                type="number"
                maxLength={3}
                value={numeroPreguntas}
                onChange={onInputChange}
            />
            <div className="botones-alert">
                <button
                    className="botones-ocultos cerrar-d"
                    onClick={toggleDialog}
                >
                    Cerrar
                </button>
                <button
                    onClick={handleSubmit}
                    className="botones-ocultos submit"
                >
                    Generar
                </button>
            </div>
        </dialog>
    </div>;
}

