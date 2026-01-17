import React, { useContext, useEffect, useState } from "react";
import { FloatButton, Modal, Select, Tag, Input, Upload, message } from "antd";
import {
  CommentOutlined,
  HeartOutlined,
  PlusOutlined,
  CalendarOutlined,
  CopyOutlined,
  UploadOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import QRCodeImg from "../assets/qr-codes/qr-1.png";
import "../styles/donationModal.css";
import Cookies from "js-cookie";
import axios from "axios";

import { API_URL } from "../Constants";
import { NavbarContext } from "../context/AllContext";
import SignInAlert from "./SignInAlert";

import ChatBot from "./ChatBot";

const { TextArea } = Input;

const FloatingButton = () => {
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDonateFormOpen, setIsDonateFormOpen] = useState(false);

  const uid = Cookies.get("uid");

  const [filter, setFilter] = useState("All");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoginRequiredOpen, setIsLoginRequiredOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("GCash");
  const [receiptFile, setReceiptFile] = useState(null);
  const { setShowSignin } = useContext(NavbarContext);

  const [showSignInAlert, setShowSignInAlert] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);

  async function createDonation() {
    if (!uid) {
      setShowSignInAlert(true);
      return;
    }

    if (selectedType === "GCash" && !receiptFile) {
      message.warning("Please upload your GCash receipt.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("uid", uid);
      formData.append("amount", amount);
      formData.append("paymentMethod", selectedType);
      formData.append("intercession", description || "");

      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      const res = await axios.post(`${API_URL}/createDonation`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Donation submitted successfully!");
      setIsDonateFormOpen(false);
      setReceiptFile(null);
      getUserDonations();

      console.log("Donation response:", res.data);
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message || "Donation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function getUserDonations() {
    if (!uid) {
      setError("User not logged in.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API_URL}/getUserDonations`, {
        uid: uid,
      });

      const donationsData = res.data.donations || [];

      setDonations(donationsData);

      const total = donationsData.reduce((sum, item) => {
        return sum + Number(item.amount || 0);
      }, 0);

      setTotalAmount(total);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch donations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isHistoryOpen) {
      getUserDonations();
    }
  }, [isHistoryOpen, uid]);

  const donationHistory = donations.filter((item) => {
    if (filter === "All") return true;
    return item.status?.toLowerCase() === filter.toLowerCase();
  });

  const handleCopyPhoneNumber = () => {
    navigator.clipboard.writeText("09123456789");
    message.success("Phone number copied!");
  };

  const handleOpenDonateForm = () => {
    setIsHistoryOpen(false);
    setIsDonateFormOpen(true);
  };

  return (
    <>
      <FloatButton.Group
        trigger="click"
        style={{ right: 24, bottom: 24 }}
        icon={<PlusOutlined />}
      >
        <FloatButton
          icon={<CommentOutlined />}
          tooltip={<div>Chat</div>}
          onClick={() => setIsChatOpen(!isChatOpen)}
        />
        <FloatButton
          icon={<HeartOutlined />}
          tooltip={<div>Donate</div>}
          onClick={() => {
            if (!uid) {
              setIsLoginRequiredOpen(true);
            } else {
              setIsHistoryOpen(true);
            }
          }}
        />
      </FloatButton.Group>

      <Modal
        open={isLoginRequiredOpen}
        onCancel={() => setIsLoginRequiredOpen(false)}
        footer={null}
        centered
        width={350}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <HeartOutlined style={{ fontSize: 40, color: "#ff4d4f" }} />
          <h2 style={{ marginTop: 16, fontWeight: 600, fontSize: 16 }}>Please log in first!</h2>
          <p>You need to be logged in to make or view donations.</p>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <button
              className="cancel-btn"
              onClick={() => setIsLoginRequiredOpen(false)}
            >
              Cancel
            </button>

            <button
              className="confirm-btn"
              onClick={() => {
                setIsLoginRequiredOpen(false);
                setShowSignin(true);
              }}
            >
              Log In
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 1: DONATION HISTORY */}

      <Modal
        title={null}
        open={isHistoryOpen}
        onCancel={() => setIsHistoryOpen(false)}
        footer={null}
        width={450}
        className="donation-modal"
        centered
      >
        <div className="donation-container">
          <h2 className="main-title">Donations</h2>
          <p className="sub-title">View your contribution history.</p>

          <div className="summary-card">
            <div className="progress-line"></div>
            <p>You have donated a total of:</p>
            <h1>
              PHP{" "}
              {totalAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h1>
          </div>

          <div className="history-header">
            <h3 className="history-title">Your Donation History</h3>
            <Select
              value={filter}
              className="filter-dropdown"
              onChange={(value) => setFilter(value)}
              options={[
                { value: "All", label: "All Donations" },
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
              ]}
            />
          </div>

          {/* Scrollable List Container */}
          <div className="history-list scrollable-history">
            {donationHistory.length > 0 ? (
              donationHistory.map((item) => (
                <div
                  key={item.id}
                  className={`history-card ${item.color}-border`}
                >
                  <div className="card-header">
                    <span className="amount">
                      PHP{" "}
                      {Number(item.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>

                    <Tag
                      color={
                        item.status === "confirmed" ? "success" : "warning"
                      }
                    >
                      {item.status.toUpperCase()}
                    </Tag>
                  </div>

                  <div className="card-body">
                    <p className="type">{item.paymentMethod}</p>
                    <p className="date">
                      <CalendarOutlined />{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-history">No records found.</div>
            )}
          </div>

          <button className="make-donation-btn" onClick={handleOpenDonateForm}>
            Make a Donation
          </button>
        </div>
      </Modal>

      {/* MODAL 2: MAKE A DONATION FORM */}
      <Modal
        title={null}
        open={isDonateFormOpen}
        onCancel={() => setIsDonateFormOpen(false)}
        footer={null}
        width={400}
        className="make-donation-form-modal"
        centered
      >
        <div className="form-container">
          <h2 className="form-title">Make a Donation</h2>

          <Input
            prefix="PHP"
            placeholder="0.00"
            className="form-input"
            size="large"
            onChange={(e) => setAmount(e.target.value)}
            value={amount}
          />

          <div className="type-selector">
            {["GCash", "Cash", "In Kind"].map((type) => (
              <button
                key={type}
                className={`type-btn ${selectedType === type ? "active" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <TextArea
            placeholder="Donation Intercession (Optional)"
            rows={3}
            className="form-textarea"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />

          {selectedType === "GCash" && (
            <div className="payment-details-section">
              <h3 className="section-subtitle">GCash Payment Details</h3>
              <div className="phone-display">
                <span style={{ fontWeight: 600 }}>0912 345 6789</span>
                <button onClick={handleCopyPhoneNumber} className="copy-btn">
                  <CopyOutlined />
                </button>
              </div>

              <div className="qr-container">
                <img src={QRCodeImg} alt="Payment QR" className="qr-image" />
              </div>

              <p className="upload-label">Upload Payment Receipt</p>
              <Upload
                maxCount={1}
                accept="image/*"
                beforeUpload={() => false}
                onChange={(info) => {
                  if (info.fileList.length > 0) {
                    setReceiptFile(info.fileList[0].originFileObj);
                  } else {
                    setReceiptFile(null);
                  }
                }}
                className="form-upload"
              >
                <div className="upload-box">
                  <UploadOutlined /> <span>Upload Receipt</span>
                </div>
              </Upload>
            </div>
          )}

          <div className="form-footer">
            <button
              className="cancel-btn"
              onClick={() => setIsDonateFormOpen(false)}
            >
              Cancel
            </button>
            <button
              className="confirm-btn"
              onClick={() => {
                setIsDonateFormOpen(false);
                createDonation();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <SignInAlert
        open={showSignInAlert}
        onClose={() => setShowSignInAlert(false)}
        message="Please sign in to donate."
      />
    </>
  );
};

export default FloatingButton;
