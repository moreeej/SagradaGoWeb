import { useContext, useEffect, useRef, useState } from "react";
import "../../styles/booking/wedding.css";
import { API_URL } from "../../Constants";
import { supabase } from "../../config/supabase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NavbarContext } from "../../context/AllContext";


import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { addDays } from "date-fns";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Cookies from "js-cookie";

import Modal from "../../components/Modal";
import pdf_image from "../../assets/pdfImage.svg";


export default function Wedding() {
  const navigate = useNavigate();

  const { setSelectedNavbar } = useContext(NavbarContext);

  const [groomFname, setGroomFname] = useState("");
  const [groomMname, setGroomMname] = useState("");
  const [groomLname, setGroomLname] = useState("");
  const [brideFname, setBrideFname] = useState("");
  const [brideMname, setBrideMname] = useState("");
  const [brideLname, setBrideLname] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [contact, setContact] = useState(Cookies.get("contact"));
  const [attendees, setAttendees] = useState(0);
  const [email, setEmail] = useState(Cookies.get("email"));
  const [isLoading, setIsLoading] = useState(false);

  const [showModalMessage, setShowModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState();

  const [bookComplete, setBookComplete] = useState(false);

  const fileInputRefs = useRef([]);
  const [fileErrors, setFileErrors] = useState({});
  const fileInputClass = (key) =>
    `inputFile-properties ${fileErrors[key] ? "input-error" : ""}`;

  const uid = Cookies.get("uid");

  const [errors, setErrors] = useState({});
  const inputClass = (key) => `input-text ${errors[key] ? "input-error" : ""}`;

  const inputText = [
    {
      key: "groom_first",
      title: "Groom First Name",
      type: "text",
      onChange: setGroomFname,
      value: groomFname,
    },
    {
      key: "groom_middle",
      title: "Groom Middle Name",
      type: "text",
      onChange: setGroomMname,
      value: groomMname,
    },
    {
      key: "groom_last",
      title: "Groom Last Name",
      type: "text",
      onChange: setGroomLname,
      value: groomLname,
    },
    {
      key: "date",
      title: "Date",
      type: "date",
      onChange: setDate,
      value: date,
    },

    {
      key: "bride_first",
      title: "Bride First Name",
      type: "text",
      onChange: setBrideFname,
      value: brideFname,
    },
    {
      key: "bride_middle",
      title: "Bride Middle Name",
      type: "text",
      onChange: setBrideMname,
      value: brideMname,
    },
    {
      key: "bride_last",
      title: "Bride Last Name",
      type: "text",
      onChange: setBrideLname,
      value: brideLname,
    },
    {
      key: "time",
      title: "Time",
      type: "time",
      onChange: setTime,
      value: time,
    },

    {
      key: "email",
      title: "Email",
      type: "email",
      onChange: setEmail,
      value: email,
      disabled: true,
    },

    {
      key: "contact_number",
      title: "Contact Number",
      type: "text",
      onChange: (value) => setContact(value.replace(/\D/g, "")),
      value: contact,
      maxLength: 11,
      readOnly: true,
    },
    {
      key: "attendees",
      title: "Attendees",
      type: "number",
      onChange: setAttendees,
      value: attendees,
    },
  ];

  const [groomFile, setGroomFile] = useState(null);
  const [brideFile, setBrideFile] = useState(null);

  const [groomPreview, setGroomPreview] = useState("");
  const [bridePreview, setBridePreview] = useState("");

  async function uploadImage(file, namePrefix) {
    const ext = file.name.split(".").pop();
    const fileName = `${namePrefix}_${Date.now()}.${ext}`;
    const filePath = `wedding/${fileName}`;

    const { error } = await supabase.storage
      .from("wedding")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload Error:", error);
      throw error;
    }

    const { data } = supabase.storage.from("wedding").getPublicUrl(filePath);
    return data.publicUrl;
  }

  const uploadProfileImage = [
    {
      key: "groom_1x1",
      title: "Groom Photo",
      fileSetter: setGroomFile,
      preview: groomPreview,
      previewSetter: setGroomPreview,
    },
    {
      key: "bride_1x1",
      title: "Bride Photo",
      fileSetter: setBrideFile,
      preview: bridePreview,
      previewSetter: setBridePreview,
    },
  ];

  const [groomBapFile, setGroomBapFile] = useState(null);
  const [brideBapFile, setBrideBapFile] = useState(null);

  const [groomBapPreview, setGroomBapPreview] = useState("");
  const [brideBapPreview, setBrideBapPreview] = useState("");

  const uploadBaptismal = [
    {
      key: "groom_baptismal_cert",
      title: "Groom Baptismal Certificate",
      fileSetter: setGroomBapFile,
      preview: groomBapPreview,
      previewSetter: setGroomBapPreview,
    },
    {
      key: "bride_baptismal_cert",
      title: "Bride Baptismal Certificate",
      fileSetter: setBrideBapFile,
      preview: brideBapPreview,
      previewSetter: setBrideBapPreview,
    },
  ];

  const [groomConfFile, setGroomConfFile] = useState(null);
  const [brideConfFile, setBrideConfFile] = useState(null);

  const [groomConfPreview, setGroomConfPreview] = useState("");
  const [brideConfPreview, setBrideConfPreview] = useState("");

  const uploadConfirmation = [
    {
      key: "groom_confirmation_cert",
      title: "Groom Confirmation Certificate",
      fileSetter: setGroomConfFile,
      preview: groomConfPreview,
      previewSetter: setGroomConfPreview,
    },
    {
      key: "bride_confirmation_cert",
      title: "Bride Confirmation Certificate",
      fileSetter: setBrideConfFile,
      preview: brideConfPreview,
      previewSetter: setBrideConfPreview,
    },
  ];

  const [groomCenomarFile, setGroomCenomarFile] = useState(null);
  const [brideCenomarFile, setBrideCenomarFile] = useState(null);

  const [groomCenomarPreview, setGroomCenomarPreview] = useState("");
  const [brideCenomarPreview, setBrideCenomarPreview] = useState("");

  const uploadCenomar = [
    {
      key: "groom_cenomar",
      title: "Groom CENOMAR",
      fileSetter: setGroomCenomarFile,
      preview: groomCenomarPreview,
      previewSetter: setGroomCenomarPreview,
    },
    {
      key: "bride_cenomar",
      title: "Bride CENOMAR",
      fileSetter: setBrideCenomarFile,
      preview: brideCenomarPreview,
      previewSetter: setBrideCenomarPreview,
    },
  ];

  const [groomPermFile, setGroomPermFile] = useState(null);
  const [bridePermFile, setBridePermFile] = useState(null);

  const [groomPermPreview, setGroomPermPreview] = useState("");
  const [bridePermPreview, setBridePermPreview] = useState("");

  const uploadPermission = [
    {
      key: "groom_permission",
      title: "Groom Permission",
      fileSetter: setGroomPermFile,
      preview: groomPermPreview,
      previewSetter: setGroomPermPreview,
    },
    {
      key: "bride_permission",
      title: "Bride Permission",
      fileSetter: setBridePermFile,
      preview: bridePermPreview,
      previewSetter: setBridePermPreview,
    },
  ];

  const [marriageDocuFile, setMarriageDocuFile] = useState(null);
  const [marriagePreview, setMarriagePreview] = useState("");

  const uploadMarriageDocu = [
    {
      key: "marriage_docu",
      title: "Marriage Document",
      fileSetter: setMarriageDocuFile,
      preview: marriagePreview,
      previewSetter: setMarriagePreview,
    },
  ];

  const [isCivil, setIsCivil] = useState("");
  const civil_choices = [
    { text: "Yes", value: "yes" },
    { text: "No", value: "no" },
  ];

  function generateTransactionID() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `WD-${timestamp}-${random}`;
  }

  function validateForm() {
    const textErrors = {};
    const fileErrors = {};

    if (!date) textErrors.date = true;
    if (!time) textErrors.time = true;
    if (!email) textErrors.email = true;

    if (!/^09\d{9}$/.test(contact)) textErrors.contact_number = true;
    if (attendees <= 0) textErrors.attendees = true;

    if (!groomFname.trim()) textErrors.groom_first = true;
    if (!groomLname.trim()) textErrors.groom_last = true;

    if (!brideFname.trim()) textErrors.bride_first = true;
    if (!brideLname.trim()) textErrors.bride_last = true;

    if (!isCivil) textErrors.civil = true;

    if (!groomFile) fileErrors.groom_1x1 = true;
    if (!groomBapFile) fileErrors.groom_baptismal = true;
    if (!groomConfFile) fileErrors.groom_confirmation = true;
    if (!groomCenomarFile) fileErrors.groom_cenomar = true;
    if (!groomPermFile) fileErrors.groom_permission = true;

    if (!brideFile) fileErrors.bride_1x1 = true;
    if (!brideBapFile) fileErrors.bride_baptismal = true;
    if (!brideConfFile) fileErrors.bride_confirmation = true;
    if (!brideCenomarFile) fileErrors.bride_cenomar = true;
    if (!bridePermFile) fileErrors.bride_permission = true;

    if (isCivil === "Yes" && !marriageDocuFile) {
      fileErrors.marriage_docu = true;
    }

    return { textErrors, fileErrors };
  }

  function resetAllFiles() {
    Object.values(fileInputRefs.current).forEach((input) => {
      if (input) input.value = "";
    });

    setGroomFile(null);
    setBrideFile(null);
    setGroomBapFile(null);
    setBrideBapFile(null);
    setGroomConfFile(null);
    setBrideConfFile(null);
    setGroomCenomarFile(null);
    setBrideCenomarFile(null);
    setGroomPermFile(null);
    setBridePermFile(null);
    setMarriageDocuFile(null);

    setGroomPreview("");
    setBridePreview("");
    setGroomBapPreview("");
    setBrideBapPreview("");
    setGroomConfPreview("");
    setBrideConfPreview("");
    setGroomCenomarPreview("");
    setBrideCenomarPreview("");
    setGroomPermPreview("");
    setBridePermPreview("");
    setMarriagePreview("");

    setIsCivil("");

    setEmail("");
    setDate("");
    setTime("");
    setAttendees(0);
    setContact("");
    setGroomFname("");
    setGroomMname("");
    setGroomLname("");
    setBrideFname("");
    setBrideMname("");
    setBrideLname("");

    setErrors({});
    setFileErrors({});
  }

  const handleModalClose = () => {
    setShowModalMessage(false);
    setSelectedNavbar("Home")
    navigate("/");
  };


  async function handleUpload() {
    const { textErrors, fileErrors } = validateForm();

    setErrors(textErrors);
    setFileErrors(fileErrors);

    if (
      Object.keys(textErrors).length > 0 ||
      Object.keys(fileErrors).length > 0
    ) {
      setShowModalMessage(true);
      setModalMessage("Please complete all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const uploaded = {};

      const uploadIfExists = async (file, key) => {
        if (!file) return;
        uploaded[key] = await uploadImage(file, key);
      };

      await uploadIfExists(groomFile, "groom_photo");
      await uploadIfExists(brideFile, "bride_photo");
      await uploadIfExists(groomBapFile, "groom_baptismal_cert");
      await uploadIfExists(brideBapFile, "bride_baptismal_cert");
      await uploadIfExists(groomConfFile, "groom_confirmation_cert");
      await uploadIfExists(brideConfFile, "bride_confirmation_cert");
      await uploadIfExists(groomCenomarFile, "groom_cenomar");
      await uploadIfExists(brideCenomarFile, "bride_cenomar");
      await uploadIfExists(groomPermFile, "groom_permission");
      await uploadIfExists(bridePermFile, "bride_permission");
      await uploadIfExists(marriageDocuFile, "marriage_docu");


      

      await axios.post(`${API_URL}/createWeddingBooking`, {
        uid,
        email,
        transaction_id: generateTransactionID(),
        date,
        time,
        attendees,
        contact_number: contact,

        groom_first_name: groomFname,
        groom_middle_name: groomMname,
        groom_last_name: groomLname,
        groom_pic: uploaded.groom_photo,

        bride_first_name: brideFname,
        bride_middle_name: brideMname,
        bride_last_name: brideLname,
        bride_pic: uploaded.bride_photo,

        ...uploaded,
      });
      setBookComplete(true);
      setShowModalMessage(true);
      setModalMessage("Booking submitted successfully!");

      resetAllFiles();

      
    } catch (err) {
      console.error(err);
      setModalMessage("Something went wrong during upload.");
      setShowModalMessage(true);
    } finally {
      setIsLoading(false);
    }
  }

  const groomNames = inputText.filter((i) => i.key.includes("groom"));
  const brideNames = inputText.filter((i) => i.key.includes("bride"));
  const scheduleInputs = inputText.filter((i) =>
    ["date", "time", "email", "contact_number", "attendees"].includes(i.key),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstAvailableDate = addDays(today, 61);
  const [disabledDates, setDisabledDates] = useState([]);

  useEffect(() => {
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const dates = [];

    for (let i = 0; i <= 60; i++) {
      dates.push(addDays(baseDate, i));
    }

    setDisabledDates(dates);
  }, []);

  return (
    <div className="main-holder">
      <div className="form-wrapper">
        <div className="form-section">
          <h2 className="section-title">1. Schedule & Logistics</h2>
          <div className="grid-layout">
            {scheduleInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                {elem.type === "date" ? (
                  <DatePicker
                    selected={elem.value ? new Date(elem.value) : null}
                    onChange={(v) => {
                      elem.onChange(v ? v.toISOString() : "");
                      setErrors((prev) => ({ ...prev, date: false }));
                    }}
                    className={inputClass("date")}
                    dateFormat="yyyy-MM-dd"
                    excludeDates={disabledDates}
                    minDate={today}
                    openToDate={firstAvailableDate}
                    showYearDropdown
                    dropdownMode="select"
                    onKeyDown={(e) => e.preventDefault()}
                  />
                ) : elem.type === "time" ? (
                  <div
                    className={`time-container ${
                      errors.time ? "input-error" : ""
                    }`}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <MobileTimePicker
                        value={time ? dayjs(`2000-01-01 ${time}`) : null}
                        onChange={(v) => {
                          setTime(v ? dayjs(v).format("HH:mm") : "");
                          setErrors((prev) => ({ ...prev, time: false }));
                        }}
                        slotProps={{
                          textField: {
                            variant: "standard",
                            fullWidth: true,
                            InputProps: { disableUnderline: true },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                ) : (
                  <input
                    type={elem.type}
                    className={inputClass(elem.key)}
                    value={elem.value}
                    onChange={(e) => {
                      if (elem.key === "contact_number") {
                        const value = e.target.value.replace(/\D/g, "");
                        elem.onChange(value);

                        const isValid = /^09\d{9}$/.test(value);
                        setErrors((prev) => ({
                          ...prev,
                          contact_number: !isValid,
                        }));
                      } else {
                        elem.onChange(e.target.value);
                        setErrors((prev) => ({ ...prev, [elem.key]: false }));
                      }
                    }}
                    maxLength={elem.maxLength}
                    disabled={elem.disabled}
                    readOnly={elem.readOnly}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">2. Groom's Information</h2>
          <div className="grid-layout" style={{ marginBottom: "25px" }}>
            {groomNames.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type={elem.type}
                  className={inputClass(elem.key)}
                  value={elem.value}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    setErrors((prev) => ({ ...prev, [elem.key]: false }));
                  }}
                  maxLength={elem.maxLength}
                  disabled={elem.disabled}
                />
              </div>
            ))}
          </div>
          <div className="upload-grid">
            {[
              uploadProfileImage[0],
              uploadBaptismal[0],
              uploadConfirmation[0],
              uploadCenomar[0],
              uploadPermission[0],
            ].map((elem) => (
              <div key={elem.key} className="per-grid-container">
                <h1>{elem.title}</h1>
                <input
                  type="file"
                  className={fileInputClass(elem.key)}
                  accept="image/*,application/pdf"
                  ref={(el) => (fileInputRefs.current[elem.key] = el)}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    elem.fileSetter(file);

                    if (file) {
                      setFileErrors((prev) => ({
                        ...prev,
                        [elem.key]: false,
                      }));

                      if (file.type === "application/pdf") {
                        elem.previewSetter(pdf_image);
                      } else {
                        elem.previewSetter(URL.createObjectURL(file));
                      }
                    }
                  }}
                />
                {elem.preview && (
                  <img
                    src={elem.preview.url || elem.preview}
                    className="image-preview"
                    alt="preview"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">3. Bride's Information</h2>
          <div className="grid-layout" style={{ marginBottom: "25px" }}>
            {brideNames.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type={elem.type}
                  className={inputClass(elem.key)}
                  value={elem.value}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    setErrors((prev) => ({ ...prev, [elem.key]: false }));
                  }}
                  maxLength={elem.maxLength}
                  disabled={elem.disabled}
                />
              </div>
            ))}
          </div>
          <div className="upload-grid">
            {[
              uploadProfileImage[1],
              uploadBaptismal[1],
              uploadConfirmation[1],
              uploadCenomar[1],
              uploadPermission[1],
            ].map((elem) => (
              <div key={elem.key} className="per-grid-container">
                <h1>{elem.title}</h1>
                <input
                  type="file"
                  className={fileInputClass(elem.key)}
                  accept="image/*,application/pdf"
                  ref={(el) => (fileInputRefs.current[elem.key] = el)}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    elem.fileSetter(file);

                    if (file) {
                      setFileErrors((prev) => ({
                        ...prev,
                        [elem.key]: false,
                      }));

                      if (file.type === "application/pdf") {
                        elem.previewSetter(pdf_image);
                      } else {
                        elem.previewSetter(URL.createObjectURL(file));
                      }
                    }
                  }}
                />
                {elem.preview && (
                  <img
                    src={elem.preview.url || elem.preview}
                    className="image-preview"
                    alt="preview"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">4. Legal Status</h2>
          <div className={`choice-box ${errors.civil ? "input-error" : ""}`}>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              Are you civilly married?
            </p>
            <div className="radio-group">
              {civil_choices.map((elem) => (
                <label className="radio-item" key={elem.value}>
                  <input
                    type="radio"
                    name="civil"
                    value={elem.text}
                    checked={isCivil === elem.text}
                    onChange={() => {
                      setIsCivil(elem.text);
                      setErrors((prev) => ({ ...prev, civil: false }));
                    }}
                  />
                  <span>{elem.text}</span>
                </label>
              ))}
            </div>
          </div>

          {isCivil && (
            <div className="per-grid-container" style={{ marginTop: "20px" }}>
              <h1 style={{ fontSize: "0.9rem", marginBottom: "10px" }}>
                Upload{" "}
                {isCivil === "Yes" ? "Marriage Contract" : "Marriage License"}
              </h1>

              <input
                type="file"
                accept="image/*,application/pdf"
                className={fileInputClass("marriage_docu")}
                ref={(el) => (fileInputRefs.current["marriage_docu"] = el)}
                onChange={(e) => {
                  const file = e.target.files[0];
                  uploadMarriageDocu[0].fileSetter(file);

                  if (file) {
                    setFileErrors((prev) => ({
                      ...prev,
                      marriage_docu: false,
                    }));

                    uploadMarriageDocu[0].previewSetter(
                      file.type === "application/pdf"
                        ? pdf_image
                        : URL.createObjectURL(file),
                    );
                  }
                }}
              />

              {uploadMarriageDocu[0].preview && (
                <img
                  src={uploadMarriageDocu[0].preview}
                  className="image-preview"
                  alt="preview"
                  style={{ marginTop: "10px", maxWidth: "200px" }}
                />
              )}
            </div>
          )}
        </div>

        <div className="submit-btn-container">
          <button
            className="submit-button"
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm & Book Wedding"}
          </button>
        </div>
      </div>

      {showModalMessage && (
        <Modal 
          message={modalMessage} 
          setShowModal={setShowModalMessage} 
          onOk={handleModalClose}
          bookComplete={bookComplete}
        />
      )}
    </div>
  );
}
