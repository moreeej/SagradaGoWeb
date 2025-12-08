import { useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";
import Wedding from "./Bookings/Wedding";
import Testing from "./Bookings/Testing";


export default function BookService() {
  const { showSignin, bookingSelected } = useContext(NavbarContext);
  return (
    <>
      <div className="w-svw">
        {
          bookingSelected === "wedding" && 
          <Testing />
        }



        {
          bookingSelected === "baptism" && 
          <div>
            <h1 className="text-black">baptism</h1>
          </div>
        }




        {
          bookingSelected === "confession" && 
          <div>
            <h1 className="text-black">confession</h1>
          </div>
        }


        {
          bookingSelected === "anointing" && 
          <div>
            <h1 className="text-black">anointing</h1>
          </div>
        }


        {
          bookingSelected === "communion" && 
          <div>
            <h1 className="text-black">communion</h1>
          </div>
        }

        {
          bookingSelected === "burial" && 
          <div>
            <h1 className="text-black">burial</h1>
          </div>
        }




      </div>

      {showSignin && <SignInPage />}
    </>
  );
}
