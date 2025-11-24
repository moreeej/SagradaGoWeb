// import { useContext, useState } from "react";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../config/firebase";
// import Button from "../components/Button";
// import { NavbarContext } from "../context/AllContext";
// import SignUpPage from "./SignUpPage";
// import { useNavigate } from "react-router-dom";
// import Cookies from "js-cookie";
// import axios from "axios";
// import { API_URL } from "../Constants";

// export default function SignInPage() {
//   const navigate = useNavigate();
//   const { setShowSignin, showSignup, setShowSignup, setCurrentUser } = useContext(NavbarContext);
//   const [inputEmail, setInputEmail] = useState("");
//   const [inputPassword, setInputPassword] = useState("");
//   const [showPass, setShowPass] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // async function SignIn() {
//   //   setError("");
//   //   setLoading(true);

//   //   try {
//   //     const userCredential = await signInWithEmailAndPassword(
//   //       auth,
//   //       inputEmail,
//   //       inputPassword
//   //     );
//   //     const user = userCredential.user;
//   //     const uid = user.uid;

//   //     const response = await axios.post(`${API_URL}/findUser`, { uid });
//   //     const data = response.data.user
//   //     setCurrentUser({data})

//   //     Cookies.set("email", inputEmail, { expires: 7 });
//   //     setShowSignin(false);
//   //     navigate("/");
//   //   } catch (err) {
//   //     console.error(err);
//   //     if (err.code === "auth/user-not-found") {
//   //       setError("No user found with this email.");
//   //     } else if (err.code === "auth/wrong-password") {
//   //       setError("Incorrect password.");
//   //     } else {
//   //       setError("Failed to sign in. Please try again.");
//   //     }
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }

//   async function SignIn() {
//   setError("");
//   setLoading(true);

//   if (inputEmail === "berlenebernabe12@gmail.com" && inputPassword === "1234") {
//     Cookies.set("email", inputEmail, { expires: 7 });
//     setShowSignin(false);
//     navigate("/admin/dashboard");
//     setLoading(false);
//     return;
//   }

//   try {
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       inputEmail,
//       inputPassword
//     );
//     const user = userCredential.user;
//     const uid = user.uid;

//     const response = await axios.post(`${API_URL}/findUser`, { uid });
//     const data = response.data.user;
//     setCurrentUser({ data });

//     Cookies.set("email", inputEmail, { expires: 7 });
//     setShowSignin(false);
//     navigate("/");

//   } catch (err) {
//     console.error(err);

//     if (err.code === "auth/user-not-found") {
//       setError("No user found with this email.");

//     } else if (err.code === "auth/wrong-password") {
//       setError("Incorrect password.");

//     } else {
//       setError("Failed to sign in. Please try again.");
//     }

//   } finally {
//     setLoading(false);
//   }
// }

//   return (
//     <>
//       {showSignup ? (
//         <SignUpPage />
//       ) : (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
//           <div className="bg-white rounded-2xl shadow-xl p-8! flex flex-col justify-center items-center gap-2 w-[300px]">
//             <div className="w-full flex justify-end">
//               <button
//                 className="cursor-pointer"
//                 onClick={() => {
//                   setShowSignin(false);
//                   setShowSignup(false);
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             <h1 className="text-black font-semibold text-lg mb-2">Sign In</h1>

//             <label className="text-black w-full">Email</label>
//             <input
//               type="email"
//               value={inputEmail}
//               onChange={(e) => setInputEmail(e.target.value)}
//               className="bg-white border rounded-md px-2 py-1 w-full"
//               placeholder="Enter your email"
//             />

//             <label className="text-black w-full">Password</label>
//             <div className="relative w-full">
//               <input
//                 type={showPass ? "text" : "password"}
//                 value={inputPassword}
//                 onChange={(e) => setInputPassword(e.target.value)}
//                 className="bg-white border rounded-md px-2 py-1 w-full"
//                 placeholder="Enter your password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPass(!showPass)}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
//               >
//                 {showPass ? "Hide" : "Show"}
//               </button>
//             </div>

//             {error && <p className="text-red-500! text-sm mt-1">{error}</p>}

//             <Button
//               color={"#b87d3e"}
//               textColor={"#ffffff"}
//               text={loading ? "Signing in..." : "Sign in"}
//               onClick={SignIn}
//               disabled={loading}
//             />

//             <button
//               onClick={() => setShowSignup(true)}
//               className="cursor-pointer hover:underline text-sm mt-2"
//             >
//               No account yet? Sign up
//             </button>

//             <button
//               onClick={() => navigate("/admin/login")}
//               className="cursor-pointer hover:underline text-sm mt-2"
//             >
//               Are you an admin?
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import Button from "../components/Button";
import { NavbarContext } from "../context/AllContext";
import SignUpPage from "./SignUpPage";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { API_URL } from "../Constants";

export default function SignInPage() {
  const navigate = useNavigate();
  const { setShowSignin, showSignup, setShowSignup, setCurrentUser } = useContext(NavbarContext);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function SignIn() {
    setError("");
    setLoading(true);

    if (inputEmail === "berlenebernabe12@gmail.com" && inputPassword === "1234") {
      Cookies.set("email", inputEmail, { expires: 7 });
      setShowSignin(false);
      navigate("/admin/dashboard");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        inputEmail,
        inputPassword
      );
      const user = userCredential.user;
      const uid = user.uid;

      const adminResponse = await axios.post(`${API_URL}/findAdmin`, { uid });
      if (adminResponse.data.user) {
        setCurrentUser(adminResponse.data.user);
        Cookies.set("email", inputEmail, { expires: 7 });
        setShowSignin(false);
        navigate("/admin/dashboard");
        return;
      }

      const userResponse = await axios.post(`${API_URL}/findUser`, { uid });
      if (userResponse.data.user) {
        setCurrentUser(userResponse.data.user);
        Cookies.set("email", inputEmail, { expires: 7 });
        setShowSignin(false);
        navigate("/");
        return;
      }

      setError("No account found with this email.");

    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");

      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");

      } else {
        setError("Failed to sign in. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showSignup ? (
        <SignUpPage />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center gap-2 w-[300px]">
            <div className="w-full flex justify-end">
              <button
                className="cursor-pointer"
                onClick={() => {
                  setShowSignin(false);
                  setShowSignup(false);
                }}
              >
                ✕
              </button>
            </div>

            <h1 className="text-black font-semibold text-lg mb-2">Sign In</h1>

            <label className="text-black w-full">Email</label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="bg-white border rounded-md px-2 py-1 w-full"
              placeholder="Enter your email"
            />

            <label className="text-black w-full">Password</label>
            <div className="relative w-full">
              <input
                type={showPass ? "text" : "password"}
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="bg-white border rounded-md px-2 py-1 w-full"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            <Button
              color={"#b87d3e"}
              textColor={"#ffffff"}
              text={loading ? "Signing in..." : "Sign in"}
              onClick={SignIn}
              disabled={loading}
            />

            <button
              onClick={() => setShowSignup(true)}
              className="cursor-pointer hover:underline text-sm mt-2"
            >
              No account yet? Sign up
            </button>

            {/* <button
              onClick={() => {
                setShowSignin(false);
                navigate("/admin/login");
              }}
              className="cursor-pointer hover:underline text-sm mt-2"
            >
              Are you an admin?
            </button> */}
          </div>
        </div>
      )}
    </>
  );
}
