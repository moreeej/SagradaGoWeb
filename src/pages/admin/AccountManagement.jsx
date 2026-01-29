import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../Constants";
import { auth } from "../../config/firebase";
import Logger from "../../utils/logger";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Input,
  Select,
  Modal,
  message,
  Spin,
  Empty,
  Checkbox,
  Form,
  DatePicker,
  Tabs,
  Segmented,
} from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  InboxOutlined,
  KeyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AccountManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userDonations, setUserDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [userVolunteers, setUserVolunteers] = useState([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [eventsSearchTerm, setEventsSearchTerm] = useState("");
  const [eventsFilterType, setEventsFilterType] = useState("all");
  const [eventsStatusFilter, setEventsStatusFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resettingPasswordUser, setResettingPasswordUser] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    contact_number: "",
    birthday: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_priest: false,
    previous_parish: "",
    residency: "",
  });

  const [birthdayDisplay, setBirthdayDisplay] = useState("");

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [adminFormData, setAdminFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    contact_number: "",
    birthday: "",
    profile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterType, statusFilter, showArchived]);

  const filteredEvents = userVolunteers.filter((volunteer) => {
    if (eventsSearchTerm) {
      const searchLower = eventsSearchTerm.toLowerCase();
      const eventTitle = (volunteer.eventTitle || "General Volunteer").toLowerCase();
      if (!eventTitle.includes(searchLower)) {
        return false;
      }
    }

    if (eventsFilterType !== "all") {
      if (volunteer.registration_type !== eventsFilterType) {
        return false;
      }
    }

    if (eventsStatusFilter !== "all") {
      if (volunteer.status !== eventsStatusFilter) {
        return false;
      }
    }

    return true;
  });

  const volunteerCount = userVolunteers.filter(v => v.registration_type === "volunteer").length;
  const participantCount = userVolunteers.filter(v => v.registration_type === "participant").length;

  useEffect(() => {
    if (activeTab === "users") {
      setFilterType("users");

    } else if (activeTab === "priests") {
      setFilterType("priests");

    } else {
      setFilterType("all");
    }
  }, [activeTab]);


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/getAllUsers`);
      setUsers(response.data);

    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (!showArchived) {
      filtered = filtered.filter((user) => !user.is_archived);

    } else {
      filtered = filtered.filter((user) => user.is_archived === true);
    }

    if (filterType === "priests") {
      filtered = filtered.filter((user) => user.is_priest === true);

    } else if (filterType === "users") {
      filtered = filtered.filter((user) => user.is_priest === false);
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((user) => {
        const userIsActive = user.is_active === true;
        return userIsActive === isActive;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(term) ||
          user.last_name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.contact_number?.includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const getPasswordRules = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const formatDateInput = (value) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers;

    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;

    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const parseDateInput = (value) => {
    if (!value) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, month, day, year] = match;
      return `${year}-${month}-${day}`;
    }

    return value;
  };

  const validateBirthday = (birthday) => {
    if (!birthday) {
      return "Birthday is required";
    }

    const dateString = parseDateInput(birthday);
    let date = dayjs(dateString, "YYYY-MM-DD", true);
    if (!date.isValid()) {
      date = dayjs(dateString);
    }

    const today = dayjs();
    const minDate = dayjs().subtract(120, "years");

    if (!date.isValid()) {
      return "Please enter a valid date (MM/DD/YYYY)";
    }

    if (date.isAfter(today)) {
      return "Birthday cannot be in the future";
    }

    if (date.isBefore(minDate)) {
      return "Please enter a valid birthday (not more than 120 years ago)";
    }

    return "";
  };

  const checkEmailExists = async (email, currentUserEmail = null) => {
    try {
      if (currentUserEmail && currentUserEmail.toLowerCase() === email.trim().toLowerCase()) {
        return false;
      }

      const response = await axios.post(`${API_URL}/checkEmail`, { email: email.trim().toLowerCase() });
      return response.data.exists || false;

    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const checkContactExists = async (contactNumber, currentUserContact = null) => {
    try {
      if (currentUserContact && currentUserContact.trim() === contactNumber.trim()) {
        return false;
      }

      const response = await axios.post(`${API_URL}/checkContact`, { contact_number: contactNumber.trim() });
      return response.data.exists || false;

    } catch (error) {
      console.error("Error checking contact number:", error);
      return false;
    }
  };

  const validateContactNumber = (contactNumber) => {
    if (!contactNumber) {
      return "Contact number is required";
    }

    const trimmed = contactNumber.trim();

    if (!/^\d+$/.test(trimmed)) {
      return "Contact number must contain only numbers";
    }

    if (trimmed.length !== 11) {
      return "Contact number must be exactly 11 digits";
    }

    if (!trimmed.startsWith("09")) {
      return "Contact number must start with 09 (Philippine mobile number format)";
    }

    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
    return "";
  };

  const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) return "Confirm password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleContactNumberChange = (value) => {
    const numericOnly = value.replace(/\D/g, "");
    const limited = numericOnly.slice(0, 11);
    setFormData({ ...formData, contact_number: limited });

    if (errors.contact_number) {
      setErrors((prev) => ({ ...prev, contact_number: "" }));
    }

    if (limited.length === 11) {
      const error = validateContactNumber(limited);

      if (error) {
        setErrors((prev) => ({ ...prev, contact_number: error }));
      }
    }
  };

  const handleAddUser = async () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
  
    const confirmError = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    const contactError = validateContactNumber(formData.contact_number);
    if (contactError) {
      newErrors.contact_number = contactError;
    }

    const birthdayError = validateBirthday(formData.birthday);
    if (birthdayError) {
      newErrors.birthday = birthdayError;
    }

    // const passwordError = validatePassword(formData.password);
    // if (passwordError) {
    //   newErrors.password = passwordError;
    // }

    // const confirmPasswordError = validatePasswordMatch(formData.password, formData.confirmPassword);
    // if (confirmPasswordError) {
    //   newErrors.confirmPassword = confirmPasswordError;
    // }

    // if (passwordError || confirmError) {
    //   setErrors(prev => ({
    //     ...prev,
    //     password: passwordError,
    //     confirmPassword: confirmError
    //   }));
    //   return;
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        newErrors.email = "Email is already in use. Please use a different email.";
      }

      const contactExists = await checkContactExists(formData.contact_number);
      if (contactExists) {
        newErrors.contact_number = "Contact number is already in use. Please use a different contact number.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      setErrors({});

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const uid = user.uid;

      await sendEmailVerification(user);

      const formattedBirthday = formData.birthday
        ? dayjs(formData.birthday).format("YYYY-MM-DD")
        : "";

      const createPayload = {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number,
        birthday: formattedBirthday,
        email: formData.email,
        password: formData.password,
        uid: uid,
        is_priest: formData.is_priest,
      };

      if (formData.is_priest) {
        if (formData.previous_parish) {
          createPayload.previous_parish = formData.previous_parish;
        }

        if (formData.residency) {
          createPayload.residency = formData.residency;
        }
      }

      const response = await axios.post(`${API_URL}/createUser`, createPayload);
      const newUser = response.data.newUser;

      const userName = `${formData.first_name} ${formData.last_name}`.trim();
      await Logger.logCreateUser(newUser?.uid || uid, userName);

      message.success("User created successfully!");
      setShowAddModal(false);
      resetForm();
      fetchUsers();

    } catch (error) {
      console.error("Error creating user:", error);

      if (error.response) {
        message.error(error.response.data.message || "Failed to create user.");

      } else if (error.code === "auth/email-already-in-use") {
        message.error("Email is already in use.");

      } else {
        message.error("Failed to create user. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!adminFormData.email || !adminFormData.password || !adminFormData.first_name || !adminFormData.last_name) {
      message.error("Please fill out all required fields.");
      return;
    }

    if (adminFormData.password !== adminFormData.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminFormData.email,
        adminFormData.password
      );
      const user = userCredential.user;
      const uid = user.uid;

      await sendEmailVerification(user);

      const response = await axios.post(`${API_URL}/createAdmin`, {
        first_name: adminFormData.first_name,
        middle_name: adminFormData.middle_name,
        last_name: adminFormData.last_name,
        contact_number: adminFormData.contact_number,
        birthday: adminFormData.birthday,
        profile: adminFormData.profile,
        email: adminFormData.email,
        password: adminFormData.password,
        uid: uid,
      });
      const newAdmin = response.data?.admin || response.data?.newAdmin;

      const adminName = `${adminFormData.first_name} ${adminFormData.last_name}`.trim();
      await Logger.logCreateAdmin(newAdmin?._id || newAdmin?.id || uid, adminName);

      message.success("Admin account created successfully!");
      setShowAddAdminModal(false);
      setAdminFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        contact_number: "",
        birthday: "",
        profile: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      fetchUsers();

    } catch (error) {
      console.error("Error creating admin:", error);

      if (error.response) {
        message.error(error.response.data.message || "Failed to create admin.");

      } else if (error.code === "auth/email-already-in-use") {
        message.error("Email is already in use.");

      } else {
        message.error("Failed to create admin. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (uid, newRole) => {
    Modal.confirm({
      title: "Confirm Role Change",
      content: `Are you sure you want to ${newRole ? 'make this user a priest' : 'remove priest role from this user'}?`,
      onOk: async () => {
        try {
          setLoading(true);
          await axios.put(`${API_URL}/updateUserRole`, {
            uid: uid,
            is_priest: newRole,
          });

          const user = users.find(u => u.uid === uid);
          const userName = user ? `${user.first_name} ${user.last_name}`.trim() : "Unknown User";
          await Logger.logUpdateUser(uid, userName, { role_change: newRole ? "made_priest" : "removed_priest" });

          message.success("User role updated successfully!");
          fetchUsers();

        } catch (error) {
          console.error("Error updating user role:", error);
          message.error(error.response?.data?.message || "Failed to update user role.");

        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleToggleAccountStatus = async (uid, currentStatus, userName, userRecord = null) => {
    const isCurrentlyActive = currentStatus === true;
    const willEnable = !isCurrentlyActive;

    Modal.confirm({
      title: willEnable ? "Enable Account" : "Disable Account",
      content: willEnable
        ? `Are you sure you want to enable the account for ${userName}? The user will be able to log in again.`
        : `Are you sure you want to disable the account for ${userName}? The user will not be able to log in until the account is re-enabled.`,
      okText: willEnable ? "Enable" : "Disable",
      okButtonProps: {
        danger: !willEnable,
        style: willEnable ? { backgroundColor: "#52c41a", borderColor: "#52c41a" } : undefined,
      },
      onOk: async () => {
        try {
          setLoading(true);

          await axios.put(`${API_URL}/updateUserStatus`, {
            uid: uid,
            is_active: willEnable ? true : false,
          });


          if (willEnable) {
            await Logger.logEnableUser(uid, userName);

          } else {
            await Logger.logDisableUser(uid, userName);
          }

          message.success(`Account ${willEnable ? 'enabled' : 'disabled'} successfully!`);
          fetchUsers();

        } catch (error) {
          console.error("Error updating account status:", error);
          message.error(error.response?.data?.message || "Failed to update account status.");

        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleArchiveUser = async (uid, userName, userRecord = null) => {
    Modal.confirm({
      title: "Archive Account",
      content: `Are you sure you want to archive the account for ${userName}? The account will be moved to the archive database and will not appear in the active users list.`,
      okText: "Archive",
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        try {
          setLoading(true);

          await axios.put(`${API_URL}/archiveUser`, {
            uid: uid,
          });

          await Logger.logArchiveUser(uid, userName);

          message.success("Account archived successfully!");
          fetchUsers();

        } catch (error) {
          console.error("Error archiving account:", error);
          message.error(error.response?.data?.message || "Failed to archive account.");

        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleUnarchiveUser = async (uid, userName, userRecord = null) => {
    Modal.confirm({
      title: "Unarchive Account",
      content: `Are you sure you want to unarchive the account for ${userName}? The account will be restored to the active users list.`,
      okText: "Unarchive",
      okButtonProps: {
        style: { backgroundColor: "#52c41a", borderColor: "#52c41a" },
      },
      onOk: async () => {
        try {
          setLoading(true);

          await axios.put(`${API_URL}/unarchiveUser`, {
            uid: uid,
          });

          await Logger.logUnarchiveUser(uid, userName);

          message.success("Account unarchived successfully!");
          fetchUsers();

        } catch (error) {
          console.error("Error unarchiving account:", error);
          message.error(error.response?.data?.message || "Failed to unarchive account.");

        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleResetPassword = (user) => {
    setResettingPasswordUser(user);
    setShowResetPasswordModal(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!resettingPasswordUser || !resettingPasswordUser.email) {
      message.error("User email not found.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, resettingPasswordUser.email);

      const userName = `${resettingPasswordUser.first_name} ${resettingPasswordUser.last_name}`.trim() || resettingPasswordUser.email;
      await Logger.logUpdateUser(resettingPasswordUser.uid, userName, { action: "password_reset_email_sent" });

      message.success(`Password reset email has been sent to ${resettingPasswordUser.email}`);
      setShowResetPasswordModal(false);
      setResettingPasswordUser(null);

    } catch (error) {
      console.error("Error sending password reset email:", error);

      let errorMessage = "Failed to send password reset email. Please try again.";

      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";

      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User not found in Firebase Authentication.";

      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";

      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (user) => {
    setViewingUser(user);
    setShowDetailsModal(true);
    setUserDonations([]);
    setUserVolunteers([]);

    if (!user.is_priest && user.uid) {
      try {
        setLoadingDonations(true);
        const response = await axios.get(`${API_URL}/admin/getDonationsByUser/${user.uid}`);

        if (response.data && response.data.donations) {
          setUserDonations(response.data.donations);
        }

      } catch (error) {
        console.error("Error fetching user donations:", error);

      } finally {
        setLoadingDonations(false);
      }

      try {
        setLoadingVolunteers(true);
        const volunteerResponse = await axios.post(`${API_URL}/getUserVolunteers`, {
          user_id: user.uid
        });

        if (volunteerResponse.data && volunteerResponse.data.volunteers) {
          setUserVolunteers(volunteerResponse.data.volunteers);
        }

      } catch (error) {
        console.error("Error fetching user volunteers:", error);

      } finally {
        setLoadingVolunteers(false);
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    const birthdayValue = user.birthday ? dayjs(user.birthday).format("MM/DD/YYYY") : "";
    const birthdayFormatted = user.birthday ? dayjs(user.birthday).format("YYYY-MM-DD") : "";
    setFormData({
      first_name: user.first_name || "",
      middle_name: user.middle_name || "",
      last_name: user.last_name || "",
      contact_number: user.contact_number || "",
      birthday: birthdayFormatted,
      email: user.email || "",
      password: "",
      confirmPassword: "",
      is_priest: user.is_priest || false,
      previous_parish: user.previous_parish || "",
      residency: user.residency || "",
    });

    setBirthdayDisplay(birthdayValue);
    setErrors({});
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";

    const contactError = validateContactNumber(formData.contact_number);
    if (contactError) {
      newErrors.contact_number = contactError;
    }

    let birthdayToValidate = formData.birthday;
    if (birthdayDisplay && /^\d{2}\/\d{2}\/\d{4}$/.test(birthdayDisplay)) {
      birthdayToValidate = parseDateInput(birthdayDisplay);
      
    } else if (!birthdayToValidate && birthdayDisplay) {
      birthdayToValidate = parseDateInput(birthdayDisplay);
    }

    const birthdayError = validateBirthday(birthdayToValidate);
    if (birthdayError) {
      newErrors.birthday = birthdayError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const emailExists = await checkEmailExists(formData.email, editingUser?.email);
      if (emailExists) {
        newErrors.email = "Email is already in use. Please use a different email.";
      }

      const contactExists = await checkContactExists(formData.contact_number, editingUser?.contact_number);
      if (contactExists) {
        newErrors.contact_number = "Contact number is already in use. Please use a different contact number.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      setErrors({});

      const formattedBirthday = birthdayToValidate
        ? dayjs(birthdayToValidate).format("YYYY-MM-DD")
        : "";

      const updatePayload = {
        uid: editingUser.uid,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number,
        birthday: formattedBirthday,
        email: formData.email,
        is_priest: formData.is_priest,
      };

      if (formData.is_priest) {
        if (formData.previous_parish) {
          updatePayload.previous_parish = formData.previous_parish;
        }

        if (formData.residency) {
          updatePayload.residency = formData.residency;
        }

      } else {
        updatePayload.previous_parish = undefined;
        updatePayload.residency = undefined;
      }

      await axios.put(`${API_URL}/updateUser`, updatePayload);

      const userName = `${formData.first_name} ${formData.last_name}`.trim();
      await Logger.logUpdateUser(editingUser.uid, userName, {
        updated_fields: Object.keys(updatePayload).filter(key => key !== 'uid')
      });

      message.success("User updated successfully!");
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();

    } catch (error) {
      console.error("Error updating user:", error);

      if (error.response) {
        message.error(error.response.data.message || "Failed to update user.");

      } else {
        message.error("Failed to update user. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  const resetForm = (isPriest = false) => {
    setFormData({
      first_name: "",
      middle_name: "",
      last_name: "",
      contact_number: "",
      birthday: "",
      email: "",
      password: "",
      confirmPassword: "",
      is_priest: isPriest,
      previous_parish: "",
      residency: "",
    });

    setBirthdayDisplay("");
    setErrors({});
  };

  const userCount = users.filter((user) => !user.is_priest).length;
  const priestCount = users.filter((user) => user.is_priest).length;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <Text strong>
          {record.first_name} {record.middle_name} {record.last_name}
        </Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Contact",
      dataIndex: "contact_number",
      key: "contact_number",
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
      key: "birthday",
      render: (date) => formatDate(date),
    },
    {
      title: "Role",
      dataIndex: "is_priest",
      key: "role",
      render: (isPriest) => (
        <Tag color={isPriest ? "purple" : "blue"} icon={isPriest ? <TeamOutlined /> : <UserOutlined />}>
          {isPriest ? "Priest" : "User"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (isActive, record) => {
        if (record.is_archived) {
          return (
            <Tag color="default">
              Archived
            </Tag>
          );
        }
        const active = record.is_active === true;
        return (
          <Tag color={active ? "green" : "red"}>
            {active ? "Active" : "Disabled"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const isActive = record.is_active === true;
        const isArchived = record.is_archived === true;
        const userName = `${record.first_name} ${record.last_name}`.trim() || record.email;

        return (
          <Space>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              className="border-btn"
              style={{ padding: '10px' }}
              title="View Details"
            />

            {!isArchived && (
              <>
                <Button
                  type={record.is_priest ? "default" : "primary"}
                  className={record.is_priest ? "dangerborder-btn" : "border-btn"}
                  style={{ padding: '15px 14px', width: '130px' }}
                  onClick={() => handleUpdateRole(record.uid, !record.is_priest)}
                  loading={loading}
                >
                  {record.is_priest ? "Remove Priest" : "Make Priest"}
                </Button>

                {/* <Button
                  type="default"
                  icon={<KeyOutlined />}
                  onClick={() => handleResetPassword(record)}
                  className="border-btn"
                  style={{ padding: '10px' }}
                  title="Reset Password"
                >
                  Reset Password
                </Button> */}

                {/* <Button
                  type={isActive ? "default" : "primary"}
                  danger={isActive}
                  icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                  onClick={() => handleToggleAccountStatus(record.uid, record.is_active, userName, record)}
                  loading={loading}
                  className={isActive ? "dangerborder-btn" : "border-btn"}
                  style={{ padding: '10px' }}
                  title={isActive ? "Disable Account" : "Enable Account"}
                >
                  {isActive ? "Disable" : "Enable"}
                </Button> */}

                {/* <Button
                  type="default"
                  danger
                  icon={<InboxOutlined />}
                  onClick={() => handleArchiveUser(record.uid, userName, record)}
                  loading={loading}
                  className="dangerborder-btn"
                  style={{ padding: '10px' }}
                  title="Archive Account"
                >
                  Archive
                </Button> */}
              </>
            )}

            {isArchived && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUnarchiveUser(record.uid, userName, record)}
                loading={loading}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", padding: '10px' }}
                title="Unarchive Account"
              >
                Unarchive
              </Button>
            )}
          </Space>
        );
      }
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "95%", margin: "0 auto", marginTop: 20 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <Title level={2} style={{ margin: 0, color: "#262626", fontFamily: 'Poppins' }}>
                Account Management
              </Title>
              <Text type="secondary" style={{ fontSize: 16, fontFamily: 'Poppins', display: 'block', marginTop: 4 }}>
                Manage users and priests
              </Text>
            </div>
            <Space wrap>
              {activeTab === "users" && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    resetForm(false);
                    setShowAddModal(true);
                  }}
                  className="border-btn"
                >
                  Add User
                </Button>
              )}
              {activeTab === "priests" && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    resetForm(true);
                    setShowAddModal(true);
                  }}
                  className="border-btn"
                >
                  Add Priest
                </Button>
              )}
              {activeTab === "all" && (
                <>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => {
                      resetForm(false);
                      setShowAddModal(true);
                    }}
                    className="border-btn"
                  >
                    Add User
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => {
                      resetForm(true);
                      setShowAddModal(true);
                    }}
                    className="border-btn"
                  >
                    Add Priest
                  </Button>
                </>
              )}
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  setAdminFormData({
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    contact_number: "",
                    birthday: "",
                    profile: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                  setShowAddAdminModal(true);
                }}
                className="border-btn"
              >
                Add Admin
              </Button>
            </Space>
          </div>
        </div>

        {/* Search Field and Tabs Combined */}
        <Card style={{ marginBottom: 24, padding: 0 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 8 }}>Search:</Text>
                <Input
                  placeholder="Search by name, email, or contact number..."
                  prefix={<SearchOutlined style={{ marginRight: 8 }} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    padding: '10px 12px',
                    height: '42px',
                    width: '100%',
                  }}
                />
              </div>
              <div style={{ flex: '0 0 200px' }}>
                <Text strong style={{ fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 8 }}>Filter by Status:</Text>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{
                    width: '100%',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    height: '42px',
                  }}
                  placeholder="Select status"
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="disabled">Disabled</Option>
                </Select>
              </div>
              <div style={{ flex: '0 0 150px', display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  type={showArchived ? "primary" : "default"}
                  onClick={() => setShowArchived(!showArchived)}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    width: '100%',
                    height: '42px'
                  }}
                >
                  {showArchived ? "Hide Archived" : "Show Archived"}
                </Button>
              </div>
            </div>
          </div>
          <div style={{ padding: "16px 24px" }}>
            <Segmented
              value={activeTab}
              onChange={setActiveTab}
              options={[
                {
                  label: (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      All ({users.length})
                    </span>
                  ),
                  value: "all",
                },
                {
                  label: (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <UserOutlined />
                      Users ({userCount})
                    </span>
                  ),
                  value: "users",
                },
                {
                  label: (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <TeamOutlined />
                      Priests ({priestCount})
                    </span>
                  ),
                  value: "priests",
                },
              ]}
              style={{
                width: "100%",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
              }}
              size="large"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 16, fontFamily: 'Poppins' }}>
              {activeTab === "users" && `Users (${filteredUsers.length})`}
              {activeTab === "priests" && `Priests (${filteredUsers.length})`}
              {activeTab === "all" && `${showArchived ? 'Archived' : 'All'} Accounts (${filteredUsers.length})`}
            </Text>
          </div>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="uid"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => {
                if (activeTab === "users") return `Total ${total} users`;
                if (activeTab === "priests") return `Total ${total} priests`;
                return `Total ${total} accounts`;
              },
            }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: (
                <Empty
                  description={
                    activeTab === "users" ? "No users found" :
                      activeTab === "priests" ? "No priests found" :
                        "No accounts found"
                  }
                />
              ),
            }}
          />
        </Card>

        {/* User Details Modal */}
        <Modal
          title="User/Priest Details"
          open={showDetailsModal}
          onCancel={() => {
            setShowDetailsModal(false);
            setViewingUser(null);
          }}
          footer={null}
          width={700}
          maskClosable={true}
        >
          {viewingUser && (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                      First Name
                    </Text>
                    <Text>{viewingUser.first_name || "N/A"}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                      Middle Name
                    </Text>
                    <Text>{viewingUser.middle_name || "N/A"}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                      Last Name
                    </Text>
                    <Text>{viewingUser.last_name || "N/A"}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                      Email
                    </Text>
                    <Text>{viewingUser.email || "N/A"}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                      Contact Number
                    </Text>
                    <Text>{viewingUser.contact_number || "N/A"}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                      Birthday
                    </Text>
                    <Text>{viewingUser.birthday ? formatDate(viewingUser.birthday) : "N/A"}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                      Role
                    </Text>
                    <Tag color={viewingUser.is_priest ? "purple" : "blue"} icon={viewingUser.is_priest ? <TeamOutlined /> : <UserOutlined />}>
                      {viewingUser.is_priest ? "Priest" : "User"}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                      Account Status
                    </Text>
                    {viewingUser.is_archived ? (
                      <>
                        <Tag color="default" style={{ fontSize: "14px", padding: "4px 12px" }}>
                          Archived
                        </Tag>
                        <Text type="secondary" style={{ display: "block", marginTop: 4, fontSize: "12px" }}>
                          This account has been archived
                        </Text>
                      </>
                    ) : (
                      <>
                        <Tag color={viewingUser.is_active === true ? "green" : "red"} style={{ fontSize: "14px", padding: "4px 12px" }}>
                          {viewingUser.is_active === true ? "Active" : "Disabled"}
                        </Tag>
                        {viewingUser.is_active !== true && (
                          <Text type="secondary" style={{ display: "block", marginTop: 4, fontSize: "12px" }}>
                            This account is disabled and cannot log in
                          </Text>
                        )}
                      </>
                    )}
                  </div>
                </Col>
                {viewingUser.is_priest && (
                  <>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                          Previous Parish
                        </Text>
                        <Text>{viewingUser.previous_parish || "N/A"}</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                          Residency
                        </Text>
                        <Text>{viewingUser.residency || "N/A"}</Text>
                      </div>
                    </Col>
                  </>
                )}
                {!viewingUser.is_priest && (
                  <>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                          Total Donations
                        </Text>
                        {loadingDonations ? (
                          <Spin size="small" />
                        ) : (
                          <Text>
                            {userDonations.length > 0
                              ? `${userDonations.length} donation(s)`
                              : "No donations"}
                          </Text>
                        )}
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: "block", marginBottom: 4, color: "#666" }}>
                          Events Volunteered/Participated
                        </Text>
                        {loadingVolunteers ? (
                          <Spin size="small" />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Text>
                              {userVolunteers.length > 0
                                ? `${userVolunteers.length} event(s)`
                                : "No events"}
                            </Text>
                            {userVolunteers.length > 0 && (
                              <Button
                                type="primary"
                                icon={<CalendarOutlined />}
                                size="small"
                                onClick={() => setShowEventsModal(true)}
                                style={{ backgroundColor: "#b87d3e", borderColor: "#b87d3e" }}
                              >
                                View Events
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </Col>
                    {loadingDonations ? (
                      <Col xs={24}>
                        <div style={{ textAlign: "center", padding: "20px" }}>
                          <Spin tip="Loading donations..." />
                        </div>
                      </Col>
                    ) : userDonations.length > 0 && (
                      <Col xs={24}>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong style={{ display: "block", marginBottom: 8, color: "#666" }}>
                            Donation Details
                          </Text>
                          <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #f0f0f0", borderRadius: "4px", padding: "12px" }}>
                            {userDonations.map((donation, index) => (
                              <div key={donation._id || index} style={{ marginBottom: index < userDonations.length - 1 ? 12 : 0, paddingBottom: index < userDonations.length - 1 ? 12 : 0, borderBottom: index < userDonations.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div>
                                    <Text strong>₱{donation.amount?.toLocaleString() || "0"}</Text>
                                    <Text style={{ marginLeft: 8, color: "#666" }}>
                                      ({donation.paymentMethod || "N/A"})
                                    </Text>
                                  </div>
                                  <Tag color={donation.status === "confirmed" ? "green" : donation.status === "pending" ? "orange" : "red"}>
                                    {donation.status || "N/A"}
                                  </Tag>
                                </div>
                                {donation.intercession && (
                                  <Text style={{ display: "block", marginTop: 4, fontSize: "12px", color: "#999" }}>
                                    Intercession: {donation.intercession}
                                  </Text>
                                )}
                                <Text style={{ display: "block", marginTop: 4, fontSize: "11px", color: "#999" }}>
                                  {donation.createdAt ? formatDate(donation.createdAt) : "N/A"}
                                </Text>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Col>
                    )}
                  </>
                )}
              </Row>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                {!viewingUser.is_archived && (
                  <>
                    <Button
                      type="default"
                      icon={<KeyOutlined />}
                      onClick={() => handleResetPassword(viewingUser)}
                      style={{ padding: '10px' }}
                    >
                      Reset Password
                    </Button>
                    <Button
                      type={viewingUser.is_active === true ? "default" : "primary"}
                      danger={viewingUser.is_active === true}
                      icon={viewingUser.is_active === true ? <StopOutlined /> : <CheckCircleOutlined />}
                      onClick={() => handleToggleAccountStatus(
                        viewingUser.uid,
                        viewingUser.is_active,
                        `${viewingUser.first_name} ${viewingUser.last_name}`.trim() || viewingUser.email,
                        viewingUser
                      )}
                      loading={loading}
                    >
                      {viewingUser.is_active === true ? "Disable Account" : "Enable Account"}
                    </Button>
                    <Button
                      type="default"
                      danger
                      icon={<InboxOutlined />}
                      onClick={() => handleArchiveUser(
                        viewingUser.uid,
                        `${viewingUser.first_name} ${viewingUser.last_name}`.trim() || viewingUser.email,
                        viewingUser
                      )}
                      loading={loading}
                    >
                      Archive Account
                    </Button>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => handleEditUser(viewingUser)}
                      style={{ backgroundColor: "#b87d3e", borderColor: "#b87d3e" }}
                    >
                      Edit User
                    </Button>
                  </>
                )}
                {viewingUser.is_archived && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleUnarchiveUser(
                      viewingUser.uid,
                      `${viewingUser.first_name} ${viewingUser.last_name}`.trim() || viewingUser.email,
                      viewingUser
                    )}
                    loading={loading}
                    style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                  >
                    Unarchive Account
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Edit User Modal */}
        <Modal
          title="Edit User/Priest"
          open={showEditModal}
          onCancel={() => {
            setShowEditModal(false);
            setEditingUser(null);
            resetForm();
          }}
          footer={null}
          width={800}
          maskClosable={true}
        >
          <Form layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      First Name <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.first_name ? "error" : ""}
                  help={errors.first_name}
                >
                  <Input
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    placeholder="Enter first name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Middle Name">
                  <Input
                    value={formData.middle_name}
                    onChange={(e) =>
                      setFormData({ ...formData, middle_name: e.target.value })
                    }
                    placeholder="Enter middle name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Last Name <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.last_name ? "error" : ""}
                  help={errors.last_name}
                >
                  <Input
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    placeholder="Enter last name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Contact Number <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.contact_number ? "error" : ""}
                  help={errors.contact_number}
                >
                  <Input
                    value={formData.contact_number}
                    onChange={(e) => handleContactNumberChange(e.target.value)}
                    onBlur={() => {
                      const error = validateContactNumber(formData.contact_number);
                      if (error) {
                        setErrors((prev) => ({ ...prev, contact_number: error }));
                      }
                    }}
                    placeholder="09XXXXXXXXX (11 digits, starts with 09)"
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Birthday <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.birthday ? "error" : ""}
                  help={errors.birthday}
                >
                  <DatePicker
                    value={formData.birthday ? dayjs(formData.birthday) : null}
                    onChange={(date) => {
                      if (date) {
                        const formatted = date.format("YYYY-MM-DD");
                        setFormData({ ...formData, birthday: formatted });
                        setBirthdayDisplay(date.format("MM/DD/YYYY"));
                        const error = validateBirthday(formatted);
                        setErrors((prev) => ({ ...prev, birthday: error }));
                      } else {
                        setFormData({ ...formData, birthday: "" });
                        setBirthdayDisplay("");
                        setErrors((prev) => ({ ...prev, birthday: "Birthday is required" }));
                      }
                    }}
                    format="MM/DD/YYYY"
                    placeholder="Select birthday"
                    style={{ width: "100%" }}
                    inputReadOnly={true}
                    allowClear={true}
                    disabledDate={(current) => {
                      return current && (current > dayjs().endOf('day') || current < dayjs().subtract(120, 'years'));
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Email <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.email ? "error" : ""}
                  help={errors.email}
                >
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item>
                  <Checkbox
                    checked={formData.is_priest}
                    onChange={(e) =>
                      setFormData({ ...formData, is_priest: e.target.checked })
                    }
                  >
                    This user is a priest
                  </Checkbox>
                </Form.Item>
              </Col>
              {formData.is_priest && (
                <>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Previous Parish">
                      <Input
                        value={formData.previous_parish}
                        onChange={(e) =>
                          setFormData({ ...formData, previous_parish: e.target.value })
                        }
                        placeholder="Enter previous parish"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Residency">
                      <Select
                        value={formData.residency}
                        onChange={(value) =>
                          setFormData({ ...formData, residency: value })
                        }
                        placeholder="Select residency"
                        allowClear
                      >
                        <Option value="Permanent">Permanent</Option>
                        <Option value="Floating">Floating</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleUpdateUser}
                loading={loading}
                style={{ backgroundColor: "#b87d3e", borderColor: "#b87d3e" }}
              >
                Update User
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Add User Modal */}
        <Modal
          title="Add New User/Priest"
          open={showAddModal}
          onCancel={() => {
            setShowAddModal(false);
            resetForm();
          }}
          footer={null}
          width={800}
          maskClosable={true}
        >
          <Form layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      First Name <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.first_name ? "error" : ""}
                  help={errors.first_name}
                >
                  <Input
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    placeholder="Enter first name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Middle Name">
                  <Input
                    value={formData.middle_name}
                    onChange={(e) =>
                      setFormData({ ...formData, middle_name: e.target.value })
                    }
                    placeholder="Enter middle name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Last Name <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.last_name ? "error" : ""}
                  help={errors.last_name}
                >
                  <Input
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    placeholder="Enter last name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Contact Number <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.contact_number ? "error" : ""}
                  help={errors.contact_number}
                >
                  <Input
                    value={formData.contact_number}
                    onChange={(e) => handleContactNumberChange(e.target.value)}
                    onBlur={() => {
                      const error = validateContactNumber(formData.contact_number);
                      if (error) {
                        setErrors((prev) => ({ ...prev, contact_number: error }));
                      }
                    }}
                    placeholder="09XXXXXXXXX (11 digits, starts with 09)"
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Birthday <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.birthday ? "error" : ""}
                  help={errors.birthday}
                >
                  <DatePicker
                    value={formData.birthday ? dayjs(formData.birthday) : null}
                    onChange={(date) => {
                      if (date) {
                        const formatted = date.format("YYYY-MM-DD");
                        setFormData({ ...formData, birthday: formatted });
                        setBirthdayDisplay(date.format("MM/DD/YYYY"));
                        const error = validateBirthday(formatted);
                        setErrors((prev) => ({ ...prev, birthday: error }));
                      } else {
                        setFormData({ ...formData, birthday: "" });
                        setBirthdayDisplay("");
                        setErrors((prev) => ({ ...prev, birthday: "Birthday is required" }));
                      }
                    }}
                    format="MM/DD/YYYY"
                    placeholder="Select birthday"
                    style={{ width: "100%" }}
                    inputReadOnly={true}
                    allowClear={true}
                    disabledDate={(current) => {
                      return current && (current > dayjs().endOf('day') || current < dayjs().subtract(120, 'years'));
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Email <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.email ? "error" : ""}
                  help={errors.email}
                >
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Password <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.password ? "error" : ""}
                  help={errors.password}
                >
                  <Input.Password
                    value={formData.password}
                    onChange={(e) => {
                      const newPassword = e.target.value;
                      setFormData({ ...formData, password: newPassword });
                      setPasswordRules(getPasswordRules(newPassword));
                      
                      // Clear password error when typing
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }
                      // Re-validate confirm password if it exists
                      if (formData.confirmPassword) {
                        const confirmError = validatePasswordMatch(newPassword, formData.confirmPassword);
                        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
                      }
                    }}
                    onBlur={() => {
                      const error = validatePassword(formData.password);
                      if (error) {
                        setErrors((prev) => ({ ...prev, password: error }));
                      }
                      // Also validate confirm password match
                      if (formData.confirmPassword) {
                        const confirmError = validatePasswordMatch(formData.password, formData.confirmPassword);
                        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
                      }
                    }}
                    placeholder="Enter password"
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />

                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    <div style={{ color: passwordRules.length ? "green" : "red" }}>
                      • At least 8 characters
                    </div>
                    <div style={{ color: passwordRules.uppercase ? "green" : "red" }}>
                      • At least 1 uppercase letter
                    </div>
                    <div style={{ color: passwordRules.lowercase ? "green" : "red" }}>
                      • At least 1 lowercase letter
                    </div>
                    <div style={{ color: passwordRules.number ? "green" : "red" }}>
                      • At least 1 number
                    </div>
                    <div style={{ color: passwordRules.specialChar ? "green" : "red" }}>
                      • At least 1 special character
                    </div>
                  </div>
        
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Confirm Password <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  validateStatus={errors.confirmPassword ? "error" : ""}
                  help={errors.confirmPassword}
                >
                  <Input.Password
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      const newConfirmPassword = e.target.value;
                      setFormData({ ...formData, confirmPassword: newConfirmPassword });
                      // Clear error when typing
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                      // Validate match if password exists
                      if (formData.password) {
                        const error = validatePasswordMatch(formData.password, newConfirmPassword);
                        // if (error) {
                        //   setErrors((prev) => ({ ...prev, confirmPassword: error }));
                        // }
                        setErrors(prev => ({ ...prev, confirmPassword: error }));
                      }
                    }}
                    onBlur={() => {
                      if (formData.password) {
                        const error = validatePasswordMatch(formData.password, formData.confirmPassword);
                        setErrors((prev) => ({ ...prev, confirmPassword: error }));
                      }
                    }}
                    placeholder="Confirm password"
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item>
                  <Checkbox
                    checked={formData.is_priest}
                    onChange={(e) =>
                      setFormData({ ...formData, is_priest: e.target.checked })
                    }
                  >
                    This user is a priest
                  </Checkbox>
                </Form.Item>
              </Col>
              {formData.is_priest && (
                <>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Previous Parish">
                      <Input
                        value={formData.previous_parish}
                        onChange={(e) =>
                          setFormData({ ...formData, previous_parish: e.target.value })
                        }
                        placeholder="Enter previous parish"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Residency">
                      <Select
                        value={formData.residency}
                        onChange={(value) =>
                          setFormData({ ...formData, residency: value })
                        }
                        placeholder="Select residency"
                        allowClear
                      >
                        <Option value="Permanent">Permanent</Option>
                        <Option value="Floating">Floating</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button
                className="cancelborder-btn"
                style={{ padding: '10px' }}
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="filled-btn"
                style={{ padding: '10px' }}
                onClick={handleAddUser}
                loading={loading}
              >
                Create User
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Add Admin Modal */}
        <Modal
          title="Add New Admin"
          open={showAddAdminModal}
          onCancel={() => {
            setShowAddAdminModal(false);
            setAdminFormData({
              first_name: "",
              middle_name: "",
              last_name: "",
              contact_number: "",
              birthday: "",
              profile: "",
              email: "",
              password: "",
              confirmPassword: "",
            });
          }}
          footer={null}
          width={800}
          maskClosable={true}
        >
          <Form layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={
                    <>
                      First Name <span style={{ color: "red" }}>*</span>
                    </>
                  }
                >
                  <Input
                    value={adminFormData.first_name}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, first_name: e.target.value })
                    }
                    placeholder="Enter first name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Middle Name">
                  <Input
                    value={adminFormData.middle_name}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, middle_name: e.target.value })
                    }
                    placeholder="Enter middle name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={
                    <>
                      Last Name <span style={{ color: "red" }}>*</span>
                    </>
                  }
                >
                  <Input
                    value={adminFormData.last_name}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, last_name: e.target.value })
                    }
                    placeholder="Enter last name"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Contact Number">
                  <Input
                    value={adminFormData.contact_number}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, contact_number: e.target.value })
                    }
                    placeholder="Enter contact number"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Birthday">
                  <DatePicker
                    value={adminFormData.birthday ? dayjs(adminFormData.birthday) : null}
                    onChange={(date) => {
                      if (date) {
                        setAdminFormData({ ...adminFormData, birthday: date.format("YYYY-MM-DD") });
                      } else {
                        setAdminFormData({ ...adminFormData, birthday: "" });
                      }
                    }}
                    format="MM/DD/YYYY"
                    placeholder="Select birthday"
                    style={{ width: "100%" }}
                    inputReadOnly={true}
                    allowClear={true}
                    disabledDate={(current) => {
                      return current && (current > dayjs().endOf('day') || current < dayjs().subtract(120, 'years'));
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Profile Picture">
                  <Input
                    value={adminFormData.profile}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, profile: e.target.value })
                    }
                    placeholder="Enter profile picture URL"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Email <span style={{ color: "red" }}>*</span>
                    </>
                  }
                >
                  <Input
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, email: e.target.value })
                    }
                    placeholder="Enter email"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Password <span style={{ color: "red" }}>*</span>
                    </>
                  }
                >
                  <Input.Password
                    value={adminFormData.password}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, password: e.target.value })
                    }
                    placeholder="Enter password"
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <>
                      Confirm Password <span style={{ color: "red" }}>*</span>
                    </>
                  }
                >
                  <Input.Password
                    value={adminFormData.confirmPassword}
                    onChange={(e) =>
                      setAdminFormData({ ...adminFormData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm password"
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button
                onClick={() => {
                  setShowAddAdminModal(false);
                  setAdminFormData({
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    contact_number: "",
                    birthday: "",
                    profile: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className="filled-btn"
                style={{ padding: '10px' }}
                onClick={handleAddAdmin}
                loading={loading}
              >
                Create Admin
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Events Modal */}
        <Modal
          title={
            <div>
              <Text strong style={{ fontSize: 18, fontFamily: 'Poppins' }}>
                Events - {viewingUser ? `${viewingUser.first_name} ${viewingUser.last_name}` : 'User'}
              </Text>
            </div>
          }
          open={showEventsModal}
          onCancel={() => {
            setShowEventsModal(false);
            setEventsSearchTerm("");
            setEventsFilterType("all");
            setEventsStatusFilter("all");
          }}
          footer={null}
          width={900}
          maskClosable={true}
        >
          {/* Counts and Stats */}
          <div style={{ marginBottom: 24, padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                    Total Events
                  </Text>
                  <Text strong style={{ fontSize: 24, color: "#262626" }}>
                    {userVolunteers.length}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                    Volunteered
                  </Text>
                  <Text strong style={{ fontSize: 24, color: "#1890ff" }}>
                    {volunteerCount}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                    Participated
                  </Text>
                  <Text strong style={{ fontSize: 24, color: "#52c41a" }}>
                    {participantCount}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* Search and Filters */}
          <Card style={{ marginBottom: 16, padding: 0 }}>
            <div style={{ padding: "16px" }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Text strong style={{ fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 8 }}>
                    Search Event:
                  </Text>
                  <Input
                    placeholder="Search by event name..."
                    prefix={<SearchOutlined style={{ marginRight: 8 }} />}
                    value={eventsSearchTerm}
                    onChange={(e) => setEventsSearchTerm(e.target.value)}
                    allowClear
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      padding: '10px 12px',
                      height: '42px',
                    }}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Text strong style={{ fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 8 }}>
                    Type:
                  </Text>
                  <Select
                    value={eventsFilterType}
                    onChange={setEventsFilterType}
                    style={{
                      width: '100%',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      height: '42px',
                    }}
                  >
                    <Option value="all">All Types</Option>
                    <Option value="volunteer">Volunteer</Option>
                    <Option value="participant">Participant</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={6}>
                  <Text strong style={{ fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 8 }}>
                    Status:
                  </Text>
                  <Select
                    value={eventsStatusFilter}
                    onChange={setEventsStatusFilter}
                    style={{
                      width: '100%',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      height: '42px',
                    }}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="confirmed">Confirmed</Option>
                    <Option value="cancelled">Cancelled</Option>
                  </Select>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Events List */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {loadingVolunteers ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin tip="Loading events..." size="large" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <Empty
                description={
                  eventsSearchTerm || eventsFilterType !== "all" || eventsStatusFilter !== "all"
                    ? "No events match your filters"
                    : "No events found"
                }
                style={{ padding: "40px" }}
              />
            ) : (
              <div>
                {filteredEvents.map((volunteer, index) => (
                  <Card
                    key={volunteer._id || index}
                    style={{
                      marginBottom: 12,
                      border: "1px solid #f0f0f0",
                      borderRadius: 8,
                    }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 16, fontFamily: 'Poppins' }}>
                            {volunteer.eventTitle || "General Volunteer"}
                          </Text>
                          <Tag color={volunteer.registration_type === "volunteer" ? "blue" : "green"}>
                            {volunteer.registration_type === "volunteer" ? "Volunteer" : "Participant"}
                          </Tag>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                          <Tag color={volunteer.status === "confirmed" ? "green" : volunteer.status === "pending" ? "orange" : "red"}>
                            {volunteer.status || "pending"}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Registered: {volunteer.createdAt ? formatDate(volunteer.createdAt) : "N/A"}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Showing {filteredEvents.length} of {userVolunteers.length} event(s)
            </Text>
          </div>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          title={
            <div>
              <Text strong style={{ fontSize: 18, fontFamily: 'Poppins' }}>
                Reset Password - {resettingPasswordUser ? `${resettingPasswordUser.first_name} ${resettingPasswordUser.last_name}` : 'User'}
              </Text>
            </div>
          }
          open={showResetPasswordModal}
          onCancel={() => {
            setShowResetPasswordModal(false);
            setResettingPasswordUser(null);
          }}
          footer={null}
          width={500}
          maskClosable={true}
        >
          <div style={{ padding: "16px 0" }}>
            <Text style={{ display: "block", marginBottom: 16, fontSize: 14, color: "#666" }}>
              Are you sure you want to send a password reset email to{" "}
              <Text strong>{resettingPasswordUser?.email}</Text>?
            </Text>
            <Text style={{ display: "block", fontSize: 13, color: "#999", fontStyle: "italic" }}>
              The user will receive an email with instructions to reset their password.
            </Text>
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button
              onClick={() => {
                setShowResetPasswordModal(false);
                setResettingPasswordUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<KeyOutlined />}
              onClick={handleConfirmResetPassword}
              loading={loading}
              style={{ backgroundColor: "#b87d3e", borderColor: "#b87d3e" }}
            >
              Send Reset Email
            </Button>
          </div>
        </Modal>

      </div>
    </div>
  );
}

