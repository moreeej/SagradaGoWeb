import { useContext, useState } from "react";
import Button from "../components/Button";
import { NavbarContext } from "../context/AllContext";
import SignUpPage from "./SignUpPage";


export default function SignInPage() {
  const { setShowSignin, showSignup, setShowSignup } = useContext(NavbarContext);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPass, setShowPass] = useState(false)

  async function SignIn(){
    alert("Sign in")
    
  }

  return (
    <>
      {showSignup ? 
        <SignUpPage />
      :
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8! flex flex-col justify-center items-center gap-2">
          <div className="w-full flex justify-end">
            <button 
              className="cursor-pointer"
              onClick={() => {
                setShowSignin(false)
                setShowSignup(false)
              }}
            >
              X
            </button>

          </div>
          <h1 className="text-black">Email</h1>
          <input
            type="email"
            onChange={(e) => setInputEmail(e.target.value)}
            className="bg-white border"
          />
          <h1 className="text-black">Password</h1>
          <input
            type={`${showPass ? "text" : "password"}`}
            onChange={(e) => setInputPassword(e.target.value)}
            className="bg-white border"
          />
          <Button 
            color={"#b87d3e"}
            textColor={"#ffffff"}
            text={"Sign in"}
            onClick={SignIn}
          />
          <button
            onClick={() => setShowSignup(true)}
            className="cursor-pointer hover:underline"
          >
            No account yet?
          </button>
        </div>
      </div>
      }
    </>
  );
}
