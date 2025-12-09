import { useContext, useState } from "react";
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

export default function Wedding() {
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

  const [groomFname, setGroomFname] = useState("");
  const [groomMname, setGroomMname] = useState("");
  const [groomLname, setGroomLname] = useState("");
  const [brideFname, setBrideFname] = useState("");
  const [brideMname, setBrideMname] = useState("");
  const [brideLname, setBrideLname] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [contact, setContact] = useState("");
  const [attendees, setAttendees] = useState(0);


  // const [groomBaptismal, setGroomBaptismal] = useState("");
  // const [brideBaptismal, setBrideBaptismal] = useState("");
  // const [groomConfirmation, setGroomConfirmation] = useState("");
  // const [brideConfirmation, setBrideConfirmation] = useState("");
  // const [groomCenomar, setGroomCenomar] = useState("");
  // const [brideCenomar, setBrideCenomar] = useState("");
  // const [groomPermission, setGroomPermission] = useState("");
  // const [bridePermission, setBridePermission] = useState("");
  // const [marriageDocu, setMarriageDocu] = useState("");

  // const [isCivil, setIsCivil] = useState("");
  // const civil_choices = [
  //   { text: "Yes", value: "yes" },
  //   { text: "No", value: "no" },
  // ];

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
    { key: "date", title: "Date", type: "date", onChange: setDate },

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
      key: "contact_number",
      title: "Contact Number",
      type: "text",
      onChange: setContact,
      value: contact,
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

  const [groomPhoto, setGroomPhoto] = useState("");
  const [bridePhoto, setBridePhoto] = useState("");



  async function uploadImage(file, namePrefix, setter) {
    const ext = file.name.split(".").pop();
    const fileName = `${namePrefix}_${Date.now()}.${ext}`;
    const filePath = `wedding/${fileName}`;

    const { error } = await supabase.storage
      .from("wedding")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload Error:", error);
      alert("Upload failed.");
      return;
    }

    const {data} = supabase.storage.from("wedding").getPublicUrl(filePath);
    console.log("data", data);
    
    setter(data.publicUrl);
  }



  async function handleUpload() {
    if (!groomFile && !brideFile) {
      alert("Please select files first.");
      return;
    }

    if (groomFile) {
      await uploadImage(groomFile, `groom_photo`, setGroomPhoto);
    }

    if (brideFile) {
      await uploadImage(brideFile, `bride_photo`, setBridePhoto);
    }

    alert("Upload success!");
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





  












  const uploadBaptismal = [
    {
      key: "groom_baptismal",
      title: "Groom Baptismal Certificate Photo",


    },
    {
      key: "bride_baptismal",
      title: "Bride Baptismal Certificate Photo",


    },
  ];

  const uploadConfirmation = [
    {
      key: "groom_confirmation",
      title: "Groom Confirmation Certificate Photo",
    },
    {
      key: "bride_confirmation",
      title: "Bride Confirmation Certificate Photo",
    },
  ];

  const uploadCenomar = [
    { key: "groom_cenomar", title: "Groom CENOMAR Photo" },
    { key: "bride_cenomar", title: "Bride CENOMAR Photo" },
  ];

  const uploadPermission = [
    { key: "groom_permission", title: "Groom Permission Photo" },
    { key: "bride_permission", title: "Bride Permission Photo" },
  ];

  const [form, setForm] = useState({
    // uid: currentUser?.uid || "",
    date: date,
    time: time,
    attendees: attendees,
    contact_number: contact,
    groom_first: groomFname,
    groom_middle: groomMname,
    groom_last: groomLname,
    bride_first: brideFname,
    bride_middle: brideMname,
    bride_last: brideLname,
    groom_1x1: groomPhoto,
    bride_1x1: bridePhoto,
    // marriage_docu: marriageDocu,
    // groom_baptismal_cert: groomBaptismal,
    // bride_baptismal_cert: brideBaptismal,
    // groom_confirmation_cert: groomConfirmation,
    // bride_confirmation_cert: brideConfirmation,
    // groom_cenomar: groomCenomar,
    // bride_cenomar: brideCenomar,
    // groom_permission: groomPermission,
    // bride_permission: bridePermission,
  });








 




  // async function handleSubmit() {



  //   setBookingSelected(bookingSelected);

  //   const dateOnly = date.split("T")[0];
  //   setForm({
  //     // uid: currentUser?.uid || "",
  //     date: dateOnly,
  //     time: time,
  //     attendees: attendees,
  //     contact_number: contact,
  //     groom_first: groomFname,
  //     groom_middle: groomMname,
  //     groom_last: groomLname,
  //     bride_first: brideFname,
  //     bride_middle: brideMname,
  //     bride_last: brideLname,
  //     groom_1x1: groomPhoto,
  //     bride_1x1: bridePhoto,
  //     // marriage_docu: marriageDocu,
  //     // groom_baptismal_cert: groomBaptismal,
  //     // bride_baptismal_cert: brideBaptismal,
  //     // groom_confirmation_cert: groomConfirmation,
  //     // bride_confirmation_cert: brideConfirmation,
  //     // groom_cenomar: groomCenomar,
  //     // bride_cenomar: brideCenomar,
  //     // groom_permission: groomPermission,
  //     // bride_permission: bridePermission,
  //   });
  //   console.log("forms:", form);
  // }




  

  return (
    <div className="form-container">
      
      {inputText.map((elem) => (
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

              <h1>{elem.value}</h1>
            </>
          )}
        </div>
      ))}

       {uploadProfileImage.map((elem) => (
        <div key={elem.key} style={{ marginBottom: "20px" }}>
          <h1>{elem.title}</h1>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              elem.fileSetter(file);

              if (file) {
                elem.previewSetter(URL.createObjectURL(file));
              }
            }}
          />

          {elem.preview && (
            <div>
              <h3>Preview:</h3>
              <img src={elem.preview} alt="Preview" width={200} />
            </div>
          )}

        </div>
      ))}
{/* 
      {uploadBaptismal.map((elem) => (
        <div className="grid grid-cols-[3fr_1fr]" key={elem.key}>
          <div>
            <label className="block text-sm font-medium mb-1">
              {elem.title}
            </label>

            <input
              type="file"
              accept="image/*"
              name={elem.key}
              onChange={(e) => elem.onChange(e.target.files[0])}
            />
          </div>
          <img
            src={elem.preview ? elem.preview : no_image}
            alt="no-profile"
            className="w-15"
          />
        </div>
      ))}

      {uploadConfirmation.map((elem) => (
        <div className="grid grid-cols-[3fr_1fr]" key={elem.key}>
          <div>
            <label className="block text-sm font-medium mb-1">
              {elem.title}
            </label>

            <input
              type="file"
              accept="image/*"
              name={elem.key}
              // onChange={handleFileChange}
            />
          </div>
        </div>
      ))} */}

      {/* {uploadCenomar.map((elem) => (
        <div className="grid grid-cols-[3fr_1fr]" key={elem.key}>
          <div>
            <label className="block text-sm font-medium mb-1">
              {elem.title}
            </label>

            <input
              type="file"
              accept="image/*"
              name={elem.key}
              // onChange={handleFileChange}
            />
          </div>
        </div>
      ))}

      {uploadPermission.map((elem) => (
        <div className="grid grid-cols-[3fr_1fr]" key={elem.key}>
          <div>
            <label className="block text-sm font-medium mb-1">
              {elem.title}
            </label>

            <input
              type="file"
              accept="image/*"
              name={elem.key}
              // onChange={handleFileChange}
            />
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-2">
        <p>Are you civilly married?</p>

        <div className="flex w-auto gap-10">
          {civil_choices.map((elem) => (
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="civil"
                value={elem.value}
                onChange={() => setIsCivil(elem.text)}
              />
              <span>{elem.text}</span>
            </div>
          ))}
        </div>

        {isCivil === "" ? (
          <></>
        ) : isCivil === "Yes" ? (
          <div className="w-full flex items-center justify-between">
            <input type="file" />
            <p className="w-full">Upload Marriage Contract</p>
          </div>
        ) : (
          <div className="flex items-center">
            <input type="file" />
            <p>Upload Marriage License</p>
          </div>
        )}
      </div> */}

      <input
        type="submit"
        value="Submit"
        className="bg-blue-400 px-6 py-3"
        onClick={handleUpload}
      />
    </div>
  );
}
