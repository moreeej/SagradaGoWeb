import "../styles/navButton.css"
import { useContext } from "react"
import { NavbarContext } from "../context/AllContext"



export default function NavButton({text, onClick}){
    const { selectedNavbar } = useContext(NavbarContext);
    return(
        <>
            <button 
                className={`nav-button ${selectedNavbar === text && "underline"}`}
                key={text}
                onClick={onClick}
            >
                <p>{text}</p>
            </button>
        </>
    )
}