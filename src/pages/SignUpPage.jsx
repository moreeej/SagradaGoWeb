import { useContext, useState } from "react";
import Button from "../components/Button";
import { NavbarContext } from "../context/AllContext";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import "../styles/signup.css";
import axios from "axios";
import { API_URL } from "../Constants";

export default function SignUpPage() {
  const { setShowSignup, setShowSignin } = useContext(NavbarContext);


  const [inputFname, setInputFname] = useState("");
  const [inputMname, setInputMname] = useState("");
  const [inputLname, setInputLname] = useState("");
  const [inputGender, setInputGender] = useState("");
  const [inputContactNumber, setInputContactNumber] = useState("");
  const [inputCivilStatus, setInputCivilStatus] = useState("");
  const [inputBirthday, setInputBirthday] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputRepass, setInputRepass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showRepass, setShowRepass] = useState(false);



  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    try {

      if (!inputEmail || !inputPassword || !inputFname || !inputLname) {
        alert("Please fill out all required fields.");
        return;
      }
      if (inputPassword !== inputRepass) {
        alert("Passwords do not match!");
        return;
      }

      setLoading(true);


      const userCredential = await createUserWithEmailAndPassword(
        auth,
        inputEmail,
        inputPassword
      );
      const user = userCredential.user;
      const uid = user.uid;
      


      await sendEmailVerification(user);
      alert("Account created successfully! Please verify your email.");

      await axios.post(`${API_URL}/createUser`, {
        first_name: inputFname,
        middle_name: inputMname,
        last_name: inputLname,
        gender: inputGender,
        contact_number: inputContactNumber,
        civil_status: inputCivilStatus,
        birthday: inputBirthday,
        email: inputEmail,
        password: inputPassword,
        uid: uid
      });

      
      // setInputFname("")
      // setInputMname("")
      // setInputLname("")
      // setInputGender("")
      // setInputContactNumber("")
      // setInputCivilStatus("")
      // setInputBirthday("")
      // setInputEmail("");
      // setInputPassword("");
      // setInputRepass("");
      setShowSignup(false);
    } catch (err) {
      console.error("Signup Error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8! flex flex-col justify-center items-center w-8/12">
        <div className="w-full flex justify-end py-3">
          <button
            className="text-gray-500 hover:text-gray-700 text-lg cursor-pointer"
            onClick={() => {
              setShowSignup(false);
              setShowSignin(false);
            }}
          >
            ✕
          </button>
        </div>
        <div className="w-full flex justify-center items-center my-5!">
          <h1 className="text-3xl">Create an Account</h1>

        </div>

        <div className="w-full h-full grid grid-cols-3 gap-7 mb-5!">
          <div>
            <p>First Name</p>
            <input
              type="text"
              value={inputFname}
              onChange={(e) => setInputFname(e.target.value)}
              className="input-properties"
            />
          </div>
          <div>
            <p>Middle Name</p>
            <input
              type="text"
              value={inputMname}
              onChange={(e) => setInputMname(e.target.value)}
              className="input-properties"
            />
          </div>
          <div>
            <p>Last Name</p>
            <input
              type="text"
              value={inputLname}
              onChange={(e) => setInputLname(e.target.value)}
              className="input-properties"
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col w-full">
            <p>Gender</p>
            {["Male", "Female", "None"].map((g) => (
              <label key={g}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={inputGender === g}
                  onChange={(e) => setInputGender(e.target.value)}
                />{" "}
                {g === "None" ? "Prefer not to say" : g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p>Contact Number</p>
            <input
              type="text"
              value={inputContactNumber}
              onChange={(e) => setInputContactNumber(e.target.value)}
              className="input-properties"
            />
          </div>

          {/* Civil Status */}
          <div className="w-full flex flex-col">
            <p>Civil Status</p>
            {["Single", "Married", "Widowed", "Divorced"].map((status) => (
              <label key={status}>
                <input
                  type="radio"
                  name="civil"
                  value={status}
                  checked={inputCivilStatus === status}
                  onChange={(e) => setInputCivilStatus(e.target.value)}
                />{" "}
                {status}
              </label>
            ))}
          </div>

          <div>
            <p>Birthday</p>
            <input
              type="date"
              value={inputBirthday}
              onChange={(e) => setInputBirthday(e.target.value)}
              className="input-properties"
            />
          </div>

          {/* Email */}
          <div>
            <p>Email</p>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="input-properties"
            />
          </div>

          {/* Password */}
          <div>
            <p>Password</p>
            <div className="flex items-center w-10/12 overflow-hidden border border-black rounded-md">
              <input
                type={showPass ? "text" : "password"}
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="flex-1 px-1! outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="w-auto h-full px-3 text-white text-sm font-medium transition cursor-pointer"
              >
                {showPass ? "👁️" : "🚫"}
              </button>
            </div>
          </div>

          <div></div>
          <div></div>
          <div>
            <p>Re-type Password</p>
            <div className="flex items-center w-10/12 overflow-hidden border border-black rounded-md">
              <input
                type={showRepass ? "text" : "password"}
                value={inputRepass}
                onChange={(e) => setInputRepass(e.target.value)}
                className="flex-1 px-1! outline-none"
              />
              <button
                type="button"
                onClick={() => setShowRepass(!showRepass)}
                className="w-auto h-full px-3 text-white text-sm font-medium transition cursor-pointer"
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
          onClick={handleSignup}
          disabled={loading}
        />

        <button
          onClick={() => {
            setShowSignup(false);
            setShowSignin(true);
          }}
          className="text-sm text-[#b87d3e] hover:underline cursor-pointer mt-3!"
        >
          Already have an account?
        </button>
      </div>
    </div>
  );
}
