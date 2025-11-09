import { useContext, useState } from "react";
import Button from "../components/Button";
import { NavbarContext } from "../context/AllContext";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import "../styles/signup.css";

export default function SignUpPage() {
  const { setShowSignup, setShowSignin } = useContext(NavbarContext);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputRepass, setInputRepass] = useState("")
  const [showPass, setShowPass] = useState(false);
  const [showRepass, setShowRepass] = useState(false)
  const [loading, setLoading] = useState(false);

  async function Signup() {
    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        inputEmail,
        inputPassword
      );

      const user = userCredential.user;

      await sendEmailVerification(user);
      alert(
        "Account created successfully! Please check your email to verify your account."
      );

      setInputEmail("");
      setInputPassword("");
      setShowSignup(false);
    } catch (err) {
      console.error("Error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8! flex flex-col justify-center items-center w-8/12">
          <div className="w-full flex justify-end py-3!">
            <button
              className="top-4 right-4 text-gray-500 hover:text-gray-700 text-lg cursor-pointer"
              onClick={() => {
                setShowSignup(false);
                setShowSignin(false);
              }}
            >
              ✕
            </button>
          </div>
          <div className="w-full h-full grid grid-cols-3 gap-7 mb-5!">
            <div>
              <p>First Name</p>
              <input type="text" className="input-properties" />
            </div>
            <div>
              <p>Middle Name</p>
              <input type="text" className="input-properties" />
            </div>
            <div>
              <p>Last Name</p>
              <input type="text" className="input-properties" />
            </div>
            <div className="flex flex-col w-full">
              <p>Gender</p>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  className="radio-properties"
                />{" "}
                Male
              </label>
              <label>
                <input type="radio" name="gender" value="female" /> Female
              </label>
              <label>
                <input type="radio" name="gender" value="none" /> Prefer not to
                say
              </label>
            </div>

            <div>
              <p>Contact Number</p>
              <input type="text" className="input-properties" />
            </div>
            <div className="w-full flex flex-col">
              <p>Civil Status</p>
              <label>
                <input type="radio" name="civil" value="single" /> Single
              </label>
              <label>
                <input type="radio" name="civil" value="married" /> Married
              </label>
              <label>
                <input type="radio" name="civil" value="widowed" />
                Widowed
              </label>
              <label>
                <input type="radio" name="civil" value="divorced" />
                Divorced
              </label>
            </div>
            <div>
              <p>Birthday</p>
              <input type="date" className="input-properties" />
            </div>
            <div>
              <p>Email</p>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-properties"
              />
            </div>
            <div>
              <p>Password</p>
              <div className="flex items-center w-80 overflow-hidden border border-black">
                <input
                  type={showPass ? "text" : "password"}
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="w-auto h-full flex items-center justify-center bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
                >
                  {showPass ? "👁️" : "🚫"}
                </button>
              </div>
            </div>
            <div></div>
            <div></div>
            <div>
              <p>Re-type Password</p>
              <div className="flex items-center w-80 overflow-hidden border border-black">
                <input
                  type={showRepass ? "text" : "password"}
                  value={inputRepass}
                  onChange={(e) => setInputRepass(e.target.value)}
                  placeholder="Enter your password"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowRepass(!showRepass)}
                  className="w-auto h-full flex items-center justify-center bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
                >
                  {showRepass ? "👁️" : "🚫"}
                </button>
              </div>
            </div>
          </div>

          <Button
            color="#b87d3e"
            textColor="#ffffff"
            text={loading ? "Signing up..." : "Sign up"}
            onClick={Signup}
            disabled={loading}
          />

          <button
            onClick={() => {
              setShowSignup(false);
              setShowSignin(true);
            }}
            className="text-sm text-[#b87d3e] hover:underline cursor-pointer"
          >
            Already have an account?
          </button>
        </div>
      </div>
    </>
  );
}
