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
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

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
          adminUser.is_admin = true;
          setCurrentUser(adminUser);
          localStorage.setItem("currentUser", JSON.stringify(adminUser));
          Cookies.set("email", inputEmail, { expires: 7 });

          const sessionTimeout = Date.now() + (5 * 60 * 1000); 
          localStorage.setItem("sessionTimeout", sessionTimeout.toString());

          navigate("/admin/dashboard");
          setShowSignin(false);
          setLoading(false);
          return;
        }


      } catch (err) {
        
        console.error("Admin check failed:", err);
      }

      try {
        const firebaseToken = await user.getIdToken();

        const loginResponse = await axios.post(`${API_URL}/login`, {
          email: inputEmail,
          password: inputPassword,
          firebaseToken: firebaseToken, 
        });
        console.log("user", loginResponse);

        setCurrentUser(loginResponse.data.user);
        localStorage.setItem("currentUser", JSON.stringify(loginResponse.data.user));

        Cookies.set("email", inputEmail, { expires: 7 });
        Cookies.set("uid", loginResponse.data.user.uid, { expires: 7 });
        Cookies.set("fullname", `${loginResponse.data.user.first_name} ${loginResponse.data.user.middle_name} ${loginResponse.data.user.last_name}`, { expires: 7 });
        Cookies.set("contact", loginResponse.data.user.contact_number, { expires: 7 });
        
        const sessionTimeout = Date.now() + (5 * 60 * 1000); 
        localStorage.setItem("sessionTimeout", sessionTimeout.toString());

        navigate("/");
        setShowSignin(false);
        return;

      } catch (err) {
        console.error("Backend login failed:", err);
        
        if (err.response?.status === 401) {
          setError("Invalid email or password. If you recently changed your password, please try again in a few moments.");
        
        } else if (err.response?.status === 404) {
          setError("No account found with this email.");
        } else {
          setError("Login failed. Please try again.");
        }
        
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
                {showPass ? <EyeTwoTone twoToneColor="#555" /> : <EyeInvisibleOutlined />}
              </button>
            </div>

            {error && <p className="modal-error">{error}</p>}

            <button
              onClick={() => setShowForgotPassword(true)}
              className="modal-link"
              style={{ marginTop: -10, marginBottom: 10, textAlign: 'right' }}
              disabled={loading}
            >
              Forgot Password?
            </button>

            <button
              className="filled-btn"
              style={{ padding: "8px", fontSize: "14px" }}
              onClick={SignIn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
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
