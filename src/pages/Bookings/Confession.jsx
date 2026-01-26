import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../Constants";
import { useNavigate } from "react-router-dom";
import "../../styles/booking/wedding.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Cookies from "js-cookie";

import Modal from "../../components/Modal";

export default function Confession() {
  const [fname, setFname] = useState("");
  const [mname, setMname] = useState("");
  const [lname, setLname] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [attendees, setAttendees] = useState(0);
  const [email, setEmail] = useState(Cookies.get("email") || "");

  const [showModalMessage, setShowModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState();

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const uid = Cookies.get("uid");

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
  ];

  async function handleSubmit() {
    const newErrors = {};

    if (!fname.trim()) newErrors.first_name = true;
    if (!mname.trim()) newErrors.middle_name = true;
    if (!lname.trim()) newErrors.last_name = true;

    if (!date) newErrors.date = true;
    if (!time) newErrors.time = true;
    if (attendees <= 0) newErrors.attendees = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShowModalMessage(true);
      setModalMessage("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        uid: uid,
        full_name: `${fname} ${mname} ${lname}`,
        email: email,
        date: date,
        time: time,
        attendees: attendees,
      };

      const res = await axios.post(`${API_URL}/createConfession`, payload);

      setShowModalMessage(true);
      setModalMessage("Confession booking submitted successfully!");
      console.log("Saved:", res.data);

      setFname("");
      setMname("");
      setLname("");
      setEmail("");
      setDate("");
      setTime("");
      setAttendees(0);

      navigate("/");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      setShowModalMessage(true);
      setModalMessage("Failed to submit confession booking");
    }
  }

  const penitentInputs = inputText.filter((i) =>
    ["first_name", "middle_name", "last_name", "email"].includes(i.key),
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
        {/* SECTION 1: PENITENT INFORMATION */}
        <div className="form-section">
          <h2 className="section-title">1. Penitent Information</h2>
          <div className="grid-layout">
            {penitentInputs.map((elem) => (
              <div className="input-group" key={elem.key}>
                <h1>{elem.title}</h1>
                <input
                  type={elem.type}
                  className={`input-text ${errors[elem.key] ? "input-error" : ""}`}
                  onChange={(e) => {
                    elem.onChange(e.target.value);
                    if (errors[elem.key]) {
                      setErrors((prev) => ({ ...prev, [elem.key]: false }));
                    }
                  }}
                  value={elem.value}
                  placeholder={`Enter ${elem.title.toLowerCase()}`}
                  readOnly={elem.readOnly}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: APPOINTMENT SCHEDULE */}
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
                    minDate={tomorrow}
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select date"
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
                      if (errors[elem.key]) {
                        setErrors((prev) => ({ ...prev, [elem.key]: false }));
                      }
                    }}
                    value={elem.value}
                  />
                )}
              </div>
            ))}
          </div>
        </div>


        <div className="submit-btn-container" style={{ marginTop: "30px" }}>
          <button className="submit-button" onClick={handleSubmit}>
            Confirm Confession Schedule
          </button>
        </div>
      </div>
      {showModalMessage && (
        <Modal message={modalMessage} setShowModal={setShowModalMessage} />
      )}
    </div>
  );
}
