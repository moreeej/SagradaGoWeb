import { useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";
import Wedding from "./Bookings/Wedding";
import Baptism from "./Bookings/Baptism";
import Confession from "./Bookings/Confession";
import Anointing from "./Bookings/Anointing";
import Communion from "./Bookings/Communion";
import Burial from "./Bookings/Burial";





export default function BookService() {
  const { showSignin, bookingSelected } = useContext(NavbarContext);
  return (
    <>
      <div className="w-svw">
        {
          bookingSelected === "wedding" && 
          <Wedding />
        }



        {
          bookingSelected === "baptism" && 
          <Baptism />
        }




        {
          bookingSelected === "confession" && 
          <Confession />
        }


        {
          bookingSelected === "anointing" && 
          <Anointing /> 
        }


        {
          bookingSelected === "communion" && 
          <Communion /> 
        }

        {
          bookingSelected === "burial" && 
          <Burial />  
        }




      </div>

      {showSignin && <SignInPage />}
    </>
  );
}
