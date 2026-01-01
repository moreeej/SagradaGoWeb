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

export default function Burial() {
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
       key:"address", 
       title:"Address", 
       type:"text", 
       onChange:setAddress, 
       value : address
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
    }
  ]

  const [deathCertificateFile, setDeathCertificateFile] =
    useState(null);
  const [deathCertificatePreview, setDeathCertificatePreview] =
    useState(null);

  const [deceasedBaptismalFile, setDeceasedBaptismalFile] =
    useState(null);
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
    try {
      const uploaded = {};

      if (deathCertificateFile) {
        uploaded.deathCert = await uploadImage(
          deathCertificateFile,
          "death_cert"
        );
    }
    if(deceasedBaptismalFile){
          uploaded.deceasedBaptismal = await uploadImage(
            deceasedBaptismalFile,
            "deceased_baptismal"
          );
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
      alert("Burial booking submitted successfully!");
      console.log("Saved:", res.data);


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
          <div>
            {
            checkboxes.map((elem) => (
                <label
                    key={elem.key}
                    className="flex items-center gap-2 cursor-pointer"
                    >
                    <input
                        type="checkbox"
                        checked={elem.value}
                        onChange={(e) => elem.onChange(e.target.checked)}
                    />
                    <span>{elem.title}</span>
                    </label>
            ))
          }
          </div>
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
