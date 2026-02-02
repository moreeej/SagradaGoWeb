import { useContext, useRef, useState } from "react";
import "../../styles/booking/wedding.css";
import { supabase } from "../../config/supabase";
import axios from "axios";
import { API_URL } from "../../Constants";
import { NavbarContext } from "../../context/AllContext";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import Modal from "../../components/Modal";
import pdf_image from "../../assets/pdfImage.svg";



export default function Baptism() {
  const navigate = useNavigate();

  const { setSelectedNavbar } = useContext(NavbarContext);

  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  const inputClass = (key) => `input-text ${errors[key] ? "input-error" : ""}`;

  const fileInputClass = (key) =>
    `inputFile-properties ${fileErrors[key] ? "input-error" : ""}`;

  const [isLoading, setIsLoading] = useState(false);

  const [fullname, setFullname] = useState(Cookies.get("fullname") || "");
  const [email, setEmail] = useState(Cookies.get("email") || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [candidateFname, setCandidateFname] = useState("");
  const [candidateMname, setCandidateMname] = useState("");
  const [candidateLname, setCandidateLname] = useState("");
  const [candidateBday, setCandidateBday] = useState("");
  const [candidateBplace, setCandidateBplace] = useState("");

  const [contact, setContact] = useState(Cookies.get("contact") || "");
  const [attendees, setAttendees] = useState(0);
  const [address, setAddress] = useState("");

  const [showModalMessage, setShowModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState();

  const uid = Cookies.get("uid");
  const fileInputRefs = useRef([]);

  const today = new Date();
today.setHours(0, 0, 0, 0);

const aWeekAfter = new Date(today);
aWeekAfter.setDate(aWeekAfter.getDate() + 7);


  const inputText = [
    {
      key: "fullname",
      title: "Requester Full Name",
      type: "text",
      onChange: setFullname,
      value: fullname,
      readOnly: true,
    },
    {
      key: "email",
      title: "Requester Email",
      type: "email",
      onChange: setEmail,
      value: email,
      disabled: true,
    },
    {
      key: "time",
      title: "Time",
      type: "time",
      onChange: setTime,
      value: time,
    },
    {
      key: "date",
      title: "Date",
      type: "date",
      onChange: setDate,
      value: date,
      minDate: aWeekAfter,
      openToDate: aWeekAfter,
    },
    {
      key: "candidate_fname",
      title: "Candidate First Name",
      type: "text",
      onChange: setCandidateFname,
      value: candidateFname,
    },

    {
      key: "candidate_mname",
      title: "Candidate Middle Name",
      type: "text",
      onChange: setCandidateMname,
      value: candidateMname,
    },
    {
      key: "candidate_lname",
      title: "Candidate Last Name",
      type: "text",
      onChange: setCandidateLname,
      value: candidateLname,
    },
    {
      key: "candidate_bday",
      title: "Candidate Birth Date",
      type: "date",
      onChange: setCandidateBday,
      value: candidateBday,
      maxDate: today,
      openToDate: today,
    },
    {
      key: "candidate_bplace",
      title: "Candidate Birth Place",
      type: "text",
      onChange: setCandidateBplace,
      value: candidateBplace,
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
    {
      key: "address",
      title: "Address",
      type: "text",
      onChange: setAddress,
      value: address,
    },
  ];

  const [motherFname, setMotherFname] = useState("");
  const [motherMname, setMotherMname] = useState("");
  const [motherLname, setMotherLname] = useState("");
  const [motherBirthPlace, setMotherBirthPlace] = useState("");
  const [fatherFname, setFatherFname] = useState("");
  const [fatherMname, setFatherMname] = useState("");
  const [fatherLname, setFatherLname] = useState("");
  const [fatherBirthPlace, setFatherBirthPlace] = useState("");

  const [marriageType, setMarriageType] = useState("");

  const inputText2 = [
    {
      key: "mother_fname",
      title: "Mother First Name",
      type: "text",
      onChange: setMotherFname,
      value: motherFname,
    },

    {
      key: "mother_mname",
      title: "Mother Middle Name",
      type: "text",
      onChange: setMotherMname,
      value: motherMname,
    },
    {
      key: "mother_lname",
      title: "Mother Last Name",
      type: "text",
      onChange: setMotherLname,
      value: motherLname,
    },

    {
      key: "mother_bplace",
      title: "Mother Birth Place",
      type: "text",
      onChange: setMotherBirthPlace,
      value: motherBirthPlace,
    },
    {
      key: "father_fname",
      title: "Father First Name",
      type: "text",
      onChange: setFatherFname,
      value: fatherFname,
    },

    {
      key: "father_mname",
      title: "Father Middle Name",
      type: "text",
      onChange: setFatherMname,
      value: fatherMname,
    },
    {
      key: "father_lname",
      title: "Father Last Name",
      type: "text",
      onChange: setFatherLname,
      value: fatherLname,
    },
    {
      key: "father_bplace",
      title: "Father Birth Place",
      type: "text",
      onChange: setFatherBirthPlace,
      value: fatherBirthPlace,
    },
  ];

  const [mainGodFatherFname, setMainGodFatherFname] = useState("");
  const [mainGodFatherMname, setMainGodFatherMname] = useState("");
  const [mainGodFatherLname, setMainGodFatherLname] = useState("");
  const [mainGodMotherFname, setMainGodMotherFname] = useState("");
  const [mainGodMotherMname, setMainGodMotherMname] = useState("");
  const [mainGodMotherLname, setMainGodMotherLname] = useState("");

  const inputGodParents = [
    {
      key: "main_godfather_fname",
      title: "Main Godfather First Name",
      type: "text",
      onChange: setMainGodFatherFname,
      value: mainGodFatherFname,
    },
    {
      key: "main_godfather_mname",
      title: "Main Godfather Middle Name",
      type: "text",
      onChange: setMainGodFatherMname,
      value: mainGodFatherMname,
    },
    {
      key: "main_godfather_lname",
      title: "Main Godfather Last Name",
      type: "text",
      onChange: setMainGodFatherLname,
      value: mainGodFatherLname,
    },
    {
      key: "main_godmother_fname",
      title: "Main Godmother First Name",
      type: "text",
      onChange: setMainGodMotherFname,
      value: mainGodMotherFname,
    },
    {
      key: "main_godmother_mname",
      title: "Main Godmother Middle Name",
      type: "text",
      onChange: setMainGodMotherMname,
      value: mainGodMotherMname,
    },
    {
      key: "main_godmother_lname",
      title: "Main Godmother Last Name",
      type: "text",
      onChange: setMainGodMotherLname,
      value: mainGodMotherLname,
    },
  ];

  const [additionalGodParents, setAdditionalGodParents] = useState([]);
  const [godParentName, setGodParentName] = useState("");

  const addGodParent = () => {
    if (godParentName.trim() === "") return;

    setAdditionalGodParents((prev) => [...prev, godParentName]);
    setGodParentName("");
    console.log(additionalGodParents);
  };

  const [birthCertificateFile, setBirthCertificateFile] = useState("");
  const [birthCertificatePreview, setBirthCertificatePreview] = useState("");

  const [marriageCertFile, setMarriageCertFile] = useState("");
  const [marriageCertPreview, setMarriageCertPreview] = useState("");

  const [godparentConfirmationFile, setGodparentConfirmationFile] =
    useState("");
  const [godparentConfirmationPreview, setGodparentConfirmationPreview] =
    useState("");

  const [baptismalSeminarFile, setBaptismalSeminarFile] = useState("");
  const [baptismalSeminarPreview, setBaptismalSeminarPreview] = useState("");

  const birthCertRef = useRef(null);
  const parentMarriageCert = useRef(null);
  const godParentConf = useRef(null);
  const baptismalSeminar = useRef(null);

  const uploadFiles = [
    {
      key: "birthcert",
      title: "Birth Certificate",
      fileSetter: setBirthCertificateFile,
      preview: birthCertificatePreview,
      previewSetter: setBirthCertificatePreview,
      ref: birthCertRef,
    },
    {
      key: "parent_marriagecert",
      title: "Parents Marriage Certificate",
      fileSetter: setMarriageCertFile,
      preview: marriageCertPreview,
      previewSetter: setMarriageCertPreview,
      ref: parentMarriageCert,
    },
    {
      key: "godparent_confirmation",
      title: "God Parent Confirmation",
      fileSetter: setGodparentConfirmationFile,
      preview: godparentConfirmationPreview,
      previewSetter: setGodparentConfirmationPreview,
      ref: godParentConf,
    },
    {
      key: "baptismal_seminar",
      title: "Baptismal Seminar",
      fileSetter: setBaptismalSeminarFile,
      preview: baptismalSeminarPreview,
      previewSetter: setBaptismalSeminarPreview,
      ref: baptismalSeminar,
    },
  ];

  async function uploadImage(file, namePrefix) {
    const ext = file.name.split(".").pop();
    const fileName = `${namePrefix}_${Date.now()}.${ext}`;
    const filePath = `baptismal/${fileName}`;

    const { error } = await supabase.storage
      .from("baptismal")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload Error:", error);
      throw error;
    }

    const { data } = supabase.storage.from("baptismal").getPublicUrl(filePath);
    return data.publicUrl;
  }

  function generateTransactionID() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `BP-${timestamp}-${random}`;
  }

  function resetAllFiles() {
    Object.values(fileInputRefs.current).forEach((input) => {
      if (input) input.value = "";
    });

    setBirthCertificateFile("");
    setMarriageCertFile("");
    setGodparentConfirmationFile("");
    setBaptismalSeminarFile("");

    setBirthCertificatePreview("");
    setMarriageCertPreview("");
    setGodparentConfirmationPreview("");
    setBaptismalSeminarPreview("");

    setFullname("");
    setEmail("");
    setDate("");
    setTime("");
    setCandidateFname("");
    setCandidateMname("");
    setCandidateLname("");
    setCandidateBday("");
    setCandidateBplace("");
    setContact("");
    setAttendees(0);
    setAddress("");

    setMotherFname("");
    setMotherMname("");
    setMotherLname("");
    setMotherBirthPlace("");
    setFatherFname("");
    setFatherMname("");
    setFatherLname("");
    setFatherBirthPlace("");
    setMarriageType("");

    setMainGodFatherFname("");
    setMainGodFatherMname("");
    setMainGodFatherLname("");
    setMainGodMotherFname("");
    setMainGodMotherMname("");
    setMainGodMotherLname("");
    setAdditionalGodParents([]);
    if (birthCertRef.current) birthCertRef.current.value = "";
    if (parentMarriageCert.current) parentMarriageCert.current.value = "";
    if (godParentConf.current) godParentConf.current.value = "";
    if (baptismalSeminar.current) baptismalSeminar.current.value = "";
  }

    const handleModalClose = () => {
      setShowModalMessage(false);
      setSelectedNavbar("Home")
      navigate("/");
    };

  async function handleUpload() {
    const newErrors = {};
    const newFileErrors = {};

    if (!fullname.trim()) newErrors.fullname = true;
    if (!email.trim()) newErrors.email = true;
    if (!date) newErrors.date = true;
    if (!time) newErrors.time = true;

    if (!candidateFname.trim()) newErrors.candidate_fname = true;
    if (!candidateMname.trim()) newErrors.candidate_mname = true;
    if (!candidateLname.trim()) newErrors.candidate_lname = true;
    if (!candidateBday) newErrors.candidate_bday = true;
    if (!candidateBplace.trim()) newErrors.candidate_bplace = true;

    if (!/^09\d{9}$/.test(contact)) newErrors.contact_number = true;
    if (attendees <= 0) newErrors.attendees = true;
    if (!address.trim()) newErrors.address = true;

    if (!motherFname.trim()) newErrors.mother_fname = true;

    if (!motherLname.trim()) newErrors.mother_lname = true;
    if (!motherBirthPlace.trim()) newErrors.mother_bplace = true;

    if (!fatherFname.trim()) newErrors.father_fname = true;

    if (!fatherLname.trim()) newErrors.father_lname = true;
    if (!fatherBirthPlace.trim()) newErrors.father_bplace = true;

    if (!marriageType) newErrors.marriage_type = true;

    if (!mainGodFatherFname.trim()) newErrors.main_godfather_fname = true;

    if (!mainGodFatherLname.trim()) newErrors.main_godfather_lname = true;
    if (!mainGodMotherFname.trim()) newErrors.main_godmother_fname = true;

    if (!mainGodMotherLname.trim()) newErrors.main_godmother_lname = true;

    if (additionalGodParents.length === 0)
      newErrors.additional_godparents = true;

    if (!birthCertificateFile) newFileErrors.birthcert = true;
    if (!marriageCertFile) newFileErrors.parent_marriagecert = true;
    if (!godparentConfirmationFile) newFileErrors.godparent_confirmation = true;
    if (!baptismalSeminarFile) newFileErrors.baptismal_seminar = true;

    setErrors(newErrors);
    setFileErrors(newFileErrors);

    if (
      Object.keys(newErrors).length > 0 ||
      Object.keys(newFileErrors).length > 0
    ) {
      setShowModalMessage(true);
      setModalMessage("Please complete all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      const isValidPHNumber = /^09\d{9}$/.test(contact);

      if (!isValidPHNumber) {
        setShowModalMessage(true);
        setModalMessage(
          "Please enter a valid contact number (e.g. 09XXXXXXXXX)",
        );
        setIsLoading(false);
        return;
      }

      if (
        fullname.trim() === "" ||
        email.trim() === "" ||
        date.trim() === "" ||
        time.trim() === "" ||
        candidateFname.trim() === "" ||
        candidateLname.trim() === "" ||
        candidateBday.trim() === "" ||
        candidateBplace.trim() === "" ||
        contact.trim() === "" ||
        attendees <= 0 ||
        address.trim() === "" ||
        motherFname.trim() === "" ||
        motherLname.trim() === "" ||
        motherBirthPlace.trim() === "" ||
        fatherFname.trim() === "" ||
        fatherLname.trim() === "" ||
        fatherBirthPlace.trim() === "" ||
        marriageType.trim() === "" ||
        mainGodFatherFname.trim() === "" ||
        mainGodFatherLname.trim() === "" ||
        mainGodMotherFname.trim() === "" ||
        mainGodMotherLname.trim() === "" ||
        additionalGodParents.length === 0
      ) {
        setShowModalMessage(true);
        setModalMessage("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      const uploaded = {};

      if (birthCertificateFile) {
        uploaded.birth_certificate = await uploadImage(
          birthCertificateFile,
          "birth_certificate",
        );
      } else {
        setShowModalMessage(true);
        setModalMessage("Please upload files.");
        setIsLoading(false);
        return;
      }

      if (marriageCertFile) {
        uploaded.parents_marriage_certificate = await uploadImage(
          marriageCertFile,
          "parents_marriage_certificate",
        );
      } else {
        setShowModalMessage(true);
        setModalMessage("Please upload files.");
        setIsLoading(false);
        return;
      }

      if (godparentConfirmationFile) {
        uploaded.godparent_confirmation = await uploadImage(
          godparentConfirmationFile,
          "godparent_confirmation",
        );
      } else {
        setShowModalMessage(true);
        setModalMessage("Please upload files.");
        setIsLoading(false);
        return;
      }

      if (baptismalSeminarFile) {
        uploaded.baptismal_seminar = await uploadImage(
          baptismalSeminarFile,
          "baptismal_seminar",
        );
      } else {
        setShowModalMessage(true);
        setModalMessage("Please upload files.");
        setIsLoading(false);
        return;
      }

      const payload = {
        uid: uid,
        transaction_id: generateTransactionID(),

        fullname,
        email,
        date,
        time,
        attendees,
        contact_number: contact,
        address,

        candidate_first_name: candidateFname,
        candidate_middle_name: candidateMname,
        candidate_last_name: candidateLname,
        candidate_birthday: candidateBday,
        candidate_birth_place: candidateBplace,

        mother_first_name: motherFname,
        mother_middle_name: motherMname,
        mother_last_name: motherLname,
        mother_birth_place: motherBirthPlace,

        father_first_name: fatherFname,
        father_middle_name: fatherMname,
        father_last_name: fatherLname,
        father_birth_place: fatherBirthPlace,

        marriage_type: marriageType,

        main_godfather_first_name: mainGodFatherFname,
        main_godfather_middle_name: mainGodFatherMname,
        main_godfather_last_name: mainGodFatherLname,

        main_godmother_first_name: mainGodMotherFname,
        main_godmother_middle_name: mainGodMotherMname,
        main_godmother_last_name: mainGodMotherLname,

        additional_godparents: additionalGodParents,

        ...uploaded,
      };

      const res = await axios.post(`${API_URL}/addBaptismalWeb`, payload);

      
      console.log("Saved:", res.data);
      setIsLoading(false);

      setShowModalMessage(true);
      setModalMessage("Baptismal booking submitted successfully!");
      resetAllFiles();

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setShowModalMessage(true);
      setModalMessage("Failed to submit baptismal booking");
      setIsLoading(false);
    }
  }

  return (
    <div className="main-holder">
      <div className="form-wrapper">
        {/* SECTION 1: EVENT LOGISTICS */}
        <div className="form-section">
          <h2 className="section-title">1. Schedule Details</h2>
          <div className="grid-layout">
            {inputText.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                {elem.type === "date" ? (
                  <DatePicker
                    selected={elem.value ? new Date(elem.value) : null}
                    onChange={(v) => {
                      elem.onChange(v ? v.toISOString() : "");
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }}
                    className={inputClass(elem.key)}
                    dateFormat="yyyy-MM-dd"
                    minDate={elem.minDate}
                    maxDate={elem.maxDate}
                    openToDate={elem.openToDate}
                    showYearDropdown
                    dropdownMode="select"
                    onKeyDown={(e) => e.preventDefault()}
                  />
                ) : elem.type === "time" ? (
                  <div className="time-container">
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
                            InputProps: {
                              disableUnderline: true,
                              className: inputClass("time"),
                            },
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
                    readOnly={elem.readOnly}
                    maxLength={elem.maxLength}
                    onChange={(e) => {
                      elem.onChange(e.target.value);
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: PERSONAL & FAMILY DETAILS */}
        <div className="form-section">
          <h2 className="section-title">2. Family Information</h2>
          <div className="grid-layout" style={{ marginBottom: "20px" }}>
            {inputText2.map((elem) => (
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
                />
              </div>
            ))}

            <div className="input-group">
              <h1>Parents Marriage Type</h1>
              <select
                value={marriageType}
                onChange={(e) => {
                  setMarriageType(e.target.value);
                  setErrors((prev) => ({ ...prev, marriage_type: false }));
                }}
                className={inputClass("marriage_type")}
              >
                <option value="" disabled hidden>
                  Select marriage type
                </option>
                <option value="Catholic">Catholic</option>
                <option value="Civil">Civil</option>
                <option value="Natural">Natural</option>
                <option value="Not married">Not married</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: GODPARENTS */}
        <div className="form-section">
          <h2 className="section-title">3. Godparents</h2>
          <div className="grid-layout">
            {inputGodParents.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type="text"
                  className={inputClass(elem.key)}
                  value={elem.value}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    setErrors((prev) => ({ ...prev, [elem.key]: false }));
                  }}
                />
              </div>
            ))}

            <div className="input-group">
              <h1>Additional Godparent</h1>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className={inputClass("additional_godparents")}
                  value={godParentName}
                  onChange={(e) => {
                    setGodParentName(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      additional_godparents: false,
                    }));
                  }}
                  placeholder="Enter full name"
                />

                <button
                  type="button"
                  onClick={addGodParent}
                  className="add-btn"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* <div className="godparent-list">
        
        </div> */}
        </div>

        {/* SECTION 4: DOCUMENT UPLOADS */}
        <div className="form-section">
          <h2 className="section-title">4. Required Documents</h2>
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
                  className={fileInputClass(elem.key)}
                  ref={(el) => (fileInputRefs.current[elem.key] = el)}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    elem.fileSetter(file);

                    if (file.type === "application/pdf") {
                      elem.previewSetter(pdf_image);
                    } else {
                      elem.previewSetter(URL.createObjectURL(file));
                    }

                    setFileErrors((prev) => ({
                      ...prev,
                      [elem.key]: false,
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

        {/* SUBMIT SECTION */}
        <div className="submit-btn-container">
          <button
            className="submit-button"
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Booking"}
          </button>
        </div>
      </div>
      {showModalMessage && (
        <Modal message={modalMessage} setShowModal={setShowModalMessage} onOk={handleModalClose} />
      )}
    </div>
  );
}
