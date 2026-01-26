import { useState } from "react";
import "../../styles/booking/wedding.css";
import { supabase } from "../../config/supabase";
import axios from "axios";
import { API_URL } from "../../Constants";
import { useNavigate } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Cookies from "js-cookie";

import pdf_image from "../../assets/pdfImage.svg";
import Modal from "../../components/Modal";

export default function Burial() {
  const [showModalMessage, setShowModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState();

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [checkboxError, setCheckboxError] = useState(false);

  const navigate = useNavigate();

  function validate() {
    const newErrors = {};

    inputText.forEach((i) => {
      if (
        !i.value &&
        i.type !== "email" &&
        i.key !== "middle_name" &&
        i.key !== "deceased_mname"
      ) {
        newErrors[i.key] = true;
      }
    });

    if (!date) newErrors.date = true;
    if (!time) newErrors.time = true;

    uploadFiles.forEach((f) => {
      if (!f.preview) newErrors[f.key] = true;
    });

    if (!deathAnniv && !funeralMass && !funeralBlessing && !tombBlessing) {
      setCheckboxError(true);
    } else {
      setCheckboxError(false);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !checkboxError;
  }

  const uid = Cookies.get("uid");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  const [deceasedFname, setDeceasedFname] = useState("");
  const [deceasedMname, setDeceasedMname] = useState("");
  const [deceasedLname, setDeceasedLname] = useState("");
  const [deceasedAge, setDeceasedAge] = useState("");
  const [deceasedCivilStatus, setDeceasedCivilStatus] = useState("");
  const [relationship, setRelationship] = useState("");
  const [address, setAddress] = useState("");
  const [placeOfMass, setPlaceOfMass] = useState("");
  const [massAddress, setMassAddress] = useState("");

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
      key: "address",
      title: "Address",
      type: "text",
      onChange: setAddress,
      value: address,
    },

    {
      key: "deceased_fname",
      title: "Deceased First Name",
      type: "text",
      onChange: setDeceasedFname,
      value: deceasedFname,
    },
    {
      key: "deceased_mname",
      title: "Deceased Middle Name",
      type: "text",
      onChange: setDeceasedMname,
      value: deceasedMname,
    },
    {
      key: "deceased_lname",
      title: "Deceased Last Name",
      type: "text",
      onChange: setDeceasedLname,
      value: deceasedLname,
    },
    {
      key: "deceased_age",
      title: "Deceased Age",
      type: "number",
      onChange: setDeceasedAge,
      value: deceasedAge,
    },
    {
      key: "deceased_civil_status",
      title: "Deceased Civil Status",
      type: "text",
      onChange: setDeceasedCivilStatus,
      value: deceasedCivilStatus,
    },

    {
      key: "relationship_to_deceased",
      title: "Relationship to Deceased",
      type: "text",
      onChange: setRelationship,
      value: relationship,
    },
    {
      key: "contact_number",
      title: "Contact Number",
      type: "text",
      onChange: setContactNumber,
      value: contactNumber,
      maxLength: 11,
      readOnly: true,
    },

    {
      key: "place_mass",
      title: "Place of Mass",
      type: "text",
      onChange: setPlaceOfMass,
      value: placeOfMass,
    },
    {
      key: "mass_address",
      title: "Mass Address",
      type: "text",
      onChange: setMassAddress,
      value: massAddress,
    },
  ];

  const [deathAnniv, setDeathAnniv] = useState(false);
  const [funeralMass, setFuneralMass] = useState(false);
  const [funeralBlessing, setFuneralBlessing] = useState(false);
  const [tombBlessing, setTombBlessing] = useState(false);

  const checkboxes = [
    {
      key: "death_anniv",
      title: "Death Anniversary",
      type: "checkbox",
      onChange: setDeathAnniv,
      value: deathAnniv,
    },
    {
      key: "funeral_mass",
      title: "Funeral Mass",
      type: "checkbox",
      onChange: setFuneralMass,
      value: funeralMass,
    },
    {
      key: "funeral_blessing",
      title: "Funeral Blessing",
      type: "checkbox",
      onChange: setFuneralBlessing,
      value: funeralBlessing,
    },
    {
      key: "tomb_blessing",
      title: "Tomb Blessing",
      type: "checkbox",
      onChange: setTombBlessing,
      value: tombBlessing,
    },
  ];

  const [deathCertificateFile, setDeathCertificateFile] = useState(null);
  const [deathCertificatePreview, setDeathCertificatePreview] = useState(null);

  const [deceasedBaptismalFile, setDeceasedBaptismalFile] = useState(null);
  const [deceasedBaptismalPreview, setDeceasedBaptismalPreview] =
    useState(null);

  const uploadFiles = [
    {
      key: "death_cert",
      title: "Death Certificate",
      fileSetter: setDeathCertificateFile,
      preview: deathCertificatePreview,
      previewSetter: setDeathCertificatePreview,
    },
    {
      key: "deceased_baptismal_cert",
      title: "Deceased Baptismal Certificate",
      fileSetter: setDeceasedBaptismalFile,
      preview: deceasedBaptismalPreview,
      previewSetter: setDeceasedBaptismalPreview,
    },
  ];
  async function uploadImage(file, namePrefix) {
    const ext = file.name.split(".").pop();
    const fileName = `${namePrefix}_${Date.now()}.${ext}`;
    const filePath = `burial/${fileName}`;

    const { error } = await supabase.storage
      .from("burial")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload Error:", error);
      throw error;
    }

    const { data } = supabase.storage.from("burial").getPublicUrl(filePath);
    return data.publicUrl;
  }
  function generateTransactionID() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `BUR-${timestamp}-${random}`;
  }

  async function handleSubmit() {
    if (!validate()) {
      setShowModalMessage(true);
      setModalMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const isValidPHNumber = /^09\d{9}$/.test(contactNumber);

      if (!isValidPHNumber) {
        setShowModalMessage(true);
        setModalMessage(
          "Please enter a valid contact number (e.g. 09XXXXXXXXX)",
        );
        setIsLoading(false);
        return;
      }
      const uploaded = {};

      if (deathCertificateFile) {
        uploaded.deathCert = await uploadImage(
          deathCertificateFile,
          "death_cert",
        );
      }
      if (deceasedBaptismalFile) {
        uploaded.deceasedBaptismal = await uploadImage(
          deceasedBaptismalFile,
          "deceased_baptismal",
        );
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
        deceased_name: `${deceasedFname} ${deceasedMname} ${deceasedLname}`,
        deceased_age: deceasedAge,
        deceased_civil_status: deceasedCivilStatus,
        relationship_to_deceased: relationship,
        requested_by: `${fname} ${mname} ${lname}`,
        address: address,
        place_of_mass: placeOfMass,
        mass_address: massAddress,
        death_anniversary: deathAnniv,
        funeral_mass: funeralMass,
        funeral_blessing: funeralBlessing,
        tomb_blessing: tombBlessing,
        death_certificate: uploaded.deathCert || "",
        deceased_baptismal: uploaded.deceasedBaptismal || "",
      };

      const res = await axios.post(`${API_URL}/createBurialWeb`, payload);

      setShowModalMessage(true);
      setModalMessage("Burial booking submitted successfully!");
      setIsLoading(false);

      navigate("/");
      console.log("Saved:", res.data);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setIsLoading(false);

      setShowModalMessage(true);
      setModalMessage("Failed to submit confession booking");
    }
  }

  const requesterInputs = inputText.filter((i) =>
    [
      "first_name",
      "middle_name",
      "last_name",
      "email",
      "contact_number",
      "address",
    ].includes(i.key),
  );
  const scheduleInputs = inputText.filter((i) =>
    ["date", "time", "attendees"].includes(i.key),
  );
  const deceasedInputs = inputText.filter(
    (i) => i.key.includes("deceased") || i.key === "relationship_to_deceased",
  );
  const massInputs = inputText.filter(
    (i) => i.key.includes("mass") || i.key.includes("place"),
  );

  return (
    <div className="main-holder">
      <div className="form-wrapper">
        {/* SECTION 1: REQUESTER INFORMATION */}
        <div className="form-section">
          <h2 className="section-title">1. Requester Information</h2>
          <div className="grid-layout">
            {requesterInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type={elem.type}
                  className={`input-text ${errors[elem.key] ? "input-error" : ""}`}
                  value={elem.value}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    if (errors[elem.key]) {
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }
                  }}
                  readOnly={elem.readOnly}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: DECEASED DETAILS */}
        <div className="form-section">
          <h2 className="section-title">2. Deceased Information</h2>
          <div className="grid-layout">
            {deceasedInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type={elem.type}
                  className={`input-text ${errors[elem.key] ? "input-error" : ""}`}
                  value={elem.value}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    if (errors[elem.key]) {
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: SCHEDULE & SERVICES */}
        <div className="form-section">
          <h2 className="section-title">3. Schedule & Service Type</h2>
          <div className="grid-layout" style={{ marginBottom: "20px" }}>
            {scheduleInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                {elem.type === "date" ? (
                  <DatePicker
                    selected={date ? new Date(date) : null}
                    onChange={(v) => {
                      setDate(v ? v.toISOString() : "");
                      if (errors.date)
                        setErrors((prev) => ({ ...prev, date: false }));
                    }}
                    className={`input-text ${errors.date ? "input-error" : ""}`}
                    dateFormat="yyyy-MM-dd"
                    showYearDropdown
                    dropdownMode="select"
                    minDate={today}
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
                    value={elem.value}
                    onChange={(e) => {
                      elem.onChange(e.target.value);
                      if (errors[elem.key]) {
                        setErrors((prev) => ({ ...prev, [elem.key]: false }));
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div
            className="checkbox-container"
            style={{
              background: "#f9f9f9",
              padding: "15px",
              borderRadius: "8px",
              border: `2px solid ${checkboxError ? "red" : "#000"}`,
            }}
          >
            <h1
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "10px",
                color: "#424242",
              }}
            >
              Type of Service Requested:
            </h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {checkboxes.map((elem) => (
                <label
                  key={elem.key}
                  className="flex items-center gap-2 cursor-pointer"
                  style={{ fontSize: "0.9rem" }}
                >
                  <input
                    type="checkbox"
                    style={{ accentColor: "#FFC942" }}
                    checked={elem.value}
                    onChange={(e) => {
                      elem.onChange(e.target.checked);

                      if (e.target.checked) setCheckboxError(false);
                      else if (
                        !deathAnniv &&
                        !funeralMass &&
                        !funeralBlessing &&
                        !tombBlessing
                      )
                        setCheckboxError(true);
                    }}
                  />
                  <span>{elem.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: MASS LOCATION */}
        <div className="form-section">
          <h2 className="section-title">4. Mass Location Details</h2>
          <div className="grid-layout">
            {massInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type="text"
                  className={`input-text ${errors[elem.key] ? "input-error" : ""}`}
                  value={elem.value}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    if (errors[elem.key]) {
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: DOCUMENTATION */}
        <div className="form-section">
          <h2 className="section-title">5. Required Documents</h2>
          <div className="upload-grid">
            {uploadFiles.map((elem) => (
              <div key={elem.key} className="per-grid-container">
                <h1
                  style={{
                    fontSize: "0.85rem",
                    marginBottom: "10px",
                    color: "#424242",
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

                    if (file.type === "application/pdf") {
                      elem.previewSetter(pdf_image);
                    } else {
                      elem.previewSetter(URL.createObjectURL(file));
                    }

                    if (errors[elem.key]) {
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }
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
            disabled={isLoading}
          >
            {isLoading ? "Submitting" : "Confirm & Book Burial Service"}
          </button>
        </div>
      </div>
      {showModalMessage && (
        <Modal message={modalMessage} setShowModal={setShowModalMessage} />
      )}
    </div>
  );
}
