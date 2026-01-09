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
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { API_URL } from "../Constants";

export default function SignInPage() {
  const navigate = useNavigate();
  const { setShowSignin, showSignup, setShowSignup, setCurrentUser } =
    useContext(NavbarContext);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function SignIn() {
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        inputEmail,
        inputPassword
      );

      const user = userCredential.user;

      // if (!user.emailVerified) {
      //   setError(
      //     "Please verify your email address before logging in. Check your inbox for the verification link."
      //   );
      //   setLoading(false);
      //   return;
      // }

      const uid = user.uid;
      console.log("uid:", uid);

      try {
        console.log("napasok sa admin");

        const adminResponse = await axios.post(`${API_URL}/findAdmin`, { uid });

        if (adminResponse.data?.user) {
          const adminUser = adminResponse.data.user;
          setCurrentUser(adminUser);
          localStorage.setItem("currentUser", JSON.stringify(adminUser));
          Cookies.set("email", inputEmail, { expires: 7 });
          
          navigate("/admin/dashboard");
          setShowSignin(false);
          setLoading(false);
          return;
        }

        
      } catch (err) {
        console.error("Admin check failed:", err);
      }

      try {

          const loginResponse = await axios.post(`${API_URL}/login`, {
            email: inputEmail,
            password: inputPassword,
          });
          console.log("user", loginResponse);

          setCurrentUser(loginResponse.data.user);
          
          Cookies.set("email", inputEmail, { expires: 7 });
          Cookies.set("uid", loginResponse.data.user.uid, { expires: 7 });
          Cookies.set("fullname", `${loginResponse.data.user.first_name} ${loginResponse.data.user.middle_name} ${loginResponse.data.user.last_name}`,  { expires: 7 });
          Cookies.set("contact", loginResponse.data.user.contact_number, { expires: 7 });
          navigate("/");
          setShowSignin(false);
          return;
        } catch (err) {
          console.error("Backend login failed:", err);
          setError("No account found with this email.");
        }
    } catch (err) {
      console.error("Firebase login failed:", err);

      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  //   if (loginResponse.data.user) {
  //   const regularUser = loginResponse.data.user;

  //   if (regularUser.is_active === false) {
  //     setError("Your account has been disabled. Please contact the administrator for assistance.");
  //     setLoading(false);
  //     return;
  //   }

  //   setCurrentUser(regularUser);
  //   localStorage.setItem("currentUser", JSON.stringify(regularUser));
  //   Cookies.set("email", inputEmail, { expires: 7 });
  //   setShowSignin(false);
  //   navigate("/");
  //   setLoading(false);
  //   return;
  // }

  // try {

  // } catch (loginError) {
  //   if (loginError.response && (loginError.response.status === 401 || loginError.response.status === 404)) {
  //     let adminUserCredential = firebaseUserCredential;

  //     if (!adminUserCredential) {
  //       try {
  //         adminUserCredential = await signInWithEmailAndPassword(
  //           auth,
  //           inputEmail,
  //           inputPassword
  //         );

  //       } catch (adminFirebaseError) {
  //         // Firebase auth failed for admin too, show error from original login attempt
  //         if (loginError.response.status === 401) {
  //           setError("Invalid email or password.");

  //         } else if (loginError.response.status === 404) {
  //           setError("No account found with this email.");

  //         } else {
  //           setError("Failed to sign in. Please try again.");
  //         }

  //         setLoading(false);
  //         return;
  //       }
  //     }

  //     const uid = adminUserCredential.user.uid;

  //       try {
  //         const adminResponse = await axios.post(`${API_URL}/findAdmin`, { uid });
  //         if (adminResponse.data.user) {
  //           const adminUser = adminResponse.data.user;

  //           if (adminUser.is_active === false) {
  //             setError("Your account has been disabled. Please contact the administrator for assistance.");
  //             setLoading(false);
  //             return;
  //           }

  //           setCurrentUser(adminUser);
  //           localStorage.setItem("currentUser", JSON.stringify(adminUser));
  //           Cookies.set("email", inputEmail, { expires: 7 });
  //           setShowSignin(false);
  //           navigate("/admin/dashboard");
  //           setLoading(false);
  //           return;
  //         }

  //       } catch (adminError) {
  //         if (loginError.response.status === 401) {
  //           setError("Invalid email or password.");

  //         } else if (loginError.response.status === 404) {
  //           setError("No account found with this email.");

  //         } else {
  //           setError("Failed to sign in. Please try again.");
  //         }

  //         setLoading(false);
  //         return;
  //       }

  //   } else {
  //     console.error("Login error:", loginError);

  //     if (loginError.response) {
  //       if (loginError.response.status === 403) {
  //         setError(loginError.response.data?.message || "Your account has been disabled. Please contact the administrator for assistance.");

  //       } else {
  //         setError(loginError.response.data?.message || "Failed to sign in. Please try again.");
  //       }

  //     } else {
  //       setError("Failed to sign in. Please check your connection and try again.");
  //     }
  //     setLoading(false);
  //     return;
  //   }
  // }

  return (
    <>
      {showSignup ? (
        <SignUpPage />
      ) : (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-close">
              <button
                onClick={() => {
                  setShowSignin(false);
                  setShowSignup(false);
                }}
              >
                ✕
              </button>
            </div>

            <h1 className="modal-title">Sign In</h1>
            <p className="modal-subtitle">
              Enter your registered email and password.
            </p>

            <label>Email</label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="modal-input"
              placeholder="youremail@example.com"
            />

            <label>Password</label>
            <div className="modal-password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="modal-input"
                placeholder="**********"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="password-toggle"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>

            {error && <p className="modal-error">{error}</p>}

            <button
              className="filled-btn"
              style={{ padding: "8px", fontSize: "14px" }}
              onClick={SignIn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              onClick={() => setShowForgotPassword(true)}
              className="modal-link"
              disabled={loading}
            >
              Forgot Password?
            </button>

            <button onClick={() => setShowSignup(true)} className="modal-link">
              No account yet? Sign up
            </button>

            <ForgotPasswordModal
              visible={showForgotPassword}
              onClose={() => setShowForgotPassword(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
