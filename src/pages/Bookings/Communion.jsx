import { useContext, useState } from "react";
import "../../styles/booking/wedding.css";
import { supabase } from "../../config/supabase";
import axios from "axios";
import { API_URL } from "../../Constants";
import { useNavigate } from "react-router-dom";
import { NavbarContext } from "../../context/AllContext";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Cookies from "js-cookie";

import pdf_image from "../../assets/pdfImage.svg";
import Modal from "../../components/Modal";



export default function Communion() {
  const { setSelectedNavbar } = useContext(NavbarContext);

  const [fname, setFname] = useState("");
  const [mname, setMname] = useState("");
  const [lname, setLname] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [attendees, setAttendees] = useState(0);
  const [email, setEmail] = useState(Cookies.get("email") || "");
  const [contactNumber, setContactNumber] = useState(
    Cookies.get("contact") || "",
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const uid = Cookies.get("uid");

  const [showModalMessage, setShowModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState();

  function validate() {
    const newErrors = {};

    if (!fname) newErrors.first_name = true;
    if (!mname) newErrors.middle_name = true;
    if (!lname) newErrors.last_name = true;
    if (!email) newErrors.email = true;
    if (!contactNumber) newErrors.contact_number = true;
    if (!date) newErrors.date = true;
    if (!time) newErrors.time = true;
    if (!attendees || attendees <= 0) newErrors.attendees = true;

    if (!baptismalCertificateFile) newErrors.baptismal_certFile = true;
    if (!communionPreparationFile) newErrors.communion_prepFile = true;
    if (!parentConsentFile) newErrors.parent_consentFile = true;

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  const inputText = [
    {
      key: "first_name",
      title: "First Name",
      type: "text",
      onChange: setFname,
      value: fname,
    },
    {
      key: "middle_name",
      title: "Middle Name",
      type: "text",
      onChange: setMname,
      value: mname,
    },
    {
      key: "last_name",
      title: "Last Name",
      type: "text",
      onChange: setLname,
      value: lname,
    },
    {
      key: "email",
      title: "Email",
      type: "email",
      onChange: setEmail,
      value: email,
      readOnly: true,
    },
    {
      key: "date",
      title: "Date",
      type: "date",
      onChange: setDate,
      value: date,
    },
    {
      key: "time",
      title: "Time",
      type: "time",
      onChange: setTime,
      value: time,
    },

    {
      key: "attendees",
      title: "Attendees",
      type: "number",
      onChange: setAttendees,
      value: attendees,
    },

    {
      key: "contact_number",
      title: "Contact Number",
      type: "text",
      onChange: setContactNumber,
      value: contactNumber,
      readOnly: true,
    },
  ];

  const [baptismalCertificateFile, setBaptismalCertificateFile] =
    useState(null);
  const [baptismalCertificatePreview, setBaptismalCertificatePreview] =
    useState(null);

  const [communionPreparationFile, setCommunionPreparationFile] =
    useState(null);
  const [communionPreparationPreview, setCommunionPreparationPreview] =
    useState(null);

  const [parentConsentFile, setParentConsentFile] = useState(null);
  const [parentConsentPreview, setParentConsentPreview] = useState(null);

  const uploadFiles = [
    {
      key: "baptismal_cert",
      title: "Baptismal Certificate",
      fileSetter: setBaptismalCertificateFile,
      preview: baptismalCertificatePreview,
      previewSetter: setBaptismalCertificatePreview,
    },
    {
      key: "communion_prep",
      title: "Communion Preparation",
      fileSetter: setCommunionPreparationFile,
      preview: communionPreparationPreview,
      previewSetter: setCommunionPreparationPreview,
    },
    {
      key: "parent_consent",
      title: "Parent Consent",
      fileSetter: setParentConsentFile,
      preview: parentConsentPreview,
      previewSetter: setParentConsentPreview,
    },
  ];
  async function uploadImage(file, namePrefix) {
    const ext = file.name.split(".").pop();
    const fileName = `${namePrefix}_${Date.now()}.${ext}`;
    const filePath = `communion/${fileName}`;

    const { error } = await supabase.storage
      .from("communion")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload Error:", error);
      throw error;
    }

    const { data } = supabase.storage.from("communion").getPublicUrl(filePath);
    return data.publicUrl;
  }
  function generateTransactionID() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `COM-${timestamp}-${random}`;
  }

    const handleModalClose = () => {
      setShowModalMessage(false);
      setSelectedNavbar("Home")
      navigate("/");
    };

  async function handleSubmit() {
    if (!validate()) {
      setShowModalMessage(true);
      setModalMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const uploaded = {};

      if (baptismalCertificateFile) {
        uploaded.baptismalCert = await uploadImage(
          baptismalCertificateFile,
          "baptismal_cert",
        );
        if (communionPreparationFile) {
          uploaded.communionPrep = await uploadImage(
            communionPreparationFile,
            "communion_prep",
          );
        }
        if (parentConsentFile) {
          uploaded.parentConsent = await uploadImage(
            parentConsentFile,
            "parent_consent",
          );
        }
      }

      const payload = {
        uid: uid,
        transaction_id: generateTransactionID(),
        full_name: `${fname} ${mname} ${lname}`,
        email: email,
        date: date,
        time: time,
        attendees: attendees,
        contact_number: contactNumber,
        baptismal_certificate: uploaded.baptismalCert || "",
        communion_preparation: uploaded.communionPrep || "",
        parent_consent: uploaded.parentConsent || "",
      };

      const res = await axios.post(`${API_URL}/createCommunionWeb`, payload);
      setShowModalMessage(true);
      setModalMessage("Communion booking submitted successfully!");
      setLoading(false);
      console.log("Saved:", res.data);

      setFname("");
      setMname("");
      setLname("");
      setEmail("");
      setDate("");
      setTime("");
      setAttendees(0);
      setContactNumber("");
      setBaptismalCertificateFile(null);
      setBaptismalCertificatePreview(null);
      setCommunionPreparationFile(null);
      setCommunionPreparationPreview(null);
      setParentConsentFile(null);
      setParentConsentPreview(null);
      setErrors({});

      navigate("/");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      setShowModalMessage(true);
      setModalMessage("Failed to submit communion booking");
      setLoading(false);
    }
  }

  const personalInputs = inputText.filter((i) =>
    [
      "first_name",
      "middle_name",
      "last_name",
      "email",
      "contact_number",
    ].includes(i.key),
  );
  const scheduleInputs = inputText.filter((i) =>
    ["date", "time", "attendees"].includes(i.key),
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="main-holder">
      <div className="form-wrapper">
        <div className="form-section">
          <h2 className="section-title">1. Communicant Information</h2>
          <div className="grid-layout">
            {personalInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type={elem.type}
                  className={`input-text ${errors[elem.key] ? "input-error" : ""}`}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    if (errors[elem.key])
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                  }}
                  value={elem.value}
                  placeholder={`Enter ${elem.title.toLowerCase()}`}
                  readOnly={elem.readOnly}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">2. Schedule & Attendance</h2>
          <div className="grid-layout">
            {scheduleInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                {elem.type === "date" ? (
                  <DatePicker
                    selected={elem.value ? new Date(elem.value) : null}
                    onChange={(v) => {
                      elem.onChange(v ? v.toISOString() : "");
                      if (errors.date)
                        setErrors((prev) => ({ ...prev, date: false }));
                    }}
                    className={`input-text ${errors.date ? "input-error" : ""}`}
                    minDate={tomorrow}
                    dateFormat="yyyy-MM-dd"
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select date"
                    onKeyDown={(e) => e.preventDefault()}
                  />
                ) : elem.type === "time" ? (
                  <div
                    className={`time-container ${errors.time ? "input-error" : ""}`}
                    style={{
                      borderRadius: "6px",
                      height: "45px",
                      overflow: "hidden",
                    }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <MobileTimePicker
                        value={time ? dayjs(`2000-01-01 ${time}`) : null}
                        onChange={(v) => {
                          setTime(v ? dayjs(v).format("HH:mm") : "");
                          if (errors.time)
                            setErrors((prev) => ({ ...prev, time: false }));
                        }}
                        slotProps={{
                          textField: {
                            variant: "standard",
                            fullWidth: true,
                            InputProps: {
                              disableUnderline: true,
                              sx: { px: 2, height: "45px", fontSize: "0.9rem" },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                ) : (
                  <input
                    type={elem.type}
                    className={`input-text ${errors[elem.key] ? "input-error" : ""}`}
                    onChange={(e) => {
                      elem.onChange(e.target.value);
                      if (errors[elem.key])
                        setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }}
                    value={elem.value}
                    placeholder={`Enter ${elem.title.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">3. Required Certificates</h2>
          <div className="upload-grid">
            {uploadFiles.map((elem) => (
              <div
                key={elem.key}
                className="per-grid-container"
                style={{
                  padding: "15px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                }}
              >
                <h1
                  style={{
                    fontSize: "0.85rem",
                    marginBottom: "10px",
                    color: "#424242",
                    fontWeight: "bold",
                  }}
                >
                  {elem.title}
                </h1>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className={`inputFile-properties ${
                    errors[elem.key + "File"] ? "input-error" : ""
                  }`}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    elem.fileSetter(file);

                    if (file.type === "application/pdf") {
                      elem.previewSetter(pdf_image);
                    } else {
                      elem.previewSetter(URL.createObjectURL(file));
                    }

                    if (errors[elem.key + "File"])
                      setErrors((prev) => ({
                        ...prev,
                        [elem.key + "File"]: false,
                      }));
                  }}
                />

                {elem.preview && (
                  <img
                    src={elem.preview}
                    className="image-preview"
                    alt="preview"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="submit-btn-container">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Confirm Communion Schedule"}
          </button>
        </div>
      </div>
      {showModalMessage && (
        <Modal message={modalMessage} setShowModal={setShowModalMessage} onOk={handleModalClose} />
      )}
    </div>
  );
}
