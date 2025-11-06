import "../styles/button.css"

export default function Button({ text, color, textColor }){
    return(
        <>
            <button 
                className="main-button"
                style={{backgroundColor: color, color: textColor}}
            >
                {text}
            </button>
        </>
    )
}