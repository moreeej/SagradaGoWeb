import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarContext } from "../context/AllContext";
import "../styles/profile.css";
import { Modal, Button, message, Spin, Image, Carousel } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../Constants";
import dayjs from "dayjs";

import banner1 from "../assets/SAGRADA-FAMILIA-PARISH.jpg";
import banner2 from "../assets/christmas.jpg";
import banner3 from "../assets/dyd.jpg";

export default function ProfilePage({ user, onLogout, updateUser }) {
  const { currentUser: contextUser, setCurrentUser } = useContext(NavbarContext);
  const navigate = useNavigate();

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;

    } catch (e) {
      return null;
    }
  };

  const storedUser = getStoredUser();
  const currentUser = contextUser || user || storedUser;

  const [formData, setFormData] = useState({
    first_name: currentUser?.first_name || "",
    middle_name: currentUser?.middle_name || "",
    last_name: currentUser?.last_name || "",
    email: currentUser?.email || "",
    contact_number: currentUser?.contact_number || "",
    birthday: currentUser?.birthday || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (contextUser && contextUser.uid) {
        setLoading(false);
        return;
      }

      const stored = getStoredUser();
      if (!stored || !stored.uid) {
        setLoading(false);
        return;
      }

      setCurrentUser(stored);
      setFormData({
        first_name: stored.first_name || "",
        middle_name: stored.middle_name || "",
        last_name: stored.last_name || "",
        email: stored.email || "",
        contact_number: stored.contact_number || "",
        birthday: stored.birthday || "",
      });

      if (API_URL) {
        try {
          let userData = null;
          let isAdmin = false;

          try {
            const adminResponse = await axios.post(`${API_URL}/findAdmin`, { 
              uid: stored.uid 
            }, {
              validateStatus: function (status) {
                return status < 500; 
              }
            });
            
            if (adminResponse.status === 200 && adminResponse.data && adminResponse.data.user) {
              userData = adminResponse.data.user;
              isAdmin = true;
              userData.is_admin = true;
            }

          } catch (adminError) {
            if (adminError.response?.status === 404) {
              try {
                const userResponse = await axios.post(`${API_URL}/findUser`, { 
                  uid: stored.uid 
                }, {
                  validateStatus: function (status) {
                    return status < 500; 
                  }
                });
                
                if (userResponse.status === 200 && userResponse.data && userResponse.data.user) {
                  userData = userResponse.data.user;
                  isAdmin = false;
                }
              } catch (userError) {
                // Both failed, silently use stored data
              }
            }
          }

          if (userData) {
            setCurrentUser(userData);
            localStorage.setItem("currentUser", JSON.stringify(userData));
            
            setFormData({
              first_name: userData.first_name || "",
              middle_name: userData.middle_name || "",
              last_name: userData.last_name || "",
              email: userData.email || "",
              contact_number: userData.contact_number || "",
              birthday: userData.birthday || "",
            });
          }

        } catch (error) {
          if (error.response?.status !== 404 && error.code !== 'ERR_NETWORK') {
            console.error("Error fetching fresh user data:", error);
          }
        }
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      setFormData({
        first_name: currentUser.first_name || "",
        middle_name: currentUser.middle_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        contact_number: currentUser.contact_number || "",
        birthday: currentUser.birthday || "",
      });
    }
  }, [currentUser]);

  if (loading || (!currentUser && !getStoredUser())) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "first_name":
      case "last_name":
        if (!value.trim()) {
          error = `${field.replace("_", " ")} is required.`;
        } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
          error = "This field must contain letters only.";
        } else if (value.trim().length < 2) {
          error = "This field must be at least 2 characters long.";
        }
        break;

      case "middle_name":
        if (value && !/^[a-zA-Z\s\-']+$/.test(value)) {
          error = "This field must contain letters only.";
        }
        break;

      case "contact_number":
        if (!value.trim()) {
          error = "Contact number is required.";
        } else if (!/^[0-9]+$/.test(value)) {
          error = "Contact number must contain digits only.";
        } else if (value.length !== 11) {
          error = "Contact number must be exactly 11 digits.";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field] || errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    let hasErrors = false;

    const fields = ["first_name", "last_name", "contact_number", "email"];
    
    fields.forEach((field) => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (formData.middle_name) {
      const error = validateField("middle_name", formData.middle_name);
      if (error) {
        newErrors.middle_name = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);
    setTouched(newTouched);

    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      message.error("Please fix the errors in the form.");
      return;
    }

    if (!currentUser || !currentUser.uid) {
      message.error("User information not available. Please try logging in again.");
      return;
    }

    setIsSaving(true);
    try {
      let formattedBirthday = formData.birthday;
      if (formData.birthday) {
        if (typeof formData.birthday === 'string') {
          formattedBirthday = formData.birthday;

        } else if (formData.birthday instanceof Date) {
          formattedBirthday = dayjs(formData.birthday).format("YYYY-MM-DD");
        }
      }

      const endpoint = currentUser.is_admin
      ? `${API_URL}/updateAdmin`
      : `${API_URL}/updateUser`;

      const response = await axios.put(endpoint, {
        uid: currentUser.uid,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number,
        birthday: formattedBirthday,
        email: formData.email,
      });

      const updatedUser = response.data?.user || { ...currentUser, ...formData };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setFormData({
        first_name: updatedUser.first_name || "",
        middle_name: updatedUser.middle_name || "",
        last_name: updatedUser.last_name || "",
        email: updatedUser.email || "",
        contact_number: updatedUser.contact_number || "",
        birthday: updatedUser.birthday || "",
      });

      message.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to update profile. Please try again.");

    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();

    } else {
      Cookies.remove("email");
      setCurrentUser({});
      localStorage.removeItem("currentUser");
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div className="profileContainer">
      <div className="profileBanner">
        <Carousel autoplay autoplaySpeed={4000} dots effect="fade">
          {[banner1, banner2, banner3].map((img, index) => (
            <div key={index}>
              <Image
                src={img}
                alt={`Profile Banner ${index + 1}`}
                width="100%"
                height={400}
                style={{ objectFit: "cover" }}
                fallback="/no-image.jpg"
                preview={false}
              />
            </div>
          ))}
        </Carousel>
      </div>

      <div style={{ padding: 32 }}>
        <div

        className="profileHeader"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
            marginTop: 10
          }}
        >
          <div>
            <h2 className="pageTitle">Profile Information</h2>
            <p className="pageSubtitle" style={{ marginTop: -20 }}>
              Manage your personal information and ensure your account details are
              accurate and current.
            </p>
          </div>

          <div className="actionRow">
            {!isEditing ? (
              <Button className="border-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button className="border-btn2" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button
                  className="filled-btn"
                  loading={isSaving}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="formGrid">
          {[
            ["First Name", "first_name"],
            ["Middle Name", "middle_name"],
            ["Last Name", "last_name"],
            ["Contact Number", "contact_number"],
            ["Email", "email"],
          ].map(([label, field]) => (
            <div className="formGroup" key={field}>
              <label>{label}</label>
              <input
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onBlur={() => handleBlur(field)}
                disabled={!isEditing}
              />
              {errors[field] && <span className="error">{errors[field]}</span>}
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={showLogoutModal}
        title="Confirm Logout"
        onCancel={() => setShowLogoutModal(false)}
        onOk={handleLogoutConfirm}
      >
        Are you sure you want to logout?
      </Modal>
    </div>
  );
}
