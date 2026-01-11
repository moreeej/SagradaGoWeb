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
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

export default function SignUpPage() {
  const { setShowSignup, setShowSignin } = useContext(NavbarContext);


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

  const [errors, setErrors] = useState({
    fname: "",
    mname: "",
    lname: "",
    contactNumber: "",
    password: "",
    repass: ""
  });

  const [loading, setLoading] = useState(false);

  const validateName = (name) => {
    if (/\d/.test(name)) {
      return "Name cannot contain numbers";
    }

    return "";
  };

  const validateContactNumber = (contact) => {
    const digitsOnly = contact.replace(/\D/g, "");

    if (contact && digitsOnly !== contact) {
      return "Contact number must contain numbers only";
    }

    if (contact && !contact.startsWith("09")) {
      return "Contact number must start with 09";
    }

    if (contact && contact.length !== 11) {
      return "Contact number must be exactly 11 digits";
    }

    return "";
  };

  const validatePasswordMatch = (password, repass) => {
    if (repass && password !== repass) {
      return "Passwords do not match";
    }

    return "";
  };

  const handleFnameChange = (e) => {
    const value = e.target.value;
    const lettersOnly = value.replace(/\d/g, "");
    setInputFname(lettersOnly);
    setErrors(prev => ({ ...prev, fname: validateName(lettersOnly) }));
  };

  const handleMnameChange = (e) => {
    const value = e.target.value;
    const lettersOnly = value.replace(/\d/g, "");
    setInputMname(lettersOnly);
    setErrors(prev => ({ ...prev, mname: validateName(lettersOnly) }));
  };

  const handleLnameChange = (e) => {
    const value = e.target.value;
    const lettersOnly = value.replace(/\d/g, "");
    setInputLname(lettersOnly);
    setErrors(prev => ({ ...prev, lname: validateName(lettersOnly) }));
  };

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, "");
    setInputContactNumber(digitsOnly);
    setErrors(prev => ({ ...prev, contactNumber: validateContactNumber(digitsOnly) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setInputPassword(value);
    if (inputRepass) {
      setErrors(prev => ({ ...prev, repass: validatePasswordMatch(value, inputRepass) }));
    }
  };

  const handleRepassChange = (e) => {
    const value = e.target.value;
    setInputRepass(value);
    setErrors(prev => ({ ...prev, repass: validatePasswordMatch(inputPassword, value) }));
  };

  async function handleSignup() {
    try {
      const validationErrors = {
        fname: validateName(inputFname),
        mname: validateName(inputMname),
        lname: validateName(inputLname),
        contactNumber: validateContactNumber(inputContactNumber),
        repass: validatePasswordMatch(inputPassword, inputRepass)
      };

      setErrors(validationErrors);

      const hasErrors = Object.values(validationErrors).some(error => error !== "");
      if (hasErrors) {
        alert("Please fix the validation errors before submitting.");
        return;
      }

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



      // await sendEmailVerification(user);
      // alert("Account created successfully! Please verify your email.");

      await axios.post(`${API_URL}/createUser`, {
        first_name: inputFname,
        middle_name: inputMname,
        last_name: inputLname,
        // gender: inputGender,
        contact_number: inputContactNumber,
        // civil_status: inputCivilStatus,
        birthday: inputBirthday,
        email: inputEmail,
        password: inputPassword,
        uid: uid
      });


      setInputFname("")
      setInputMname("")
      setInputLname("")
      // setInputGender("")
      setInputContactNumber("")
      // setInputCivilStatus("")
      setInputBirthday("")
      setInputEmail("");
      setInputPassword("");
      setInputRepass("");
      setShowSignup(false);
    } catch (err) {
      console.error("Signup Error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

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
              className={`modal-input ${errors.fname ? 'input-error' : ''}`}
            />
            {errors.fname && <span className="error-message">{errors.fname}</span>}
          </div>
          <div>
            <label>Middle Name</label>
            <input
              type="text"
              value={inputMname}
              onChange={handleMnameChange}
              className={`modal-input ${errors.mname ? 'input-error' : ''}`}
            />
            {errors.mname && <span className="error-message">{errors.mname}</span>}
          </div>
          <div>
            <label>Last Name</label>
            <input
              type="text"
              value={inputLname}
              onChange={handleLnameChange}
              className={`modal-input ${errors.lname ? 'input-error' : ''}`}
            />
            {errors.lname && <span className="error-message">{errors.lname}</span>}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Contact Number</label>
              <input
                type="text"
                value={inputContactNumber}
                onChange={handleContactNumberChange}
                maxLength={11}
                className={`modal-input ${errors.contactNumber ? 'input-error' : ''}`}
              />
              {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label>Birthday</label>
              <input
                type="date"
                value={inputBirthday}
                onChange={(e) => setInputBirthday(e.target.value)}
                className="modal-input"
              />
            </div>
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="modal-input"
            />
          </div>
          <div>
            <label>Password</label>
            <div className="modal-password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                value={inputPassword}
                onChange={handlePasswordChange}
                className={`modal-input ${errors.password ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="password-toggle"
              >
                {showPass ? <EyeTwoTone twoToneColor="#555" /> : <EyeInvisibleOutlined />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div>
            <label>Re-type Password</label>
            <div className="modal-password-wrapper">
              <input
                type={showRepass ? "text" : "password"}
                value={inputRepass}
                onChange={handleRepassChange}
                className={`modal-input ${errors.repass ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowRepass(!showRepass)}
                className="password-toggle"
              >
                {showRepass ? <EyeTwoTone twoToneColor="#555" /> : <EyeInvisibleOutlined />}
              </button>
            </div>
            {errors.repass && <span className="error-message">{errors.repass}</span>}
          </div>
        </div>

        <button
          className="filled-btn"
          style={{ padding: '8px', fontSize: '14px' }}
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
    </div>

  );
}
