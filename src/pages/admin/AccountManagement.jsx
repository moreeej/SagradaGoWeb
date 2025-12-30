import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../Constants";
import { auth } from "../../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
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
  const [activeTab, setActiveTab] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userDonations, setUserDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterType]);

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

    if (filterType === "priests") {
      filtered = filtered.filter((user) => user.is_priest === true);

    } else if (filterType === "users") {
      filtered = filtered.filter((user) => user.is_priest === false);
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
    if (!password) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

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

    const contactError = validateContactNumber(formData.contact_number);
    if (contactError) {
      newErrors.contact_number = contactError;
    }

    const birthdayError = validateBirthday(formData.birthday);
    if (birthdayError) {
      newErrors.birthday = birthdayError;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    const confirmPasswordError = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

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

      await axios.post(`${API_URL}/createUser`, createPayload);

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

  const handleViewDetails = async (user) => {
    setViewingUser(user);
    setShowDetailsModal(true);
    setUserDonations([]);

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

            <Button
              type={record.is_priest ? "default" : "primary"}
              className={record.is_priest ? "dangerborder-btn" : "border-btn"}
              style={{ padding: '15px 14px' }}
              onClick={() => handleUpdateRole(record.uid, !record.is_priest)}
              loading={loading}
            >
              {record.is_priest ? "Remove Priest" : "Make Priest"}
            </Button>

            <Button
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
            </Button>
          </Space>
        );
      }
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1550px", margin: "0 auto", marginTop: 20 }}>
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
                  style={{ backgroundColor: "#1772FF", borderColor: "#1772FF", color: "white" }}
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
                  style={{ backgroundColor: "#722ed1", borderColor: "#722ed1", color: "white" }}
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
                    style={{ backgroundColor: "#1772FF", borderColor: "#1772FF", color: "white" }}
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
                    style={{ backgroundColor: "#722ed1", borderColor: "#722ed1", color: "white" }}
                  >
                    Add Priest
                  </Button>
                </>
              )}
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  navigate("/admin/create");
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
              }}
            />
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
              {activeTab === "all" && `All Accounts (${filteredUsers.length})`}
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
                    <Tag color={viewingUser.is_active === true ? "green" : "red"} style={{ fontSize: "14px", padding: "4px 12px" }}>
                      {viewingUser.is_active === true ? "Active" : "Disabled"}
                    </Tag>
                    {viewingUser.is_active !== true && (
                      <Text type="secondary" style={{ display: "block", marginTop: 4, fontSize: "12px" }}>
                        This account is disabled and cannot log in
                      </Text>
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
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setViewingUser(null);
                  }}
                >
                  Close
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
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEditUser(viewingUser)}
                  style={{ backgroundColor: "#b87d3e", borderColor: "#b87d3e" }}
                >
                  Edit User
                </Button>
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
                  help={errors.birthday || "Format: MM/DD/YYYY"}
                >
                  <Input
                    value={birthdayDisplay}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue.length < birthdayDisplay.length) {
                        setBirthdayDisplay(inputValue);

                        if (inputValue.length === 0) {
                          setFormData({ ...formData, birthday: "" });
                          setErrors((prev) => ({ ...prev, birthday: "" }));
                        }
                        return;
                      }

                      const formatted = formatDateInput(inputValue);
                      setBirthdayDisplay(formatted);

                      if (/^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
                        const parsed = parseDateInput(formatted);
                        setFormData({ ...formData, birthday: parsed });

                        const error = validateBirthday(parsed);
                        setErrors((prev) => ({ ...prev, birthday: error }));

                      } else if (formatted.length === 0) {
                        setFormData({ ...formData, birthday: "" });
                        setErrors((prev) => ({ ...prev, birthday: "" }));
                      }
                    }}
                    onBlur={() => {
                      if (birthdayDisplay) {
                        if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthdayDisplay)) {
                          const parsed = parseDateInput(birthdayDisplay);
                          const error = validateBirthday(parsed);
                          setErrors((prev) => ({ ...prev, birthday: error }));

                        } else {
                          setErrors((prev) => ({ ...prev, birthday: "Please enter a complete date (MM/DD/YYYY)" }));
                        }

                      } else if (formData.birthday) {
                        const error = validateBirthday(formData.birthday);
                        setErrors((prev) => ({ ...prev, birthday: error }));
                      }
                    }}
                    placeholder="MM/DD/YYYY"
                    maxLength={10}
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
                        <Option value="Temporary">Temporary</Option>
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
                  help={errors.birthday || "Format: MM/DD/YYYY"}
                >
                  <Input
                    value={birthdayDisplay}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue.length < birthdayDisplay.length) {
                        setBirthdayDisplay(inputValue);

                        if (inputValue.length === 0) {
                          setFormData({ ...formData, birthday: "" });
                          setErrors((prev) => ({ ...prev, birthday: "" }));
                        }
                        return;
                      }

                      const formatted = formatDateInput(inputValue);
                      setBirthdayDisplay(formatted);

                      if (/^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
                        const parsed = parseDateInput(formatted);
                        setFormData({ ...formData, birthday: parsed });

                        const error = validateBirthday(parsed);
                        setErrors((prev) => ({ ...prev, birthday: error }));

                      } else if (formatted.length === 0) {
                        setFormData({ ...formData, birthday: "" });
                        setErrors((prev) => ({ ...prev, birthday: "" }));
                      }
                    }}
                    onBlur={() => {
                      if (birthdayDisplay) {
                        if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthdayDisplay)) {
                          const parsed = parseDateInput(birthdayDisplay);
                          const error = validateBirthday(parsed);
                          setErrors((prev) => ({ ...prev, birthday: error }));

                        } else {
                          setErrors((prev) => ({ ...prev, birthday: "Please enter a complete date (MM/DD/YYYY)" }));
                        }

                      } else if (formData.birthday) {
                        const error = validateBirthday(formData.birthday);
                        setErrors((prev) => ({ ...prev, birthday: error }));
                      }
                    }}
                    placeholder="MM/DD/YYYY"
                    maxLength={10}
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
                        if (error) {
                          setErrors((prev) => ({ ...prev, confirmPassword: error }));
                        }
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
                        <Option value="Temporary">Temporary</Option>
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
      </div>
    </div>
  );
}

