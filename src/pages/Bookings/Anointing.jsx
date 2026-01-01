import { useContext, useEffect, useRef, useState } from "react";
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


export default function Anointing() {
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
  const [medicalCondition, setMedicalCondition] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      maxLength: 11,
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

  async function handleSubmit() {
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
        contactNumber.trim() === "" ||
        medicalCondition.trim() === ""
      ) {
        alert("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }
      if (
        contactNumber.trim().length !== 11 ||
        !contactNumber.startsWith("09")
      ) {
        alert("Please enter a valid contact number.");
        setIsLoading(false);
        return;
      }

      if (medicalCertificateFile) {
        uploaded.medical_certificate = await uploadImage(
          medicalCertificateFile,
          "medical_certificate"
        );
      } else {
        alert("Please upload medical certificate.");
        setIsLoading(false);
        return;
      }
      const payload = {
        uid: "123123123",
        full_name: `${fname} ${mname} ${lname}`,
        transaction_id: generateTransactionID(),
        email: email,
        date: date,
        time: time,
        attendees: attendees,
        contact_number: contactNumber,
        medical_condition: medicalCondition,
        medical_certificate: uploaded.medical_certificate,
      };

      const res = await axios.post(`${API_URL}/createAnointing`, payload);
      alert("Anointing booking submitted successfully!");
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
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Failed to submit confession booking");
      setIsLoading(false);
      
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
                    maxLength={elem.maxLength}
                  />
                </>
              )}
            </div>
          ))}
          {uploadFiles.map((elem) => (
            <div key={elem.key} className="per-grid-container">
              <div>
                <h1>{elem.title}</h1>

                <input
                  ref={fileInputRef}
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
            {isLoading ? `Submitting...` : `Submit Booking`}
          </button>
        </div>
      </div>
    </>
  );
}
