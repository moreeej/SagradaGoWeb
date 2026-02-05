import { useContext, useRef, useState } from "react";
import { API_URL } from "../../Constants";
import "../../styles/booking/wedding.css";
import axios from "axios";
import { supabase } from "../../config/supabase";
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



export default function Anointing() {
  const { setSelectedNavbar } = useContext(NavbarContext);

  const [fname, setFname] = useState("");
  const [mname, setMname] = useState("");
  const [lname, setLname] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [attendees, setAttendees] = useState(0);
  const [email, setEmail] = useState(Cookies.get("email") || "");
  const [contactNumber, setContactNumber] = useState(Cookies.get("contact"));
  const [medicalCondition, setMedicalCondition] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showModalMessage, setShowModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState();

  const [bookComplete, setBookComplete] = useState(false);

  const [errors, setErrors] = useState({});

  const uid = Cookies.get("uid");

  const navigate = useNavigate();

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
      onChange: (value) => setContactNumber(value.replace(/\D/g, "")),
      value: contactNumber,
      maxLength: 11,
      readOnly: true,
    },
    {
      key: "medical_condition",
      title: "Medical Condition",
      type: "text",
      onChange: setMedicalCondition,
      value: medicalCondition,
    },
  ];

  const [medicalCertificateFile, setMedicalCertificateFile] = useState(null);
  const [medicalCertificatePreview, setMedicalCertificatePreview] =
    useState(null);
  const fileInputRef = useRef(null);

  const uploadFiles = [
    {
      key: "med_cert",
      title: "Medical Certificate",
      fileSetter: setMedicalCertificateFile,
      preview: medicalCertificatePreview,
      previewSetter: setMedicalCertificatePreview,
    },
  ];

  async function uploadImage(file, namePrefix) {
    const ext = file.name.split(".").pop();
    const fileName = `${namePrefix}_${Date.now()}.${ext}`;
    const filePath = `anointing/${fileName}`;

    const { error } = await supabase.storage
      .from("anointing")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload Error:", error);
      throw error;
    }

    const { data } = supabase.storage.from("anointing").getPublicUrl(filePath);
    return data.publicUrl;
  }

  function generateTransactionID() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `ANO-${timestamp}-${random}`;
  }

    const handleModalClose = () => {
    setShowModalMessage(false);
    setSelectedNavbar("Home")
    navigate("/");
  };

  async function handleSubmit() {
    const newErrors = {};

    if (!fname.trim()) newErrors.first_name = true;
    if (!mname.trim()) newErrors.middle_name = true;
    if (!lname.trim()) newErrors.last_name = true;
    if (!email.trim()) newErrors.email = true;
    if (!contactNumber.trim()) newErrors.contact_number = true;

    if (!date) newErrors.date = true;
    if (!time) newErrors.time = true;
    if (attendees <= 0) newErrors.attendees = true;

    if (!medicalCertificateFile) newErrors.med_cert = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShowModalMessage(true);
      setModalMessage("Please fill in all required fields.");
      return;
    }
    const uploaded = {};
    setIsLoading(true);
    try {
      if (
        fname.trim() === "" ||
        lname.trim() === "" ||
        email.trim() === "" ||
        date.trim() === "" ||
        time.trim() === "" ||
        attendees <= 0 ||
        contactNumber.trim() === ""
      ) {
        setShowModalMessage(true);
        setModalMessage("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }
      if (
        contactNumber.trim().length !== 11 ||
        !contactNumber.startsWith("09")
      ) {
        setShowModalMessage(true);
        setModalMessage("Please enter a valid contact number.");
        setIsLoading(false);
        return;
      }

      if (medicalCertificateFile) {
        uploaded.medical_certificate = await uploadImage(
          medicalCertificateFile,
          "medical_certificate",
        );
      } else {
        setShowModalMessage(true);
        setModalMessage("Please upload medical certificate.");
        setIsLoading(false);
        return;
      }
      const payload = {
        uid: uid,
        full_name: `${fname} ${mname} ${lname}`,
        transaction_id: generateTransactionID(),
        email: email,
        date: date,
        time: time,
        attendees: attendees,
        contact_number: contactNumber,
        medical_condition: medicalCondition || "N/A",
        medical_certificate: uploaded.medical_certificate,
      };

      const res = await axios.post(`${API_URL}/createAnointingWeb`, payload);

      setBookComplete(true);

      setShowModalMessage(true);
      setModalMessage("Anointing booking submitted successfully!");
      console.log("Saved:", res.data);
      setIsLoading(false);

      setFname("");
      setMname("");
      setLname("");
      setEmail("");
      setDate("");
      setTime("");
      setAttendees(0);
      setContactNumber("");
      setMedicalCondition("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setShowModalMessage(true);
      setModalMessage("Failed to submit anointing booking");
      setIsLoading(false);
    }
  }

  const patientInputs = inputText.filter((i) =>
    [
      "first_name",
      "middle_name",
      "last_name",
      "email",
      "contact_number",
      "medical_condition",
    ].includes(i.key),
  );
  const scheduleInputs = inputText.filter((i) =>
    ["date", "time", "attendees"].includes(i.key),
  );

  


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="main-holder">
      <div className="form-wrapper">
        {/* SECTION 1: PATIENT & REQUESTER INFORMATION */}
        <div className="form-section">
          <h2 className="section-title">1. Patient Information</h2>
          <div className="grid-layout">
            {patientInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type={elem.type}
                  className={`input-text ${errors[elem.key] ? "input-error" : ""}`}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    if (errors[elem.key] && e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }
                  }}
                  readOnly={elem.readOnly}
                  value={elem.value}
                  maxLength={elem.maxLength}
                  placeholder={
                    elem.title === "Medical Condition"
                      ? "Leave blank if none"
                      : `Enter ${elem.title.toLowerCase()}`
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: SCHEDULE DETAILS */}
        <div className="form-section">
          <h2 className="section-title">2. Appointment Schedule</h2>
          <div className="grid-layout">
            {scheduleInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                {elem.type === "date" ? (
                  <DatePicker
                    selected={elem.value ? new Date(elem.value) : null}
                    onChange={(v) => {
                      elem.onChange(v ? v.toISOString() : "");
                      if (errors[elem.key])
                        setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }}
                    className={`input-text ${errors[elem.key] ? "input-error" : ""}`}
                    dateFormat="yyyy-MM-dd"
                    showYearDropdown
                    minDate={today}
                    dropdownMode="select"
                    placeholderText="Select preferred date"
                    onKeyDown={(e) => e.preventDefault()}
                  />
                ) : elem.type === "time" ? (
                  <div
                    className="time-container"
                    style={{
                      border: errors["time"]
                        ? "2px solid red"
                        : "1.5px solid #e0e0e0",
                      borderRadius: "6px",
                      height: "45px",
                      overflow: "hidden",
                    }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <MobileTimePicker
                        value={time ? dayjs(`2000-01-01 ${time}`) : null}
                        onChange={(v) => {
                          const formatted = v ? dayjs(v).format("HH:mm") : "";
                          setTime(formatted);
                          if (errors["time"])
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
                      if (errors[elem.key] && e.target.value.trim()) {
                        setErrors((prev) => ({ ...prev, [elem.key]: false }));
                      }
                    }}
                    value={elem.value}
                    maxLength={elem.maxLength}
                    placeholder={`Enter ${elem.title.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: MEDICAL DOCUMENTATION */}
        <div className="form-section">
          <h2 className="section-title">3. Medical Documents</h2>
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
                  className={`inputFile-properties ${errors[elem.key] ? "input-error" : ""}`}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    elem.fileSetter(file);
                    elem.previewSetter(URL.createObjectURL(file));

                    if (errors[elem.key])
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                  }}
                />
                {elem.preview && (
                  <img
                    src={
                      medicalCertificateFile?.type === "application/pdf"
                        ? pdf_image
                        : elem.preview
                    }
                    className="image-preview"
                    alt="preview"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON WITH LOADING STATE */}
        <div className="submit-btn-container">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Processing Request..." : "Confirm Anointing Booking"}
          </button>
        </div>
      </div>
      {showModalMessage && (
        <Modal message={modalMessage} setShowModal={setShowModalMessage} onOk={handleModalClose} bookComplete={bookComplete} />
      )}
    </div>
  );
}
