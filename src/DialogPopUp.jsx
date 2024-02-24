// Ramon: Aqui cree un componente para el dialogo, que es simplemente una funcion
// que devuelve un JSX, asi no se mezcla con el resto del codigo
// Luego lo puedes llamar como un tag <DialogPopUp />
// y si quieres que tenga props, se los pasas como si fuera un tag normal
// <DialogPopUp open={dialogOpen} />
// Eso si en la declaracion de la funcion le pones (props) y luego usas props.open
// funcion DialogPopUp(props) { return <dialog open={props.open} ... }
export default function DialogPopUp({ numeroPreguntas, onInputChange, open, toggleDialog, handleSubmit  }) {
    return <div style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        width: "100%",
        height: "100%",
        position: "absolute",
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
                    submit
                </button>
            </div>
        </dialog>
    </div>;
}

