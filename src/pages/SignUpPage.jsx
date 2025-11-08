import React, { useContext, useState } from "react";
import Button from "../components/Button";
import { NavbarContext } from "../context/AllContext";
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function SignUpPage() {
  const { setShowSignup, setShowSignin } = useContext(NavbarContext);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
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
      alert("Account created successfully! Please check your email to verify your account.");

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
        <div className="bg-white rounded-2xl shadow-xl p-8! flex flex-col justify-center items-center gap-4 w-[380px] relative">
          
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
            onClick={() => {
              setShowSignup(false);
              setShowSignin(false);
            }}
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Create Account
          </h2>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b87d3e]"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b87d3e]"
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-sm text-gray-600"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "Hide" : "Show"}
              </button>
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
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </>
  );
}
