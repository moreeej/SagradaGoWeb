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
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import Modal from "../components/Modal";

export default function SignUpPage() {
  const { setShowSignup, setShowSignin, setSelectedNavbar } = useContext(NavbarContext);

  const [showModalMessage, setShowModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState();

  const [inputFname, setInputFname] = useState("");
  const [inputMname, setInputMname] = useState("");
  const [inputLname, setInputLname] = useState("");
  // const [inputGender, setInputGender] = useState("");
  const [inputContactNumber, setInputContactNumber] = useState("");
  // const [inputCivilStatus, setInputCivilStatus] = useState("");
  const [inputBirthday, setInputBirthday] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputRepass, setInputRepass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showRepass, setShowRepass] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [errors, setErrors] = useState({
    fname: "",
    mname: "",
    lname: "",
    contactNumber: "",
    birthday: "",
    email: "",
    password: "",
    repass: "",
  });

  const [loading, setLoading] = useState(false);

  const validateName = (name) =>
    /\d/.test(name) ? "Name cannot contain numbers" : "";

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
    return "";
  };

  const validateContactNumber = (contact) => {
    if (!contact) return "";
    if (!/^\d+$/.test(contact)) return "Numbers only";
    if (!contact.startsWith("09")) return "Must start with 09";
    if (contact.length !== 11) return "Must be 11 digits";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Password must contain at least one special character";
    return "";
  };

  const validatePasswordMatch = (password, repass) =>
    repass && password !== repass ? "Passwords do not match" : "";

  const handleFnameChange = (e) => {
    const value = e.target.value;
    const lettersOnly = value.replace(/\d/g, "");
    setInputFname(lettersOnly);
    setErrors((prev) => ({ ...prev, fname: validateName(lettersOnly) }));
  };

  const handleMnameChange = (e) => {
    const value = e.target.value;
    const lettersOnly = value.replace(/\d/g, "");
    setInputMname(lettersOnly);
    setErrors((prev) => ({ ...prev, mname: validateName(lettersOnly) }));
  };

  const handleLnameChange = (e) => {
    const value = e.target.value;
    const lettersOnly = value.replace(/\d/g, "");
    setInputLname(lettersOnly);
    setErrors((prev) => ({ ...prev, lname: validateName(lettersOnly) }));
  };

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, "");
    setInputContactNumber(digitsOnly);
    setErrors((prev) => ({
      ...prev,
      contactNumber: validateContactNumber(digitsOnly),
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setInputPassword(value);

    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value),
      repass: validatePasswordMatch(value, inputRepass),
    }));
  };

  const handleRepassChange = (e) => {
    const value = e.target.value;
    setInputRepass(value);
    setErrors((prev) => ({
      ...prev,
      repass: validatePasswordMatch(inputPassword, value),
    }));
  };

  const validateBirthday = (birthday) => {
    if (!birthday) return "Birthday is required";

    const today = new Date();
    const birthDate = new Date(birthday);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) return "You must be at least 18 years old";

    return "";
  };


    const handleModalClose = () => {
      setShowModalMessage(false);
      setSelectedNavbar("Home")
      setShowSignup(false);
    };

  async function handleSignup() {
    setSubmitted(true);

    const validationErrors = {
      fname: validateName(inputFname),
      mname: validateName(inputMname),
      lname: validateName(inputLname),
      contactNumber: validateContactNumber(inputContactNumber),
      birthday: validateBirthday(inputBirthday),
      email: validateEmail(inputEmail),
      password: validatePassword(inputPassword),
      repass: validatePasswordMatch(inputPassword, inputRepass),
    };

    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) {
      setModalMessage("Please fill all input fields.");
      setShowModalMessage(true);
      return;
    }

    try {
      setLoading(true);

      const { user } = await createUserWithEmailAndPassword(
        auth,
        inputEmail,
        inputPassword,
      );

      await sendEmailVerification(user);

      await axios.post(`${API_URL}/createUser`, {
        uid: user.uid,
        email: inputEmail,
        password: inputPassword,
        first_name: inputFname,
        middle_name: inputMname,
        last_name: inputLname,
        contact_number: inputContactNumber,
        birthday: inputBirthday,
      });

      setModalMessage("Account created! Please verify your email.");
      setShowModalMessage(true);


    } catch (err) {
      setModalMessage(err.message || "Signup failed.");
      setShowModalMessage(true);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (value, error) => {
    if (!submitted) return "modal-input"; // always black before submit
    if (error || !value) return "modal-input input-error";
    return "modal-input";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-close">
          <button
            onClick={() => {
              setShowSignup(false);
              setShowSignin(false);
            }}
          >
            ✕
          </button>
        </div>

        <h1 className="modal-title">Create an Account</h1>
        <p className="modal-subtitle">Enter necessary details to register.</p>

        <div className="modal-grid">
          <div>
            <label>First Name</label>
            <input
              type="text"
              value={inputFname}
              onChange={handleFnameChange}
              className={inputClass(inputFname, errors.fname)}
            />
            {errors.fname && (
              <span className="error-message">{errors.fname}</span>
            )}
          </div>
          <div>
            <label>Middle Name</label>
            <input
              type="text"
              value={inputMname}
              onChange={handleMnameChange}
              className={inputClass(inputMname, errors.mname)}
            />
            {errors.mname && (
              <span className="error-message">{errors.mname}</span>
            )}
          </div>
          <div>
            <label>Last Name</label>
            <input
              type="text"
              value={inputLname}
              onChange={handleLnameChange}
              className={inputClass(inputLname, errors.lname)}
            />
            {errors.lname && (
              <span className="error-message">{errors.lname}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label>Contact Number</label>
              <input
                type="text"
                value={inputContactNumber}
                onChange={handleContactNumberChange}
                maxLength={11}
                className={inputClass(inputContactNumber, errors.contactNumber)}
              />
              {errors.contactNumber && (
                <span className="error-message">{errors.contactNumber}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label>Birthday</label>
              <input
                type="date"
                value={inputBirthday}
                onChange={(e) => setInputBirthday(e.target.value)}
                className={inputClass(inputBirthday, errors.birthday)}
              />
              {errors.birthday && (
                <span className="error-message">{errors.birthday}</span>
              )}
            </div>
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => {
                const value = e.target.value;
                setInputEmail(value);
                setErrors((prev) => ({
                  ...prev,
                  email: validateEmail(value),
                }));
              }}
              className={inputClass(inputEmail, errors.email)}
            />
          </div>
          <div>
            <label>Password</label>
            <div className="modal-password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                value={inputPassword}
                onChange={handlePasswordChange}
                className={inputClass(inputPassword, errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="password-toggle"
              >
                {showPass ? (
                  <EyeTwoTone twoToneColor="#555" />
                ) : (
                  <EyeInvisibleOutlined />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div>
            <label>Re-type Password</label>
            <div className="modal-password-wrapper">
              <input
                type={showRepass ? "text" : "password"}
                value={inputRepass}
                onChange={handleRepassChange}
                className={inputClass(inputRepass, errors.repass)}
              />
              <button
                type="button"
                onClick={() => setShowRepass(!showRepass)}
                className="password-toggle"
              >
                {showRepass ? (
                  <EyeTwoTone twoToneColor="#555" />
                ) : (
                  <EyeInvisibleOutlined />
                )}
              </button>
            </div>
            {errors.repass && (
              <span className="error-message">{errors.repass}</span>
            )}
          </div>
        </div>

        <button
          className="filled-btn"
          style={{ padding: "8px", fontSize: "14px" }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <button
          onClick={() => {
            setShowSignup(false);
            setShowSignin(true);
          }}
          className="modal-link"
        >
          Already have an account? Sign In
        </button>
      </div>

      {showModalMessage && (
        <Modal message={modalMessage} setShowModal={setShowModalMessage} onOk={handleModalClose} />
      )}
    </div>
  );
}
