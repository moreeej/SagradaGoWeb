import { useContext, useEffect, useRef, useState } from "react";
import { NavbarContext } from "../../context/AllContext";
import "../../styles/booking/wedding.css";
import default_profile from "../../assets/no-image.jpg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import no_image from "../../assets/blank-image.jpg";
import { supabase } from "../../config/supabase";
import axios from "axios";
import { API_URL } from "../../Constants";

export default function Baptism() {
  const { currentUser, bookingSelected, setBookingSelected } =
    useContext(NavbarContext);

  // TO BE DELETE
  const occupiedDates = [
    new Date("2025-11-27"),
    new Date("2025-11-28"),
    new Date("2025-11-29"),
    new Date("2025-11-30"),
    new Date("2025-12-04"),
  ];

  //-------------------

  const [isLoading, setIsLoading] = useState(false);

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [candidateFname, setCandidateFname] = useState("");
  const [candidateMname, setCandidateMname] = useState("");
  const [candidateLname, setCandidateLname] = useState("");
  const [candidateBday, setCandidateBday] = useState("");
  const [candidateBplace, setCandidateBplace] = useState("");

  const [contact, setContact] = useState("");
  const [attendees, setAttendees] = useState(0);
  const [address, setAddress] = useState("");

  const inputText = [
    {
      key: "fullname",
      title: "Requester Full Name",
      type: "text",
      onChange: setFullname,
      value: fullname,
    },
    {
      key: "email",
      title: "Requester Email",
      type: "email",
      onChange: setEmail,
      value: email,
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
      onChange: setContact,
      value: contact,
      maxLength: 11,
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

  async function handleUpload() {
    setIsLoading(true)
    try {

        if(
          fullname.trim() === "" ||
          email.trim() === "" ||
          date.trim() === "" ||
          time.trim() === "" ||
          candidateFname.trim() === "" ||
          candidateMname.trim() === "" ||
          candidateLname.trim() === "" ||
          candidateBday.trim() === "" ||
          candidateBplace.trim() === "" ||
          contact.trim() === "" ||
          attendees <= 0 ||
          address.trim() === "" ||
          motherFname.trim() === "" ||
          motherMname.trim() === "" ||
          motherLname.trim() === "" ||
          motherBirthPlace.trim() === "" ||
          fatherFname.trim() === "" ||
          fatherMname.trim() === "" ||
          fatherLname.trim() === "" ||
          fatherBirthPlace.trim() === "" ||
          marriageType.trim() === "" ||
          mainGodFatherFname.trim() === "" ||
          mainGodFatherMname.trim() === "" ||
          mainGodFatherLname.trim() === "" ||
          mainGodMotherFname.trim() === "" ||
          mainGodMotherMname.trim() === "" ||
          mainGodMotherLname.trim() === "" ||
          additionalGodParents.length === 0
        ) {
            alert("Please fill in all required fields.");
            setIsLoading(false);
          return;
        }



      const uploaded = {};

      if (birthCertificateFile) {
        uploaded.birth_certificate = await uploadImage(
          birthCertificateFile,
          "birth_certificate"
        );
      }
      else{
        alert("Please upload files.");
        setIsLoading(false);
        return;
      }

      if (marriageCertFile) {
        uploaded.parents_marriage_certificate = await uploadImage(
          marriageCertFile,
          "parents_marriage_certificate"
        );
      }
            else{
        alert("Please upload files.");
        setIsLoading(false);
        return;
      }

      if (godparentConfirmationFile) {
        uploaded.godparent_confirmation = await uploadImage(
          godparentConfirmationFile,
          "godparent_confirmation"
        );
      }
            else{
        alert("Please upload files.");
        setIsLoading(false);
        return;
      }

      if (baptismalSeminarFile) {
        uploaded.baptismal_seminar = await uploadImage(
          baptismalSeminarFile,
          "baptismal_seminar"
        );
      }
            else{
        alert("Please upload files.");
        setIsLoading(false);
        return;
      }

      const payload = {
        uid: "123123123",
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

      console.log("payload", payload);

      const res = await axios.post(`${API_URL}/addBaptismalWeb`, payload);

      alert("Baptismal booking submitted successfully!");
      console.log("Saved:", res.data);
      setIsLoading(false)


      setFullname("")
      setEmail("")
      setDate("")
      setTime("")
      setCandidateFname("")
      setCandidateMname("")
      setCandidateLname("")
      setCandidateBday("")
      setCandidateBplace("")
      setContact("")
      setAttendees(0)
      setAddress("")

      setMotherFname("")
      setMotherMname("")
      setMotherLname("")
      setMotherBirthPlace("")
      setFatherFname("")
      setFatherMname("")
      setFatherLname("")
      setFatherBirthPlace("")
      setMarriageType("")

      setMainGodFatherFname("")
      setMainGodFatherMname("")
      setMainGodFatherLname("")
      setMainGodMotherFname("")
      setMainGodMotherMname("")
      setMainGodMotherLname("")
      setAdditionalGodParents([])
      birthCertRef.current.value = "";
      parentMarriageCert.current.value = "";
      godParentConf.current.value = "";
      baptismalSeminar.current.value = "";

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Failed to submit baptismal booking");
      setIsLoading(false)
    }
  }

  return (
    <div className="main-holder">
      <div className="form-container">
        {inputText.map((elem) => (
          <div className="flex flex-col" key={elem.key}>
            <h1>{elem.title}</h1>

            {elem.type === "date" ? (
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
      </div>

      <div className="form-container">
        {inputText2.map((elem) => (
          <div className="flex flex-col" key={elem.key}>
            <h1>{elem.title}</h1>

            {elem.type === "date" ? (
              <>
                <DatePicker
                  selected={date ? new Date(date) : null}
                  onChange={(v) => setDate(v ? v.toISOString() : "")}
                  className="input-text"
                  dateFormat="yyyy-MM-dd"
                  excludeDates={occupiedDates}
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
        <div className="flex flex-col gap-3">
          <h1>Parents Marriage Type</h1>
          <select
            value={marriageType}
            onChange={(e) => setMarriageType(e.target.value)}
            className="border border-black"
          >
            <option value="" disabled hidden>
              Select the type of marriage
            </option>
            <option value="Catholic">Catholic</option>
            <option value="Civil">Civil</option>
            <option value="Natural">Natural</option>
            <option value="Not married">Not married</option>
          </select>

        </div>
      </div>
      <div className="form-container">
        {inputGodParents.map((elem) => (
          <div className="flex flex-col" key={elem.key}>
            <h1>{elem.title}</h1>

            {elem.type === "date" ? (
              <>
                <DatePicker
                  selected={date ? new Date(date) : null}
                  onChange={(v) => setDate(v ? v.toISOString() : "")}
                  className="input-text"
                  dateFormat="yyyy-MM-dd"
                  excludeDates={occupiedDates}
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

        <div className="flex gap-2">
          <input
            type="text"
            className="input-text"
            value={godParentName}
            onChange={(e) => setGodParentName(e.target.value)}
            placeholder="Godparent name"
          />

          <button
            type="button"
            onClick={addGodParent}
            className="px-4 py-2 bg-red-400"
          >
            Add Additional Godparent
          </button>
        </div>
      </div>

      <div className="form-container">
        {uploadFiles.map((elem) => (
          <div key={elem.key} className="per-grid-container">
            <div>
              <h1>{elem.title}</h1>

              <input
                ref={elem.ref}
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
      <div className="w-full flex justify-center">
        <button className="submit-button" onClick={handleUpload}>
          {isLoading ? `Submitting...` : `Submit Booking`}
        </button>
      </div>
    </div>
  );
}
