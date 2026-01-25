import { useState, useEffect, Fragment } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Input,
  Modal,
  message,
  Spin,
  Empty,
  Tooltip,
  Form,
  DatePicker,
  TimePicker,
  Checkbox,
  Tabs,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  PhoneOutlined,
  FileImageOutlined,
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../Constants";
import { supabase } from "../../config/supabase";
import dayjs from "dayjs";
import { sacramentRequirements } from "../../utils/sacramentRequirements";
import Logger from "../../utils/logger";

const { Title, Text } = Typography;
const { Option } = Select;

function AdminBookingForm({ bookingType, onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);

  const [groomPic, setGroomPic] = useState(null);
  const [bridePic, setBridePic] = useState(null);
  const [isCivillyMarried, setIsCivillyMarried] = useState("no");

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [physicalRequirements, setPhysicalRequirements] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [birthdayDisplay, setBirthdayDisplay] = useState("");

  useEffect(() => {
    setPhysicalRequirements({});
  }, [bookingType]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(`${API_URL}/getAllUsers`);
      const regularUsers = (response.data || []).filter(
        (user) => !user.is_priest && !user.is_admin && user.is_active !== false
      );

      setUsers(regularUsers);

    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users list");

    } finally {
      setLoadingUsers(false);
    }
  };

  const validateContactNumber = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Contact number is required'));
    }

    const trimmed = value.trim();

    if (!/^\d+$/.test(trimmed)) {
      return Promise.reject(new Error('Contact number must contain only numbers'));
    }

    if (trimmed.length !== 11) {
      return Promise.reject(new Error('Contact number must be exactly 11 digits'));
    }

    if (!trimmed.startsWith("09")) {
      return Promise.reject(new Error('Contact number must start with 09 (Philippine mobile number format)'));
    }

    return Promise.resolve();
  };

  const handleNameInput = (fieldName, value) => {
    const filteredValue = value.replace(/[^a-zA-Z\s\-']/g, '');
    form.setFieldsValue({ [fieldName]: filteredValue });
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

  const validateBirthday = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Birthday is required'));
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [month, day, year] = value.split('/');
      let date = dayjs(`${year}-${month}-${day}`, "YYYY-MM-DD", true);

      if (!date.isValid()) {
        return Promise.reject(new Error('Please enter a valid date (MM/DD/YYYY)'));
      }

      const today = dayjs();
      const minDate = dayjs().subtract(120, "years");

      if (date.isAfter(today)) {
        return Promise.reject(new Error('Birthday cannot be in the future'));
      }

      if (date.isBefore(minDate)) {
        return Promise.reject(new Error('Please enter a valid birthday (not more than 120 years ago)'));
      }

      return Promise.resolve();
    }

    const dateString = parseDateInput(value);
    let date = dayjs(dateString, "YYYY-MM-DD", true);
    if (!date.isValid()) {
      date = dayjs(dateString);
    }

    if (!date.isValid()) {
      return Promise.reject(new Error('Please enter a valid date (MM/DD/YYYY)'));
    }

    const today = dayjs();
    const minDate = dayjs().subtract(120, "years");

    if (date.isAfter(today)) {
      return Promise.reject(new Error('Birthday cannot be in the future'));
    }

    if (date.isBefore(minDate)) {
      return Promise.reject(new Error('Please enter a valid birthday (not more than 120 years ago)'));
    }

    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!selectedUserId) {
        message.error("Please select a user for this booking");
        setLoading(false);
        return;
      }

      const formData = new FormData();

      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(time.getHours());
      combinedDateTime.setMinutes(time.getMinutes());
      combinedDateTime.setSeconds(0);
      combinedDateTime.setMilliseconds(0);

      const timeString = time ? `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}` : '';

      console.log('Creating booking for user UID:', selectedUserId);
      console.log('Booking type:', bookingType);

      formData.append('uid', selectedUserId);
      formData.append('full_name', values.full_name || '');
      formData.append('email', values.email || '');
      formData.append('date', combinedDateTime.toISOString());
      formData.append('time', timeString);
      formData.append('attendees', values.attendees || '1');
      formData.append('contact_number', values.contact_number || '');
      formData.append('payment_method', values.payment_method || 'in_person');
      formData.append('amount', getSacramentPrice(bookingType).toString());

      formData.append('physical_requirements', JSON.stringify(physicalRequirements));

      if (bookingType === 'Wedding') {
        const groomNameParts = [
          values.groom_first_name,
          values.groom_middle_name,
          values.groom_last_name
        ].filter(part => part && part.trim());
        const brideNameParts = [
          values.bride_first_name,
          values.bride_middle_name,
          values.bride_last_name
        ].filter(part => part && part.trim());
        
        const groomFullname = groomNameParts.join(' ').trim();
        const brideFullname = brideNameParts.join(' ').trim();
        
        formData.append('groom_fullname', groomFullname);
        formData.append('bride_fullname', brideFullname);
        formData.append('is_civilly_married', isCivillyMarried);

        if (groomPic) formData.append('groom_1x1', groomPic);
        if (bridePic) formData.append('bride_1x1', bridePic);

        Object.keys(uploadedFiles).forEach(key => {
          if (uploadedFiles[key]) formData.append(key, uploadedFiles[key]);
        });

        const requiredDocFields = [
          'marriage_license',
          'marriage_contract',
          'groom_baptismal_cert',
          'bride_baptismal_cert',
          'groom_confirmation_cert',
          'bride_confirmation_cert'
        ];

        requiredDocFields.forEach(field => {
          if (!uploadedFiles[field]) {
            formData.append(field, '');
          }
        });

        const weddingResponse = await axios.post(`${API_URL}/createWedding`, formData);
        await Logger.logCreateBooking(
          weddingResponse.data?.wedding?.transaction_id || weddingResponse.data?.transaction_id,
          bookingType,
          { user_id: selectedUserId }
        );

      } else if (bookingType === 'Baptism') {
        formData.append('candidate_first_name', values.candidate_first_name || '');
        formData.append('candidate_middle_name', values.candidate_middle_name || '');
        formData.append('candidate_last_name', values.candidate_last_name || '');
        formData.append('candidate_birthday', values.candidate_birthday || '');
        formData.append('candidate_birth_place', values.candidate_birth_place || '');
        formData.append('father_first_name', values.father_first_name || '');
        formData.append('father_middle_name', values.father_middle_name || '');
        formData.append('father_last_name', values.father_last_name || '');
        formData.append('father_birth_place', values.father_birth_place || '');
        formData.append('mother_first_name', values.mother_first_name || '');
        formData.append('mother_middle_name', values.mother_middle_name || '');
        formData.append('mother_last_name', values.mother_last_name || '');
        formData.append('mother_birth_place', values.mother_birth_place || '');
        formData.append('marriage_type', values.marriage_type || '');
        formData.append('address', values.address || '');
        formData.append('main_godfather', JSON.stringify({
          name: values.main_godfather_name || '',
          relationship: values.main_godfather_relationship || ''
        }));
        formData.append('main_godmother', JSON.stringify({
          name: values.main_godmother_name || '',
          relationship: values.main_godmother_relationship || ''
        }));
        formData.append('additional_godparents', JSON.stringify([]));

        Object.keys(uploadedFiles).forEach(key => {
          if (uploadedFiles[key]) formData.append(key, uploadedFiles[key]);
        });

        const baptismResponse = await axios.post(`${API_URL}/createBaptism`, formData);
        await Logger.logCreateBooking(
          baptismResponse.data?.baptism?.transaction_id || baptismResponse.data?.transaction_id,
          bookingType,
          { user_id: selectedUserId }
        );

      } else if (bookingType === 'Burial') {
        formData.append('deceased_name', values.deceased_name || '');
        formData.append('deceased_age', values.deceased_age || '');
        formData.append('deceased_civil_status', values.deceased_civil_status || '');
        formData.append('requested_by', values.requested_by || '');
        formData.append('relationship_to_deceased', values.relationship_to_deceased || '');
        formData.append('address', values.address || '');
        formData.append('place_of_mass', values.place_of_mass || '');
        formData.append('mass_address', values.mass_address || '');
        formData.append('funeral_mass', burialServices.funeral_mass ? 'true' : 'false');
        formData.append('death_anniversary', burialServices.death_anniversary ? 'true' : 'false');
        formData.append('funeral_blessing', burialServices.funeral_blessing ? 'true' : 'false');
        formData.append('tomb_blessing', burialServices.tomb_blessing ? 'true' : 'false');

        Object.keys(uploadedFiles).forEach(key => {
          if (uploadedFiles[key]) formData.append(key, uploadedFiles[key]);
        });

        const burialResponse = await axios.post(`${API_URL}/createBurial`, formData);
        await Logger.logCreateBooking(
          burialResponse.data?.burial?.transaction_id || burialResponse.data?.transaction_id,
          bookingType,
          { user_id: selectedUserId }
        );

      } else if (bookingType === 'Communion') {
        Object.keys(uploadedFiles).forEach(key => {
          if (uploadedFiles[key]) formData.append(key, uploadedFiles[key]);
        });

        const communionResponse = await axios.post(`${API_URL}/createCommunion`, formData);
        await Logger.logCreateBooking(
          communionResponse.data?.communion?.transaction_id || communionResponse.data?.transaction_id,
          bookingType,
          { user_id: selectedUserId }
        );

      } else if (bookingType === 'Confirmation') {
        formData.append('sponsor_name', values.sponsor_name || '');

        Object.keys(uploadedFiles).forEach(key => {
          if (uploadedFiles[key]) formData.append(key, uploadedFiles[key]);
        });

        const confirmationResponse = await axios.post(`${API_URL}/createConfirmation`, formData);
        await Logger.logCreateBooking(
          confirmationResponse.data?.confirmation?.transaction_id || confirmationResponse.data?.transaction_id,
          bookingType,
          { user_id: selectedUserId }
        );

      } else if (bookingType === 'Anointing') {
        const payload = {
          uid: selectedUserId,
          full_name: values.full_name || '',
          email: values.email || '',
          date: combinedDateTime.toISOString(),
          time: timeString,
          attendees: 1,
          contact_number: values.contact_number || '',
          medical_condition: values.medical_condition || '',
          transaction_id: `ANOINT-${Date.now()}`,
          status: 'pending',
          physical_requirements: physicalRequirements,
        };

        const anointingResponse = await axios.post(`${API_URL}/createAnointing`, payload);
        await Logger.logCreateBooking(
          anointingResponse.data?.anointing?.transaction_id || anointingResponse.data?.transaction_id || payload.transaction_id,
          bookingType,
          { user_id: selectedUserId }
        );

      } else if (bookingType === 'Confession') {
        const payload = {
          uid: selectedUserId,
          full_name: values.full_name || '',
          email: values.email || '',
          date: combinedDateTime.toISOString(),
          time: timeString,
          attendees: 1,
          transaction_id: `CONF-${Date.now()}`,
          status: 'pending',
          physical_requirements: physicalRequirements,
        };

        const response = await axios.post(`${API_URL}/createConfession`, payload);
        await Logger.logCreateBooking(
          response.data?.booking?.transaction_id || response.data?.transaction_id,
          bookingType,
          { user_id: selectedUserId }
        );
      }

      message.success(`${bookingType} booking created successfully!`);
      form.resetFields();
      setDate(null);
      setTime(null);
      setGroomPic(null);
      setBridePic(null);
      setUploadedFiles({});
      setPhysicalRequirements({});
      setSelectedUserId(null);
      setBirthdayDisplay("");
      setBurialServices({
        funeral_mass: false,
        death_anniversary: false,
        funeral_blessing: false,
        tomb_blessing: false,
      });
      onSuccess();

    } catch (error) {
      console.error('Error creating booking:', error);
      message.error(error.response?.data?.message || `Failed to create ${bookingType} booking.`);

    } finally {
      setLoading(false);
    }
  };

  const getSacramentPrice = (sacrament) => {
    const prices = {
      'Wedding': 10000,
      'Baptism': 2000,
      'Confession': 0,
      'Anointing': 0,
      'Communion': 1500,
      'Burial': 3000,
      'Confirmation': 1500,
    };
    return prices[sacrament] || 0;
  };

  const [burialServices, setBurialServices] = useState({
    funeral_mass: false,
    death_anniversary: false,
    funeral_blessing: false,
    tomb_blessing: false,
  });

  const getMinimumDate = () => {
    const today = dayjs();
    if (bookingType === 'Baptism' || bookingType === 'Wedding') {
      return today.add(2, 'month');

    } else if (bookingType === 'Burial') {
      return today.add(7, 'day');

    }
    return today.add(1, 'day');
  };

  const getUserDisplayName = (user) => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const middleName = user.middle_name || '';
    const lastName = user.last_name || '';
    const name = [firstName, middleName, lastName].filter(Boolean).join(' ');
    return name || user.email || '';
  };

  const handleUserChange = (uid) => {
    setSelectedUserId(uid);
    const selectedUser = users.find(u => u.uid === uid);
    if (selectedUser) {
      const fullName = getUserDisplayName(selectedUser);
      form.setFieldsValue({
        full_name: fullName,
        email: selectedUser.email || '',
        contact_number: selectedUser.contact_number || '',
      });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ marginTop: 20 }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Select User"
            required
            help="Choose the user this booking will be assigned to"
          >
            <Select
              placeholder="Select a user"
              value={selectedUserId}
              onChange={handleUserChange}
              loading={loadingUsers}
              showSearch
              filterOption={(input, option) => {
                const user = users.find(u => u.uid === option.value);
                if (!user) return false;
                const displayName = getUserDisplayName(user).toLowerCase();
                const email = (user.email || '').toLowerCase();
                const searchTerm = input.toLowerCase();
                return displayName.includes(searchTerm) || email.includes(searchTerm);
              }}
              notFoundContent={loadingUsers ? <Spin size="small" /> : "No users found"}
            >
              {users.map((user) => (
                <Option key={user.uid} value={user.uid}>
                  {getUserDisplayName(user)} {user.email ? `(${user.email})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input
              placeholder="Enter full name"
              onChange={(e) => handleNameInput('full_name', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Contact Number"
            name="contact_number"
            rules={[{ validator: validateContactNumber }]}
          >
            <Input
              placeholder="09XXXXXXXXX (11 digits, starts with 09)"
              maxLength={11}
              onChange={(e) => {
                const value = e.target.value;
                const numericOnly = value.replace(/\D/g, "");
                const limited = numericOnly.slice(0, 11);
                form.setFieldsValue({ contact_number: limited });
              }}
            />
          </Form.Item>
        </Col>
        {(bookingType !== 'Confession' && bookingType !== 'Anointing') && (
          <Col span={12}>
            <Form.Item
              label="Number of Attendees"
              name="attendees"
              rules={[{ required: true, message: 'Please enter number of attendees' }]}
            >
              <Input type="number" min={1} placeholder="Enter attendees" />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              value={date ? dayjs(date) : null}
              onChange={(value) => setDate(value ? value.toDate() : null)}
              minDate={getMinimumDate()}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Time"
            rules={[{ required: true, message: 'Please select time' }]}
          >
            <TimePicker
              style={{ width: '100%' }}
              value={time ? dayjs(time) : null}
              onChange={(value) => setTime(value ? value.toDate() : null)}
              format="h:mm A"
              minuteStep={10}
            />
          </Form.Item>
        </Col>
      </Row>

      {(bookingType === 'Wedding' || bookingType === 'Baptism' || bookingType === 'Burial' ||
        bookingType === 'Communion' || bookingType === 'Confirmation') && (
          <Form.Item
            label="Payment Method"
            name="payment_method"
            initialValue="in_person"
          >
            <Select>
              <Option value="in_person">In-Person Payment</Option>
              <Option value="gcash">GCash</Option>
            </Select>
          </Form.Item>
        )}

      {/* Wedding-specific fields */}
      {bookingType === 'Wedding' && (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Groom First Name"
                name="groom_first_name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input onChange={(e) => handleNameInput('groom_first_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Groom Middle Name" name="groom_middle_name">
                <Input onChange={(e) => handleNameInput('groom_middle_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Groom Last Name"
                name="groom_last_name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input onChange={(e) => handleNameInput('groom_last_name', e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Bride First Name"
                name="bride_first_name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input onChange={(e) => handleNameInput('bride_first_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Bride Middle Name" name="bride_middle_name">
                <Input onChange={(e) => handleNameInput('bride_middle_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Bride Last Name"
                name="bride_last_name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input onChange={(e) => handleNameInput('bride_last_name', e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Are you civilly married?">
                <Select value={isCivillyMarried} onChange={setIsCivillyMarried}>
                  <Option value="no">No</Option>
                  <Option value="yes">Yes</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Groom 1x1 Photo">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGroomPic(e.target.files[0])}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Bride 1x1 Photo">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBridePic(e.target.files[0])}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {/* Baptism-specific fields */}
      {bookingType === 'Baptism' && (
        <>
          <Title level={5}>Candidate Information</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="First Name"
                name="candidate_first_name"
                rules={[{ required: true }]}
              >
                <Input onChange={(e) => handleNameInput('candidate_first_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Middle Name" name="candidate_middle_name">
                <Input onChange={(e) => handleNameInput('candidate_middle_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Last Name"
                name="candidate_last_name"
                rules={[{ required: true }]}
              >
                <Input onChange={(e) => handleNameInput('candidate_last_name', e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Birthday (MM/DD/YYYY)"
                name="candidate_birthday"
                rules={[{ validator: validateBirthday }]}
                help="Format: MM/DD/YYYY"
              >
                <Input
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  value={birthdayDisplay}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue.length < birthdayDisplay.length) {
                      setBirthdayDisplay(inputValue);
                      form.setFieldsValue({ candidate_birthday: inputValue });
                      if (inputValue.length === 0) {
                        form.setFieldsValue({ candidate_birthday: "" });
                      }
                      return;
                    }

                    const formatted = formatDateInput(inputValue);
                    setBirthdayDisplay(formatted);
                    form.setFieldsValue({ candidate_birthday: formatted });

                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
                      form.validateFields(['candidate_birthday']);
                    }
                  }}
                  onBlur={() => {
                    if (birthdayDisplay) {
                      if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthdayDisplay)) {
                        form.validateFields(['candidate_birthday']);
                      } else {
                        form.setFieldsValue({ candidate_birthday: "" });
                        setBirthdayDisplay("");
                      }
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Birth Place"
                name="candidate_birth_place"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5}>Father Information</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="First Name"
                name="father_first_name"
                rules={[{ required: true }]}
              >
                <Input onChange={(e) => handleNameInput('father_first_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Middle Name" name="father_middle_name">
                <Input onChange={(e) => handleNameInput('father_middle_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Last Name"
                name="father_last_name"
                rules={[{ required: true }]}
              >
                <Input onChange={(e) => handleNameInput('father_last_name', e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Birth Place"
            name="father_birth_place"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Title level={5}>Mother Information</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="First Name"
                name="mother_first_name"
                rules={[{ required: true }]}
              >
                <Input onChange={(e) => handleNameInput('mother_first_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Middle Name" name="mother_middle_name">
                <Input onChange={(e) => handleNameInput('mother_middle_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Last Name"
                name="mother_last_name"
                rules={[{ required: true }]}
              >
                <Input onChange={(e) => handleNameInput('mother_last_name', e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Birth Place"
            name="mother_birth_place"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Marriage Type"
            name="marriage_type"
            rules={[{ required: true, message: 'Please select marriage type' }]}
          >
            <Select placeholder="Select marriage type">
              <Option value="Church">Church</Option>
              <Option value="Civil">Civil</Option>
              <Option value="Catholic">Catholic</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Title level={5}>Godparents</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Main Godfather Name"
                name="main_godfather_name"
                rules={[{ required: true }]}
              >
                <Input onChange={(e) => handleNameInput('main_godfather_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Relationship" name="main_godfather_relationship">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Main Godmother Name"
                name="main_godmother_name"
                rules={[{ required: true }]}
              >
                <Input onChange={(e) => handleNameInput('main_godmother_name', e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Relationship" name="main_godmother_relationship">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {/* Burial-specific fields */}
      {bookingType === 'Burial' && (
        <>
          <Form.Item
            label="Deceased Name"
            name="deceased_name"
            rules={[{ required: true }]}
          >
            <Input onChange={(e) => handleNameInput('deceased_name', e.target.value)} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Deceased Age"
                name="deceased_age"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Civil Status"
                name="deceased_civil_status"
                rules={[{ required: true, message: 'Please select civil status' }]}
              >
                <Select placeholder="Select civil status">
                  <Option value="Single">Single</Option>
                  <Option value="Married">Married</Option>
                  <Option value="Widowed">Widowed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Requested By"
            name="requested_by"
            rules={[{ required: true }]}
          >
            <Input onChange={(e) => handleNameInput('requested_by', e.target.value)} />
          </Form.Item>
          <Form.Item
            label="Relationship to Deceased"
            name="relationship_to_deceased"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Place of Mass" name="place_of_mass">
            <Input />
          </Form.Item>
          <Form.Item label="Mass Address" name="mass_address">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Services">
            <Space direction="vertical">
              <Checkbox
                checked={burialServices.funeral_mass}
                onChange={(e) => setBurialServices({ ...burialServices, funeral_mass: e.target.checked })}
              >
                Funeral Mass
              </Checkbox>
              <Checkbox
                checked={burialServices.death_anniversary}
                onChange={(e) => setBurialServices({ ...burialServices, death_anniversary: e.target.checked })}
              >
                Death Anniversary
              </Checkbox>
              <Checkbox
                checked={burialServices.funeral_blessing}
                onChange={(e) => setBurialServices({ ...burialServices, funeral_blessing: e.target.checked })}
              >
                Funeral Blessing
              </Checkbox>
              <Checkbox
                checked={burialServices.tomb_blessing}
                onChange={(e) => setBurialServices({ ...burialServices, tomb_blessing: e.target.checked })}
              >
                Tomb Blessing
              </Checkbox>
            </Space>
          </Form.Item>
        </>
      )}

      {/* Confirmation-specific fields */}
      {bookingType === 'Confirmation' && (
        <Form.Item label="Sponsor Name" name="sponsor_name">
          <Input onChange={(e) => handleNameInput('sponsor_name', e.target.value)} />
        </Form.Item>
      )}

      {/* Anointing-specific fields */}
      {bookingType === 'Anointing' && (
        <Form.Item label="Medical Condition" name="medical_condition">
          <Input.TextArea />
        </Form.Item>
      )}

      {(() => {
        let requirements = sacramentRequirements[bookingType] || [];

        if (bookingType === 'Wedding') {
          requirements = requirements.filter((req) => {
            if (req.onlyIfCivillyMarried) {
              return isCivillyMarried === 'yes';
            }
            return true;
          });
        }

        const uploadRequirements = requirements.filter(req => req.requiresUpload);

        if (uploadRequirements.length === 0) {
          return null;
        }

        return (
          <Form.Item
            label={
              <span>
                <Text strong>Document Requirements</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Check the documents that need to be submitted physically or in-hand
                </Text>
              </span>
            }
          >
            <div style={{
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '16px',
              backgroundColor: '#fafafa'
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {uploadRequirements.map((requirement) => (
                  <Checkbox
                    key={requirement.id}
                    checked={physicalRequirements[requirement.id] || false}
                    onChange={(e) => {
                      setPhysicalRequirements(prev => ({
                        ...prev,
                        [requirement.id]: e.target.checked
                      }));
                    }}
                  >
                    {requirement.label}
                  </Checkbox>
                ))}
              </Space>
            </div>
          </Form.Item>
        );
      })()}

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Booking
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default function BookingPendingRequests() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [priests, setPriests] = useState([]);
  const [selectedPriestId, setSelectedPriestId] = useState(null);
  const [loadingPriests, setLoadingPriests] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const [createBookingModalVisible, setCreateBookingModalVisible] = useState(false);
  const [selectedBookingType, setSelectedBookingType] = useState(null);
  const [dateFilterTab, setDateFilterTab] = useState("all");
  const [adminComment, setAdminComment] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { bookingId, bookingType, status }
  const [quickComment, setQuickComment] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editDate, setEditDate] = useState(null);
  const [editTime, setEditTime] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    // Fetch priests when status filter changes
    // Bookings are handled by the polling effect below
    fetchPriests();
  }, [statusFilter]);

  // Real-time polling for bookings
  useEffect(() => {
    // Don't poll if modals are open to avoid unnecessary requests
    if (detailModalVisible || createBookingModalVisible || editModalVisible || confirmModalVisible) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    // Initial fetch
    fetchAllBookings(true);

    // Set up polling interval (every 5 seconds)
    const pollInterval = setInterval(() => {
      fetchAllBookings(false);
    }, 5000);

    // Cleanup interval on unmount or when modals open
    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [statusFilter, detailModalVisible, createBookingModalVisible, editModalVisible, confirmModalVisible]);

  const fetchPriests = async () => {
    try {
      setLoadingPriests(true);
      const response = await axios.get(`${API_URL}/getAllPriests`);
      if (response.data && response.data.priests) {
        setPriests(response.data.priests);
      }
    } catch (error) {
      console.error("Error fetching priests:", error);
      message.error("Failed to load priests list");
    } finally {
      setLoadingPriests(false);
    }
  };

  useEffect(() => {
    filterBookings();
  }, [searchTerm, bookings, typeFilter, monthFilter, dateFilterTab]);

  const fetchAllBookings = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const [weddings, baptisms, burials, communions, confirmations, anointings, confessions] = await Promise.all([
        axios.get(`${API_URL}/admin/getAllWeddings`).catch(() => ({ data: { weddings: [] } })),
        axios.get(`${API_URL}/admin/getAllBaptisms`).catch(() => ({ data: { baptisms: [] } })),
        axios.get(`${API_URL}/admin/getAllBurials`).catch(() => ({ data: { burials: [] } })),
        axios.get(`${API_URL}/admin/getAllCommunions`).catch(() => ({ data: { communions: [] } })),
        axios.get(`${API_URL}/admin/getAllConfirmations`).catch(() => ({ data: { confirmations: [] } })),
        axios.get(`${API_URL}/admin/getAllAnointings`).catch(() => ({ data: { anointings: [] } })),
        axios.get(`${API_URL}/admin/getAllConfessions`).catch(() => ({ data: { bookings: [] } })),
      ]);

      // Normalize confession bookings and fetch user data if missing
      const confessionBookings = confessions.data.bookings || [];
      const normalizedConfessions = await Promise.all(
        confessionBookings.map(async (b) => {
          let userData = b.user;

          // If user object is missing but uid exists, fetch user data
          if (!userData && b.uid && b.uid !== 'admin') {
            try {
              const userResponse = await axios.post(`${API_URL}/findUser`, { uid: b.uid });
              if (userResponse.data && userResponse.data.user) {
                userData = userResponse.data.user;
              }
            } catch (error) {
              console.error(`Error fetching user data for confession booking ${b.transaction_id}:`, error);
            }
          }

          return {
            ...b,
            bookingType: "Confession",
            typeLabel: "Confession",
            date: b.date ? new Date(b.date).toISOString() : null,
            createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
            status: b.status || "pending",
            user: userData || b.user, // Use fetched user data or original
            // Don't set full_name here - let getName() function handle it from user object
            transaction_id: b.transaction_id || `CONF-${Date.now()}`,
            time: b.time || null,
          };
        })
      );

      const allBookings = [
        ...(weddings.data.weddings || []).map((b) => ({ ...b, bookingType: "Wedding", typeLabel: "Wedding" })),
        ...(baptisms.data.baptisms || []).map((b) => ({ ...b, bookingType: "Baptism", typeLabel: "Baptism" })),
        ...(burials.data.burials || []).map((b) => ({ ...b, bookingType: "Burial", typeLabel: "Burial" })),
        ...(communions.data.communions || []).map((b) => ({ ...b, bookingType: "Communion", typeLabel: "Communion" })),
        ...(confirmations.data.confirmations || []).map((b) => ({ ...b, bookingType: "Confirmation", typeLabel: "Confirmation" })),
        ...(anointings.data.anointings || []).map((b) => ({ ...b, bookingType: "Anointing", typeLabel: "Anointing of the Sick" })),
        ...normalizedConfessions
      ];

      if (process.env.NODE_ENV === 'development' && allBookings.length > 0) {
        console.log('Sample booking time fields:', allBookings.slice(0, 3).map(b => ({
          type: b.bookingType,
          transaction_id: b.transaction_id,
          time: b.time,
          timeType: typeof b.time
        })));
      }

      const rejectedCount = await autoRejectPastDueBookings(allBookings);

      if (rejectedCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const [weddings2, baptisms2, burials2, communions2, confirmations2, anointings2, confessions2] = await Promise.all([
          axios.get(`${API_URL}/admin/getAllWeddings`).catch(() => ({ data: { weddings: [] } })),
          axios.get(`${API_URL}/admin/getAllBaptisms`).catch(() => ({ data: { baptisms: [] } })),
          axios.get(`${API_URL}/admin/getAllBurials`).catch(() => ({ data: { burials: [] } })),
          axios.get(`${API_URL}/admin/getAllCommunions`).catch(() => ({ data: { communions: [] } })),
          axios.get(`${API_URL}/admin/getAllConfirmations`).catch(() => ({ data: { confirmations: [] } })),
          axios.get(`${API_URL}/admin/getAllAnointings`).catch(() => ({ data: { anointings: [] } })),
          axios.get(`${API_URL}/admin/getAllConfessions`).catch(() => ({ data: { bookings: [] } })),
        ]);

        const confessionBookings2 = confessions2.data.bookings || [];
        const normalizedConfessions2 = await Promise.all(
          confessionBookings2.map(async (b) => {
            let userData = b.user;
            if (!userData && b.uid && b.uid !== 'admin') {
              try {
                const userResponse = await axios.post(`${API_URL}/findUser`, { uid: b.uid });
                if (userResponse.data && userResponse.data.user) {
                  userData = userResponse.data.user;
                }

              } catch (error) {
                console.error(`Error fetching user data for confession booking ${b.transaction_id}:`, error);
              }
            }

            return {
              ...b,
              bookingType: "Confession",
              typeLabel: "Confession",
              date: b.date ? new Date(b.date).toISOString() : null,
              createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
              status: b.status || "pending",
              user: userData || b.user,
              transaction_id: b.transaction_id || `CONF-${Date.now()}`,
              time: b.time || null,
            };
          })
        );

        allBookings = [
          ...(weddings2.data.weddings || []).map((b) => ({ ...b, bookingType: "Wedding", typeLabel: "Wedding" })),
          ...(baptisms2.data.baptisms || []).map((b) => ({ ...b, bookingType: "Baptism", typeLabel: "Baptism" })),
          ...(burials2.data.burials || []).map((b) => ({ ...b, bookingType: "Burial", typeLabel: "Burial" })),
          ...(communions2.data.communions || []).map((b) => ({ ...b, bookingType: "Communion", typeLabel: "Communion" })),
          ...(confirmations2.data.confirmations || []).map((b) => ({ ...b, bookingType: "Confirmation", typeLabel: "Confirmation" })),
          ...(anointings2.data.anointings || []).map((b) => ({ ...b, bookingType: "Anointing", typeLabel: "Anointing of the Sick" })),
          ...normalizedConfessions2
        ];
      }

      let filtered = allBookings;

      if (statusFilter !== "all") {
        filtered = allBookings.filter((b) => b.status === statusFilter);
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setBookings(filtered);

      const total = allBookings.length;
      const pending = allBookings.filter((b) => b.status === "pending").length;
      const confirmed = allBookings.filter((b) => b.status === "confirmed").length;
      const cancelled = allBookings.filter((b) => b.status === "cancelled").length;

      setStats({ total, pending, confirmed, cancelled });
      setLastUpdateTime(new Date());

    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (showLoading) {
        message.error("Failed to fetch bookings. Please try again.");
      }

    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (dateFilterTab === "past") {
      filtered = filtered.filter((b) => isBookingDatePast(b));

    } else if (dateFilterTab === "active") {
      filtered = filtered.filter((b) => !isBookingDatePast(b));
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((b) => b.bookingType === typeFilter);
    }

    if (monthFilter !== "all") {
      filtered = filtered.filter((b) => {
        if (!b.date) return false;
        const bookingDate = new Date(b.date);

        if (isNaN(bookingDate.getTime())) return false;

        return bookingDate.getMonth() + 1 === parseInt(monthFilter);
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((b) => {
        const searchableFields = [
          b.transaction_id,
          b.contact_number,
          b.groom_first_name,
          b.groom_last_name,
          b.bride_first_name,
          b.bride_last_name,
          b.first_name,
          b.last_name,
          b.deceased_name,
          b.deceased_age,
          b.deceased_civil_status,
          b.requested_by,
          b.relationship_to_deceased,
          b.address,
          b.place_of_mass,
          b.mass_address,
          b.user?.name,
          b.user?.email,
        ].filter(Boolean);
        return searchableFields.some((field) => field?.toLowerCase().includes(term));
      });
    }

    setFilteredBookings(filtered);
  };

  const getMonthOptions = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return [
      { value: "all", label: "All Months" },
      ...months.map((month, index) => ({
        value: String(index + 1),
        label: month,
      })),
    ];
  };

  const checkPriestConflict = async (priestId, bookingDate, bookingTime, transactionId = null) => {
    try {
      if (!priestId || !bookingDate || !bookingTime) {
        return { hasConflict: false };
      }

      const dateStr = bookingDate instanceof Date ? bookingDate.toISOString() : bookingDate;
      let timeStr = bookingTime;
      
      if (typeof bookingTime === 'string' && !bookingTime.includes('T')) {
        const timeParts = bookingTime.split(':');
        if (timeParts.length >= 2) {
          const tempDate = new Date();
          tempDate.setHours(parseInt(timeParts[0], 10));
          tempDate.setMinutes(parseInt(timeParts[1], 10));
          tempDate.setSeconds(0);
          tempDate.setMilliseconds(0);
          timeStr = tempDate.toISOString();
        }

      } else if (bookingTime instanceof Date) {
        timeStr = bookingTime.toISOString();
      }

      const response = await axios.post(`${API_URL}/checkPriestConflict`, {
        priest_id: priestId,
        date: dateStr,
        time: timeStr,
        transaction_id: transactionId
      });

      return response.data;

    } catch (error) {
      console.error("Error checking priest conflict:", error);
      return { hasConflict: false, error: error.message };
    }
  };

  const handleStatusUpdate = async (bookingId, bookingType, newStatus, comment = null) => {
    try {
      if (newStatus === "confirmed") {
        const bookingToUpdate = bookings.find(
          (b) => b.transaction_id === bookingId && b.bookingType === bookingType
        );

        if (bookingToUpdate && isBookingDatePast(bookingToUpdate)) {
          message.error("Cannot confirm booking that is past its scheduled date.");
          return;
        }

        // Only check for priest if not coming from quick action (which will have its own check)
        if (!comment && !selectedPriestId) {
          message.warning("Please select a priest before confirming the booking.");
          return;
        }

        // Check for priest conflict before assigning
        if (selectedPriestId && bookingToUpdate) {
          const conflictCheck = await checkPriestConflict(
            selectedPriestId,
            bookingToUpdate.date,
            bookingToUpdate.time,
            bookingId
          );

          if (conflictCheck.hasConflict) {
            message.error(conflictCheck.message || "This priest already has a booking at this time. Please select a different priest or time.");
            return;
          }
        }
      }

      setUpdateLoading(true);
      const endpointMap = {
        Wedding: "updateWeddingStatus",
        Baptism: "updateBaptismStatus",
        Burial: "updateBurialStatus",
        Communion: "updateCommunionStatus",
        Confirmation: "updateConfirmationStatus",
        Anointing: "updateAnointingStatus",
        Confession: "updateConfessionStatus",
      };

      const endpoint = endpointMap[bookingType];
      if (!endpoint) {
        message.error("Invalid booking type");
        return;
      }

      const selectedPriest = priests.find(p => p.uid === selectedPriestId);
      const commentToUse = comment !== null ? comment : (adminComment || null);

      await axios.put(`${API_URL}/${endpoint}`, {
        transaction_id: bookingId,
        status: newStatus,
        priest_id: newStatus === "confirmed" ? selectedPriestId : null,
        priest_name: newStatus === "confirmed" && selectedPriest ? selectedPriest.full_name : null,
        admin_comment: commentToUse,
      });

      if (newStatus === "confirmed") {
        await Logger.logApproveBooking(bookingId, bookingType);

      } else if (newStatus === "cancelled" || newStatus === "rejected") {
        await Logger.logRejectBooking(bookingId, bookingType);

      } else {
        await Logger.logUpdateBooking(bookingId, bookingType, { status: newStatus });
      }

      message.success(`Booking ${newStatus === "confirmed" ? "confirmed" : newStatus === "cancelled" ? "cancelled" : "updated"} successfully.`);
      fetchAllBookings();
      setDetailModalVisible(false);
      setSelectedPriestId(null);
      setAdminComment("");
      setConfirmModalVisible(false);
      setPendingAction(null);
      setQuickComment("");

    } catch (error) {
      console.error("Error updating booking status:", error);
      message.error("Failed to update booking status. Please try again.");

    } finally {
      setUpdateLoading(false);
    }
  };

  const autoRejectPastDueBookings = async (allBookings) => {
    const endpointMap = {
      Wedding: "updateWeddingStatus",
      Baptism: "updateBaptismStatus",
      Burial: "updateBurialStatus",
      Communion: "updateCommunionStatus",
      Confirmation: "updateConfirmationStatus",
      Anointing: "updateAnointingStatus",
      Confession: "updateConfessionStatus",
    };

    const pastDuePendingBookings = allBookings.filter(
      (booking) => booking.status === "pending" && isBookingDatePast(booking)
    );

    if (pastDuePendingBookings.length === 0) {
      return 0;
    }

    const rejectionPromises = pastDuePendingBookings.map(async (booking) => {
      try {
        const endpoint = endpointMap[booking.bookingType];
        if (!endpoint) {
          console.error(`Invalid booking type: ${booking.bookingType}`);
          return false;
        }

        await axios.put(`${API_URL}/${endpoint}`, {
          transaction_id: booking.transaction_id,
          status: "cancelled",
          priest_id: null,
          priest_name: null,
          admin_comment: "Automatically rejected due to past due date",
        });

        await Logger.logRejectBooking(booking.transaction_id, booking.bookingType);
        return true;
        
      } catch (error) {
        console.error(`Error auto-rejecting booking ${booking.transaction_id}:`, error);
        return false;
      }
    });

    await Promise.all(rejectionPromises);
    return pastDuePendingBookings.length;
  };

  const handleQuickAction = (bookingId, bookingType, status) => {
    if (status === "confirmed") {
      const bookingToUpdate = bookings.find(
        (b) => b.transaction_id === bookingId && b.bookingType === bookingType
      );

      if (bookingToUpdate && isBookingDatePast(bookingToUpdate)) {
        message.error("Cannot confirm booking that is past its scheduled date.");
        return;
      }
    }
    setPendingAction({ bookingId, bookingType, status });
    setConfirmModalVisible(true);
    setQuickComment("");
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.status === "confirmed" && !selectedPriestId) {
      message.warning("Please select a priest before confirming the booking.");
      return;
    }

    await handleStatusUpdate(
      pendingAction.bookingId,
      pendingAction.bookingType,
      pendingAction.status,
      quickComment || null
    );
  };

  const handleEditBooking = async (values) => {
    if (!selectedBooking) return;

    try {
      setEditLoading(true);

      const endpointMap = {
        Wedding: "updateWedding",
        Baptism: "updateBaptism",
        Burial: "updateBurial",
        Communion: "updateCommunion",
        Confirmation: "updateConfirmation",
        Anointing: "updateAnointing",
        Confession: "updateConfession",
      };

      const endpoint = endpointMap[selectedBooking.bookingType];
      if (!endpoint) {
        message.error("Invalid booking type");
        return;
      }

      // Handle time formatting - editTime is a dayjs object
      let timeString = selectedBooking.time;
      if (editTime) {
        const timeValue = editTime.toDate();
        timeString = `${timeValue.getHours().toString().padStart(2, '0')}:${timeValue.getMinutes().toString().padStart(2, '0')}`;
      }

      // Handle date formatting - editDate is a dayjs object
      let dateISO = selectedBooking.date;
      if (editDate) {
        dateISO = editDate.toDate().toISOString();
      }

      const updateData = {
        transaction_id: selectedBooking.transaction_id,
        date: dateISO,
        time: timeString,
      };

      await axios.put(`${API_URL}/${endpoint}`, updateData);

      await Logger.logUpdateBooking(selectedBooking.transaction_id, selectedBooking.bookingType, {
        date: dateISO,
        time: timeString,
      });

      message.success("Booking updated successfully!");
      setEditModalVisible(false);
      editForm.resetFields();
      setEditDate(null);
      setEditTime(null);
      fetchAllBookings();
      setDetailModalVisible(false);
      setSelectedBooking(null);

    } catch (error) {
      console.error("Error updating booking:", error);
      message.error(error.response?.data?.message || "Failed to update booking. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "orange", icon: <ClockCircleOutlined />, text: "Pending" },
      confirmed: { color: "green", icon: <CheckCircleOutlined />, text: "Confirmed" },
      cancelled: { color: "red", icon: <CloseCircleOutlined />, text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getTypeTag = (type) => {
    const colorMap = {
      Wedding: "purple",
      Baptism: "blue",
      Burial: "gray",
      Communion: "cyan",
      Confirmation: "geekblue",
      Anointing: "orange",
      Confession: "magenta",
    };

    return <Tag color={colorMap[type] || "default"}>{type}</Tag>;
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getName = (booking) => {
    if (booking.bookingType === "Wedding") {
      return `${booking.groom_first_name || ""} ${booking.groom_last_name || ""} & ${booking.bride_first_name || ""} ${booking.bride_last_name || ""}`.trim();

    } else if (booking.bookingType === "Burial") {
      return (
        booking.deceased_name ||
        booking.name ||
        booking.user?.name ||
        booking.full_name ||
        `${booking.first_name || ""} ${booking.last_name || ""}`.trim() ||
        "N/A"
      );

    } else {
      // For other booking types including Confession, prioritize user object with first_name/last_name
      // This ensures profile updates are reflected immediately
      if (booking.user) {
        // Try to construct name from first_name, middle_name, last_name
        const userFullName = `${booking.user.first_name || ""} ${booking.user.middle_name || ""} ${booking.user.last_name || ""}`.trim();
        if (userFullName) return userFullName;
        // Fallback to user.name if it exists
        if (booking.user.name) return booking.user.name;
      }
      // Fallback to other fields
      return booking.name || booking.full_name || `${booking.first_name || ""} ${booking.last_name || ""}`.trim() || "N/A";
    }
  };

  const getEmail = (booking) => {
    return booking.user?.email || booking.email || "N/A";
  };

  const isBookingDatePast = (booking) => {
    if (!booking.date) return false;
    const bookingDate = new Date(booking.date);
    if (isNaN(bookingDate.getTime())) return false;

    if (booking.time) {
      const timeStr = String(booking.time).trim();
      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\.[\d]+)?$/);

      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        bookingDate.setHours(hours, minutes, 0, 0);
      }
    }

    const now = new Date();
    now.setSeconds(0, 0);
    return bookingDate < now;
  };

  const formatTimeOnly = (timeValue) => {
    if (timeValue === null || timeValue === undefined || timeValue === '') {
      return "N/A";
    }

    const timeStr = String(timeValue).trim();

    if (!timeStr || timeStr === 'null' || timeStr === 'undefined' || timeStr === 'NaN') {
      return "N/A";
    }

    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\.[\d]+)?$/);
    if (timeMatch) {
      const hours24 = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);

      if (!isNaN(hours24) && !isNaN(minutes) && hours24 >= 0 && hours24 <= 23 && minutes >= 0 && minutes <= 59) {
        const hours = hours24 % 12 || 12;
        const ampm = hours24 >= 12 ? "PM" : "AM";

        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
      }
    }

    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime()) && date instanceof Date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
      }

    } catch (e) {
      // If date parsing fails, continue to return original or N/A
    }

    console.warn('Unable to format time value:', timeValue, 'type:', typeof timeValue);
    return "N/A";
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "bookingType",
      key: "bookingType",
      render: (type) => getTypeTag(type),
      width: 80,
    },
    {
      title: "Name",
      key: "name",
      width: 120,
      render: (_, record) => <Text strong>{getName(record)}</Text>,
    },
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      width: 130,
      render: (id) => <Text code>{id || "N/A"}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 130,
      render: (date, record) => {
        if (!date) return "N/A";
        const d = new Date(date);
        const dateStr = d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const isPast = isBookingDatePast(record);
        return (
          <Space>
            <span>{dateStr}</span>
            {isPast && (
              <Tag color="red" style={{ margin: 0 }}>
                Past Date
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: 70,
      render: (_, record) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Time value for record:', record.transaction_id, 'time:', record.time, 'type:', typeof record.time);
        }
        return <span>{formatTimeOnly(record.time)}</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      width: 70,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
      width: 130,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/* View Details */}
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              className="border-btn"
              style={{ padding: '8px' }}
              onClick={() => {
                setSelectedBooking(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>

          {record.status === "pending" && (
            <>
              {isBookingDatePast(record) ? (
                <Tooltip title="Cannot confirm booking that is past its scheduled date">
                  <Button
                    type="link"
                    icon={<CheckOutlined />}
                    className="cancelborder-btn"
                    style={{ padding: '8px' }}
                    disabled
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Confirm Booking">
                  <Button
                    type="link"
                    icon={<CheckOutlined />}
                    className="border-btn"
                    style={{ padding: '8px' }}
                    onClick={() => handleQuickAction(record.transaction_id, record.bookingType, "confirmed")}
                    loading={updateLoading}
                  />
                </Tooltip>
              )}

              <Tooltip title="Cancel Booking">
                <Button
                  type="link"
                  icon={<CloseOutlined />}
                  className="dangerborder-btn"
                  style={{ padding: '8px' }}

                  onClick={() => handleQuickAction(record.transaction_id, record.bookingType, "cancelled")}
                  loading={updateLoading}
                />
              </Tooltip>
            </>
          )}
        </Space>

      ),
      width: 80,
    },
  ];

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    const details = [];
    Object.keys(selectedBooking).forEach((key) => {
      if (["_id", "__v", "bookingType", "typeLabel", "priest_id", "user", "uid", "createdAt", "updatedAt"].includes(key)) return;
      const value = selectedBooking[key];

      if (value !== null && value !== undefined && value !== "") {
        details.push({ key, value });
      }
    });

    return (
      <div style={{
        height: '600px',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: '100%',
      }}>
        <Row gutter={[16, 16]}>
          {/* Booking Type */}
          <Col span={24}>
            <Text strong>Booking Type:</Text>
            <div>{getTypeTag(selectedBooking.bookingType)}</div>
          </Col>

          {/* Status */}
          <Col span={24}>
            <Text strong>Status:</Text>
            <div>{getStatusTag(selectedBooking.status)}</div>
          </Col>

          {/* Priest Assignment - Show when confirming pending booking */}
          {selectedBooking?.status === "pending" && (
            <Col span={24}>
              <Text strong>Assign Priest:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Select a priest"
                value={selectedPriestId}
                onChange={(value) => setSelectedPriestId(value)}
                loading={loadingPriests}
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toLowerCase() ?? '').includes(input.toLowerCase())
                }
              >
                {priests.map((priest) => (
                  <Option key={priest.uid} value={priest.uid}>
                    {priest.full_name}
                  </Option>
                ))}
              </Select>
              {selectedBooking.priest_name && (
                <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                  Currently assigned: {selectedBooking.priest_name}
                </Text>
              )}
            </Col>
          )}

          {/* Show assigned priest if confirmed */}
          {selectedBooking?.status === "confirmed" && selectedBooking.priest_name && (
            <Col span={24}>
              <Text strong>Assigned Priest:</Text>
              <div>{selectedBooking.priest_name}</div>
            </Col>
          )}

          {/* Admin Comment Input - Show when confirming or cancelling pending booking */}
          {selectedBooking?.status === "pending" && (
            <Col span={24}>
              <Text strong>Admin Comment (Optional):</Text>
              <Input.TextArea
                rows={4}
                placeholder="Add a comment for the user (optional)"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                style={{ marginTop: 8 }}
                maxLength={500}
                showCount
              />
            </Col>
          )}

          {/* Show admin comment if booking is confirmed or cancelled and has a comment */}
          {(selectedBooking?.status === "confirmed" || selectedBooking?.status === "cancelled") && selectedBooking?.admin_comment && (
            <Col span={24}>
              <Text strong>Admin Comment:</Text>
              <div style={{
                marginTop: 8,
                padding: 12,
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
                border: '1px solid #d9d9d9',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}>
                {selectedBooking.admin_comment}
              </div>
            </Col>
          )}

          {/* Payment Method */}
          {selectedBooking?.payment_method && (
            <Col span={12}>
              <Text strong>
                <PhoneOutlined style={{ marginRight: 8 }} />
                Payment Method:
              </Text>
              <div>
                <Tag color={selectedBooking.payment_method === 'gcash' ? 'green' : 'blue'}>
                  {selectedBooking.payment_method === 'gcash' ? 'GCash' : 'In-Person Payment'}
                </Tag>
              </div>
            </Col>
          )}

          {/* Amount */}
          {selectedBooking?.amount !== undefined && selectedBooking?.amount !== null && (
            <Col span={12}>
              <Text strong>
                <DollarOutlined style={{ marginRight: 8 }} />
                Amount:
              </Text>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                ₱{parseFloat(selectedBooking.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </Col>
          )}

          {/* Name */}
          <Col span={12}>
            <Text strong>Name:</Text>
            <div>{getName(selectedBooking)}</div>
          </Col>

          {/* Email */}
          <Col span={12}>
            <Text strong>Email:</Text>
            <div>{getEmail(selectedBooking)}</div>
          </Col>

          {/* Wedding Images Section */}
          {selectedBooking?.bookingType === "Wedding" && (
            <>
              {selectedBooking?.groom_pic && (
                <Col span={12}>
                  <Text strong>Groom Photo:</Text>
                  <div style={{ marginTop: 8 }}>
                    {(() => {
                      let imageUrl = selectedBooking.groom_pic;
                      if (!imageUrl.startsWith('http')) {
                        const { data } = supabase.storage.from('bookings').getPublicUrl(selectedBooking.groom_pic);
                        imageUrl = data?.publicUrl || `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${selectedBooking.groom_pic}`;
                      }
                      return (
                        <img
                          src={imageUrl}
                          alt="Groom Photo"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            borderRadius: 8,
                            border: '1px solid #d9d9d9',
                            cursor: 'pointer',
                            objectFit: 'cover',
                          }}
                          onClick={() => {
                            setSelectedImageUrl(imageUrl);
                            setSelectedImageTitle('Groom Photo');
                            setImageModalVisible(true);
                          }}
                          onError={(e) => {
                            console.error('Error loading groom photo:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      );
                    })()}
                  </div>
                </Col>
              )}
              {selectedBooking?.bride_pic && (
                <Col span={12}>
                  <Text strong>Bride Photo:</Text>
                  <div style={{ marginTop: 8 }}>
                    {(() => {
                      let imageUrl = selectedBooking.bride_pic;
                      if (!imageUrl.startsWith('http')) {
                        const { data } = supabase.storage.from('bookings').getPublicUrl(selectedBooking.bride_pic);
                        imageUrl = data?.publicUrl || `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${selectedBooking.bride_pic}`;
                      }
                      return (
                        <img
                          src={imageUrl}
                          alt="Bride Photo"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            borderRadius: 8,
                            border: '1px solid #d9d9d9',
                            cursor: 'pointer',
                            objectFit: 'cover',
                          }}
                          onClick={() => {
                            setSelectedImageUrl(imageUrl);
                            setSelectedImageTitle('Bride Photo');
                            setImageModalVisible(true);
                          }}
                          onError={(e) => {
                            console.error('Error loading bride photo:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      );
                    })()}
                  </div>
                </Col>
              )}
            </>
          )}

          {/* Burial-specific deceased information section */}
          {selectedBooking?.bookingType === "Burial" && (
            <>
              {selectedBooking?.deceased_name && (
                <Col span={12}>
                  <Text strong>Deceased Name:</Text>
                  <div>{selectedBooking.deceased_name}</div>
                </Col>
              )}
              {selectedBooking?.deceased_age && (
                <Col span={12}>
                  <Text strong>Deceased Age:</Text>
                  <div>{selectedBooking.deceased_age}</div>
                </Col>
              )}
              {selectedBooking?.deceased_civil_status && (
                <Col span={12}>
                  <Text strong>Civil Status:</Text>
                  <div>{selectedBooking.deceased_civil_status}</div>
                </Col>
              )}
              {selectedBooking?.requested_by && (
                <Col span={12}>
                  <Text strong>Requested By:</Text>
                  <div>{selectedBooking.requested_by}</div>
                </Col>
              )}
              {selectedBooking?.relationship_to_deceased && (
                <Col span={12}>
                  <Text strong>Relationship to Deceased:</Text>
                  <div>{selectedBooking.relationship_to_deceased}</div>
                </Col>
              )}
              {selectedBooking?.address && (
                <Col span={24}>
                  <Text strong>Address:</Text>
                  <div>{selectedBooking.address}</div>
                </Col>
              )}
              {selectedBooking?.place_of_mass && (
                <Col span={12}>
                  <Text strong>Place of Mass:</Text>
                  <div>{selectedBooking.place_of_mass}</div>
                </Col>
              )}
              {selectedBooking?.mass_address && (
                <Col span={12}>
                  <Text strong>Mass Address:</Text>
                  <div>{selectedBooking.mass_address}</div>
                </Col>
              )}
            </>
          )}

          {/* Dynamic details */}
          {(() => {
            let addressShown = false;
            let godparentsShown = false;

            return details.map(({ key, value }) => {
              if (['payment_method', 'amount', 'proof_of_payment', 'full_name', 'email', 'groom_pic', 'bride_pic',
                'deceased_name', 'deceased_age', 'deceased_civil_status', 'requested_by',
                'relationship_to_deceased', 'address', 'place_of_mass', 'mass_address'].includes(key)) return null;

              if (selectedBooking?.bookingType === "Baptism" && [
                'main_godfather_first_name',
                'main_godfather_middle_name',
                'main_godfather_last_name',
                'main_godmother_first_name',
                'main_godmother_middle_name',
                'main_godmother_last_name',
                'main_godfather',
                'main_godmother'
              ].includes(key)) return null;

              const isAddressField = key === 'address';
              const showGodparentsAfterAddress = isAddressField && selectedBooking?.bookingType === "Baptism" && !godparentsShown;

              if (isAddressField) addressShown = true;
              if (showGodparentsAfterAddress) godparentsShown = true;

              const isImageField = typeof value === "string" && (
                value.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                key.toLowerCase().includes('pic') ||
                key.toLowerCase().includes('photo') ||
                key.toLowerCase().includes('image')
              );

              return (
                <Fragment key={key}>
                  <Col span={12}>
                    <Text strong>
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                    </Text>

                    <div style={{ marginTop: 4 }}>
                      {key === "date" || key === "candidate_birthday" ? (
                        formatDateOnly(value)
                      ) : key === "time" ? (
                        formatTimeOnly(value)
                      ) : typeof value === "string" && value.toLowerCase().endsWith(".pdf") ? (
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            window.open(
                              `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${value}`,
                              "_blank"
                            )
                          }
                        >
                          View PDF
                        </Button>
                      ) : isImageField ? (
                        <div>
                          {(() => {
                            let imageUrl = value;
                            if (!imageUrl.startsWith('http')) {
                              const { data } = supabase.storage.from('bookings').getPublicUrl(value);
                              imageUrl = data?.publicUrl || `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${value}`;
                            }
                            return (
                              <img
                                src={imageUrl}
                                alt={key.replace(/_/g, " ")}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '200px',
                                  borderRadius: 8,
                                  border: '1px solid #d9d9d9',
                                  cursor: 'pointer',
                                  objectFit: 'cover',
                                }}
                                onClick={() => {
                                  setSelectedImageUrl(imageUrl);
                                  setSelectedImageTitle(key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));
                                  setImageModalVisible(true);
                                }}
                                onError={(e) => {
                                  console.error(`Error loading ${key} image:`, e);
                                  e.target.style.display = 'none';
                                }}
                              />
                            );
                          })()}
                        </div>
                      ) : typeof value === "boolean" ? (
                        value ? "Yes" : "No"
                      ) : Array.isArray(value) ? (
                        <ul style={{ paddingLeft: 20 }}>
                          {value.map((v, i) => (
                            <li key={i}>{v}</li>
                          ))}
                        </ul>
                      ) : typeof value === "object" ? (
                        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(value, null, 2)}</pre>
                      ) : (
                        String(value)
                      )}
                    </div>
                  </Col>

                  {/* Show godparents after address field for Baptism */}
                  {showGodparentsAfterAddress && (
                    <>
                      {/* Main Godfather - Only First Name */}
                      {selectedBooking.main_godfather_first_name && (
                        <Col span={12}>
                          <Text strong>Main Godfather Name:</Text>
                          <div>{selectedBooking.main_godfather_first_name}</div>
                          {selectedBooking.main_godfather?.relationship && (
                            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                              Relationship: {selectedBooking.main_godfather.relationship}
                            </Text>
                          )}
                        </Col>
                      )}

                      {/* Main Godmother - Only First Name */}
                      {selectedBooking.main_godmother_first_name && (
                        <Col span={12}>
                          <Text strong>Main Godmother Name:</Text>
                          <div>{selectedBooking.main_godmother_first_name}</div>
                          {selectedBooking.main_godmother?.relationship && (
                            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                              Relationship: {selectedBooking.main_godmother.relationship}
                            </Text>
                          )}
                        </Col>
                      )}
                    </>
                  )}
                </Fragment>
              );
            });
          })()}

          {/* Proof of Payment Section */}
          {selectedBooking?.payment_method === 'gcash' && selectedBooking?.proof_of_payment && (
            <Col span={24}>
              <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                <Text strong>
                  <FileImageOutlined style={{ marginRight: 8 }} />
                  Proof of Payment:
                </Text>
                <div style={{ marginTop: 12 }}>
                  {(() => {
                    let imageUrl = selectedBooking.proof_of_payment;
                    if (!imageUrl.startsWith('http')) {
                      const { data } = supabase.storage.from('bookings').getPublicUrl(selectedBooking.proof_of_payment);
                      imageUrl = data?.publicUrl || `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${selectedBooking.proof_of_payment}`;
                    }
                    return (
                      <img
                        src={imageUrl}
                        alt="Proof of Payment"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: 8,
                          border: '1px solid #d9d9d9',
                          cursor: 'pointer',
                        }}
                        onClick={() => window.open(imageUrl, '_blank')}
                        onError={(e) => {
                          console.error('Error loading proof of payment image:', e);
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.innerHTML = '<Text type="secondary">Failed to load proof of payment image</Text>';
                          e.target.parentElement.appendChild(errorDiv);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
          }
        }
      `}</style>
      <div style={{ maxWidth: "95%", margin: "0 auto", marginTop: 20 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Title level={2} style={{ margin: 0, color: "#262626", fontFamily: 'Poppins' }}>
                  Booking Pending Requests
                </Title>
                {isPolling && (
                  <Tag color="green" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: 'Poppins',
                    fontWeight: 500
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#52c41a",
                      display: "inline-block",
                      boxShadow: "0 0 0 0 rgba(82, 196, 26, 1)",
                      animation: "pulse 2s infinite",
                    }}></span>
                    Live
                  </Tag>
                )}
              </div>
              <Text type="secondary" style={{ fontSize: 16, fontFamily: 'Poppins', display: 'block', marginTop: 4 }}>
                Manage and track all booking requests
                {lastUpdateTime && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
                    • Last updated: {lastUpdateTime.toLocaleTimeString()}
                  </span>
                )}
              </Text>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateBookingModalVisible(true)}
                className="border-btn"
              >
                Create Booking
              </Button>
            </Space>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Bookings"
                value={stats.total}
                prefix={<CalendarOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Confirmed"
                value={stats.confirmed}
                prefix={<CheckCircleOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Cancelled"
                value={stats.cancelled}
                prefix={<CloseCircleOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Search by name, transaction ID, or contact..."
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
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{
                  width: '100%',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  padding: '8px 12px',
                  height: '42px',
                }}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"

              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{
                  width: '100%',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  padding: '8px 12px',
                  height: '42px',
                }} value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Filter by type"
              >
                <Option value="all">All Types</Option>
                <Option value="Anointing">Anointing</Option>
                <Option value="Baptism">Baptism</Option>
                <Option value="Burial">Burial</Option>
                <Option value="Communion">Communion</Option>
                <Option value="Confession">Confession</Option>
                <Option value="Confirmation">Confirmation</Option>
                <Option value="Wedding">Wedding</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{
                  width: '100%',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  padding: '8px 12px',
                  height: '42px',
                }}
                value={monthFilter}
                onChange={setMonthFilter}
                placeholder="Filter by month"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {getMonthOptions().map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Bookings Table with Date Filter Tabs */}
        <Card>
          <Tabs
            activeKey={dateFilterTab}
            onChange={setDateFilterTab}
            style={{ marginBottom: 16 }}
            items={[
              {
                key: "all",
                label: `All Bookings (${bookings.length})`,
              },
              {
                key: "active",
                label: `Active (Upcoming) (${bookings.filter((b) => !isBookingDatePast(b)).length})`,
              },
              {
                key: "past",
                label: `Past Date (${bookings.filter((b) => isBookingDatePast(b)).length})`,
              },
            ]}
          />
          <Table
            columns={columns}
            dataSource={filteredBookings}
            rowKey={(record) => `${record.bookingType}-${record.transaction_id || record._id}`}
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} bookings`,
            }}
            scroll={{ y: 600 }}
            locale={{
              emptyText: <Empty description="No bookings found" />,
            }}
          />
        </Card>

        {/* Booking Detail Modal */}
        <Modal
          title="Booking Details"
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedBooking(null);
            setSelectedPriestId(null);
            setAdminComment("");
          }}
          footer={[
            selectedBooking?.status === "pending" && (
              <Button
                key="cancel"
                className="cancelborder-btn"
                style={{ padding: '10px' }}
                onClick={() => handleStatusUpdate(selectedBooking.transaction_id, selectedBooking.bookingType, "cancelled")}
                loading={updateLoading}
              >
                Cancel Booking
              </Button>
            ),
            selectedBooking?.status === "pending" && (
              <Button
                key="edit"
                className="border-btn"
                style={{ padding: '10px' }}
                icon={<EditOutlined />}
                onClick={() => {
                  setEditModalVisible(true);
                  // Initialize form with current booking data
                  const bookingDate = selectedBooking.date ? dayjs(selectedBooking.date) : null;
                  const bookingTime = selectedBooking.time ? dayjs(selectedBooking.time, 'HH:mm') : null;
                  setEditDate(bookingDate);
                  setEditTime(bookingTime);
                  // Only initialize date and time fields
                  editForm.setFieldsValue({});
                }}
              >
                Edit Booking
              </Button>
            ),
            selectedBooking?.status === "pending" && (
              isBookingDatePast(selectedBooking) ? (
                <Tooltip key="confirm-disabled" title="Cannot confirm booking that is past its scheduled date">
                  <Button
                    type="primary"
                    style={{ backgroundColor: "#d9d9d9", borderColor: "#d9d9d9" }}
                    disabled
                  >
                    Confirm Booking
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  key="confirm"
                  className="filled-btn"
                  style={{ padding: '10px' }}
                  onClick={() => handleStatusUpdate(selectedBooking.transaction_id, selectedBooking.bookingType, "confirmed")}
                  loading={updateLoading}
                >
                  Confirm Booking
                </Button>
              )
            )
          ].filter(Boolean)}
          width={800}
        >
          {renderBookingDetails()}
        </Modal>

        {/* Image View Modal */}
        <Modal
          title={selectedImageTitle}
          open={imageModalVisible}
          onCancel={() => {
            setImageModalVisible(false);
            setSelectedImageUrl(null);
            setSelectedImageTitle('');
          }}
          footer={[
            <Button key="close" onClick={() => {
              setImageModalVisible(false);
              setSelectedImageUrl(null);
              setSelectedImageTitle('');
            }}>
              Close
            </Button>,
            <Button
              key="open"
              type="primary"
              onClick={() => {
                if (selectedImageUrl) {
                  window.open(selectedImageUrl, '_blank');
                }
              }}
            >
              Open in New Tab
            </Button>,
          ]}
          width={800}
          centered
        >
          {selectedImageUrl && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <img
                src={selectedImageUrl}
                alt={selectedImageTitle}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: 8,
                  border: '1px solid #d9d9d9',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  console.error('Error loading image in modal:', e);
                  e.target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.innerHTML = '<Text type="secondary">Failed to load image</Text>';
                  e.target.parentElement.appendChild(errorDiv);
                }}
              />
            </div>
          )}
        </Modal>

        {/* Create Booking Modal */}
        <Modal
          title="Create New Booking"
          open={createBookingModalVisible}
          onCancel={() => {
            setCreateBookingModalVisible(false);
            setSelectedBookingType(null);
          }}
          footer={null}
          width={900}
          style={{ top: 20 }}
        >
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ marginRight: 8 }}>Select Sacrament:</Text>
            <Select
              style={{ width: 200 }}
              placeholder="Choose a sacrament"
              value={selectedBookingType}
              onChange={setSelectedBookingType}
            >
              <Option value="Anointing">Anointing</Option>
              <Option value="Baptism">Baptism</Option>
              <Option value="Burial">Burial</Option>
              <Option value="Communion">Communion</Option>
              <Option value="Confession">Confession</Option>
              <Option value="Confirmation">Confirmation</Option>
              <Option value="Wedding">Wedding</Option>
            </Select>
          </div>

          {selectedBookingType && (
            <AdminBookingForm
              bookingType={selectedBookingType}
              onSuccess={() => {
                setCreateBookingModalVisible(false);
                setSelectedBookingType(null);
                fetchAllBookings();
              }}
              onCancel={() => {
                setCreateBookingModalVisible(false);
                setSelectedBookingType(null);
              }}
            />
          )}

          {!selectedBookingType && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <Text type="secondary">Please select a sacrament type to create a booking</Text>
            </div>
          )}
        </Modal>

        {/* Quick Action Confirmation Modal */}
        <Modal
          title={pendingAction?.status === "confirmed" ? "Confirm Booking" : "Cancel Booking"}
          open={confirmModalVisible}
          onCancel={() => {
            setConfirmModalVisible(false);
            setPendingAction(null);
            setQuickComment("");
            setSelectedPriestId(null);
          }}
          onOk={handleConfirmAction}
          okText={pendingAction?.status === "confirmed" ? "Confirm" : "Cancel Booking"}
          okButtonProps={{
            className: pendingAction?.status === "confirmed" ? "filled-btn" : "cancelborder-btn",
            loading: updateLoading,
          }}
          cancelButtonProps={{ className: "border-btn" }}
          width={500}
        >
          {pendingAction?.status === "confirmed" && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>Assign Priest:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Select a priest"
                value={selectedPriestId}
                onChange={(value) => setSelectedPriestId(value)}
                loading={loadingPriests}
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toLowerCase() ?? '').includes(input.toLowerCase())
                }
              >
                {priests.map((priest) => (
                  <Option key={priest.uid} value={priest.uid}>
                    {priest.full_name}
                  </Option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <Text strong>Admin Comment (Optional):</Text>
            <Input.TextArea
              rows={4}
              placeholder="Add a comment for the user (optional)"
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              style={{ marginTop: 8, marginBottom: 30 }}
              maxLength={500}
              showCount
            />
          </div>
        </Modal>

        {/* Edit Booking Modal */}
        <Modal
          title="Edit Booking"
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            editForm.resetFields();
            setEditDate(null);
            setEditTime(null);
          }}
          footer={null}
          width={700}
        >
          {selectedBooking && (
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleEditBooking}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Date"
                    rules={[{ required: true, message: 'Please select date' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      value={editDate}
                      onChange={(value) => setEditDate(value ? dayjs(value) : null)}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Time"
                    rules={[{ required: true, message: 'Please select time' }]}
                  >
                    <TimePicker
                      style={{ width: '100%' }}
                      value={editTime}
                      onChange={(value) => setEditTime(value ? dayjs(value) : null)}
                      format="h:mm A"
                      minuteStep={10}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={editLoading}>
                    Update Booking
                  </Button>
                  <Button onClick={() => {
                    setEditModalVisible(false);
                    editForm.resetFields();
                    setEditDate(null);
                    setEditTime(null);
                  }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
}
