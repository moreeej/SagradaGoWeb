import { useContext, useEffect, useState } from "react";
import { NavbarContext } from "../../context/AllContext";
import "../../styles/booking/wedding.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { supabase } from "../../config/supabase";
import axios from "axios";
import { API_URL } from "../../Constants";

export default function Communion() {
  // TO BE DELETE
  const occupiedDates = [
    new Date("2025-11-27"),
    new Date("2025-11-28"),
    new Date("2025-11-29"),
    new Date("2025-11-30"),
    new Date("2025-12-04"),
  ];

  const [fname, setFname] = useState("");
  const [mname, setMname] = useState("");
  const [lname, setLname] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [attendees, setAttendees] = useState(0);
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");

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

  async function handleSubmit() {
    try {
      const uploaded = {};

      if (baptismalCertificateFile) {
        uploaded.baptismalCert = await uploadImage(
          baptismalCertificateFile,
          "baptismal_cert"
        );
        if(communionPreparationFile){
          uploaded.communionPrep = await uploadImage(
            communionPreparationFile,
            "communion_prep"
          );
        }
        if (parentConsentFile) {
          uploaded.parentConsent = await uploadImage(
            parentConsentFile,
            "parent_consent"
          );
        }
      }

      const payload = {
        uid: "123123123",
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
      alert("Communion booking submitted successfully!");
      console.log("Saved:", res.data);

      setFname("");
      setMname("");
      setLname("");
      setEmail("");
      setDate("");
      setTime("");
      setAttendees(0);
      setContactNumber("");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Failed to submit confession booking");
    }
  }

  return (
    <>
      <div className="main-holder">
        <div className="form-container">
          {inputText.map((elem) => (
            <div className="flex flex-col" key={elem.key}>
              <h1>{elem.title}</h1>

              {elem.type === "date" ? (
                <>
                  <DatePicker
                    selected={elem.value ? new Date(elem.value) : null}
                    onChange={(v) => elem.onChange(v ? v.toISOString() : "")}
                    className="input-text"
                    dateFormat="yyyy-MM-dd"
                    excludeDates={occupiedDates}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    minDate={new Date(1900, 0, 1)}
                  />
                </>
              ) : elem.type === "time" ? (
                <div className="time-container">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MobileTimePicker
                      value={time ? dayjs(`2000-01-01 ${time}`) : null}
                      onChange={(v) => {
                        setTime(v ? dayjs(v).format("HH:mm") : "");
                      }}
                      slotProps={{
                        textField: {
                          className: "time-slot-props",
                          InputProps: {
                            sx: {
                              padding: 0,
                              height: "100%",
                              "& fieldset": { border: "none" },
                            },
                          },
                          sx: {
                            padding: 0,
                            margin: 0,
                            height: "100%",
                            "& .MuiInputBase-root": {
                              height: "100%",
                              padding: 0,
                            },
                            "& .MuiInputBase-input": {
                              height: "100%",
                              padding: 0,
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              ) : (
                <>
                  <input
                    name={elem.key}
                    type={elem.type}
                    className="input-text"
                    onChange={(e) => elem.onChange(e.target.value)}
                    value={elem.value}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        <div className="form-container">
          {uploadFiles.map((elem) => (
            <div key={elem.key} className="per-grid-container">
              <div>
                <h1>{elem.title}</h1>

                <input
                  type="file"
                  accept="*/*"
                  className="inputFile-properties"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    elem.fileSetter(file);
                    elem.previewSetter({
                      url: URL.createObjectURL(file),
                      type: file.type,
                      name: file.name,
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
