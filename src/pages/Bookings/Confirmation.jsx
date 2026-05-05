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


export default function Confirmation() {
    const navigate = useNavigate();

    const { setSelectedNavbar, setTotalAmount } = useContext(NavbarContext);


    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [attendees, setAttendees] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [showModalMessage, setShowModalMessage] = useState(false);
    const [modalMessage, setModalMessage] = useState();

    const [bookComplete, setBookComplete] = useState(false);

    const fileInputRefs = useRef([]);
    const [fileErrors, setFileErrors] = useState({});
    const fileInputClass = (key) =>
        `inputFile-properties ${fileErrors[key] ? "input-error" : ""}`;

    const uid = Cookies.get("uid");
    const email = Cookies.get("email");
    const contact_num = Cookies.get("contact_number");
    const fullname = Cookies.get("fullname");

    const [errors, setErrors] = useState({});
    const inputClass = (key) => `input-text ${errors[key] ? "input-error" : ""}`;

    const getMinimumBookingDate = (sacrament) => {
        const today = dayjs();

        switch (sacrament) {
            case "Baptism":
            case "Wedding":
                return today.add(2, "month").toDate();
            case "Burial":
                return today.add(1, "week").toDate();
            case "First Communion":
            case "Confession":
            case "Anointing":
            case "Confirmation":
                return today.add(1, "day").toDate();
            default:
                return today.toDate();
        }
    };

    const inputText = [

        {
            key: "date",
            title: "Date",
            type: "date",
            onChange: setDate,
            value: date,
            minDate: getMinimumBookingDate("Confirmation"),
            openToDate: getMinimumBookingDate("Confirmation"),
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

    const [bapCertFile, setBapCertFile] = useState(null);
    const [bapCertPreview, setBapCertPreview] = useState("");

    const [firstCommFile, setFirstCommFile] = useState(null);
    const [firstCommPreview, setFirstCommPreview] = useState("");

    const [confirmationPrepCompFile, setConfirmationPrepCompFile] = useState(null);
    const [confirmationPrepCompPreview, setConfirmationPrepCompPreview] = useState("");

    const [sponsorConfCertFile, setSponsorConfCertFile] = useState(null);
    const [sponsorConfCertPreview, setSponsorConfCertPreview] = useState("");

    const requiredFiles = [
        {
            key: "baptismal_cert",
            title: "Baptismal Certificate",
            fileSetter: setBapCertFile,
            preview: bapCertPreview,
            previewSetter: setBapCertPreview,
        },
        {
            key: "first_communion_cert",
            title: "First Communion Certificate",
            fileSetter: setFirstCommFile,
            preview: firstCommPreview,
            previewSetter: setFirstCommPreview,
        },
        {
            key: "confirmation_preparation_completion",
            title: "Confirmation Preparation Completion",
            fileSetter: setConfirmationPrepCompFile,
            preview: confirmationPrepCompPreview,
            previewSetter: setConfirmationPrepCompPreview,
        },
        {
            key: "sponsor_confirmation_certificate",
            title: "Sponsor Confirmation Certificate",
            fileSetter: setSponsorConfCertFile,
            preview: sponsorConfCertPreview,
            previewSetter: setSponsorConfCertPreview,
        },
    ];









    function generateTransactionID() {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        return `Confirm-${timestamp}-${random}`;
    }



    function validateForm() {
        const textErrors = {};
        const fileErrors = {};

        if (!date) textErrors.date = true;
        if (!time) textErrors.time = true;
        if (attendees <= 0) textErrors.attendees = true;




        if (!bapCertFile) fileErrors.baptismal_cert = true;
        if (!firstCommFile) fileErrors.first_communion_cert = true;
        if (!confirmationPrepCompFile) fileErrors.confirmation_preparation_completion = true;
        if (!sponsorConfCertFile) fileErrors.sponsor_confirmation_certificate = true;


        return { textErrors, fileErrors };
    }

    function resetAllFiles() {
        Object.values(fileInputRefs.current).forEach((input) => {
            if (input) input.value = "";
        });

        setBapCertFile(null);
        setFirstCommFile(null);
        setConfirmationPrepCompFile(null);
        setSponsorConfCertFile(null);
        setBapCertPreview("");
        setFirstCommPreview("");
        setConfirmationPrepCompPreview("");
        setSponsorConfCertPreview("");

        setDate("");
        setTime("");
        setAttendees(0);

        setErrors({});
        setFileErrors({});
    }



    const handleModalClose = () => {
        setShowModalMessage(false);

        if (bookComplete) {
            navigate("/payment-method");
        }
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
        const formData = new FormData();

        // TEXT FIELDS
        formData.append("uid", uid);
        formData.append("date", date);
        formData.append("time", time);
        formData.append("attendees", attendees);
        formData.append("contact_number", contact_num);

        // ADD THESE (backend expects them)
        formData.append("sponsor_name", "N/A"); // or add input field if needed
        formData.append("payment_method", "in_person");
        formData.append("amount", 1500);

        // FILES (MUST MATCH BACKEND FIELD NAMES)
        formData.append("baptismal_certificate", bapCertFile);
        formData.append("first_communion_certificate", firstCommFile);
        formData.append("confirmation_preparation", confirmationPrepCompFile);
        formData.append("sponsor_certificate", sponsorConfCertFile);

        await axios.post(`${API_URL}/createConfirmation`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        setBookComplete(true);
        setShowModalMessage(true);
        setModalMessage("Booking submitted successfully!");
        setTotalAmount(1500);

        resetAllFiles();

    } catch (err) {
        console.error(err);
        setModalMessage("Something went wrong during upload.");
        setShowModalMessage(true);
    } finally {
        setIsLoading(false);
    }
}


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
                        {inputText.map((elem) => (
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
                                        minDate={getMinimumBookingDate("Confirmation")}
                                        openToDate={firstAvailableDate}
                                        showYearDropdown
                                        dropdownMode="select"
                                        onKeyDown={(e) => e.preventDefault()}
                                    />
                                ) : elem.type === "time" ? (
                                    <div
                                        className={`time-container ${errors.time ? "input-error" : ""
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
                    <h2 className="section-title">2. Required Documents</h2>

                    <div className="upload-grid">
                        {requiredFiles.map((elem) => (
                            <div key={elem.key} className="per-grid-container">
                                <h1>{elem.title}</h1>

                                <input
                                    type="file"
                                    className={fileInputClass(elem.key)}
                                    accept="image/*,application/pdf"
                                    ref={(el) => (fileInputRefs.current[elem.key] = el)}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        elem.fileSetter(file);
                                        setFileErrors((prev) => ({ ...prev, [elem.key]: false }));

                                        elem.previewSetter(
                                            file.type === "application/pdf"
                                                ? pdf_image
                                                : URL.createObjectURL(file)
                                        );
                                    }}
                                />

                                {elem.preview && (
                                    <div style={{ marginTop: "10px" }}>
                                        <img src={elem.preview} className="image-preview" />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                elem.fileSetter(null);
                                                elem.previewSetter("");
                                                setFileErrors((prev) => ({
                                                    ...prev,
                                                    [elem.key]: false,
                                                }));

                                                if (fileInputRefs.current[elem.key]) {
                                                    fileInputRefs.current[elem.key].value = "";
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>




                <div className="submit-btn-container">
                    <button
                        className="submit-button"
                        onClick={handleUpload}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing Booking..." : "Submit Booking"}
                    </button>
                </div>
            </div>

            {showModalMessage && (
                <Modal
                    message={modalMessage}
                    setShowModal={setShowModalMessage}
                    onOk={handleModalClose}
                    bookComplete={bookComplete}
                    hideCancel={true}
                />
            )}
        </div>
    );
}
