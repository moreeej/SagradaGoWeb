import { useContext, useState } from "react";
import { NavbarContext } from "../../context/AllContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import qr1 from "../../assets/qr-codes/qr-1.png";
import PaymentModal from "../../components/PaymentModal";


export default function PaymentMethod() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [uploading, setIsUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);

  const { getTotalAmount } = useContext(NavbarContext);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const fileExt = file.name.split(".").pop().toLowerCase();
    const fileName = `proof_of_payment_${Date.now()}.${fileExt}`;
    const filePath = `paymentproof/${fileName}`;

    const { error } = await supabase.storage
      .from("paymentproof")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error.message, error);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("paymentproof")
      .getPublicUrl(filePath);

    setPaymentProof(data.publicUrl);

    console.log("Uploaded URL:", data.publicUrl);

    setIsUploading(false);
  };


  const [showModal, setShowModal] = useState(false);

  function handleConfirmPayment() {
    setShowModal(true);
  }

  return (
    <div className="w-full py-7! px-4! flex flex-col items-center gap-3 mt-20! justify-center">
      <div className="p-7! flex flex-col items-center gap-6! rounded-2xl">



        <select
          value={paymentMethod}
          onChange={(e) => {
            const value = e.target.value;
            setPaymentMethod(value);

            if (value === "cash") {
              setPaymentProof(null);
            }
          }}
          className="
    w-64 px-4 py-2
    text-sm text-gray-700
    bg-white border border-black rounded-lg
    shadow-sm cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-blue-400
  "
        >
          <option value="" hidden>Select Payment</option>
          <option value="cash">Cash</option>
          <option value="gcash">GCash</option>
          <option value="paymaya">PayMaya</option>
        </select>

        <h1 className="text-black text-lg">Amount to pay: {getTotalAmount}</h1>

        {paymentMethod === "gcash" && (
          <div className="w-40 h-40flex items-center justify-center border-2 border-black">
            <img src={qr1} alt="PayMaya QR" className="w-full h-full object-contain" />
          </div>
        )}

        {paymentMethod === "paymaya" && (
          <div className="w-40 h-40 flex items-center justify-center border-2 border-black">
            <img src={qr1} alt="PayMaya QR" className="w-full h-full object-contain" />
          </div>
        )}

        {(paymentMethod === "gcash" || paymentMethod === "paymaya") && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="
    w-64 text-sm text-gray-700
    border border-gray-400 rounded-lg! cursor-pointer bg-white
    file:mr-4! file:py-2! file:px-4!
    file:rounded-lg file:border-0
    file:text-sm file:font-medium
    file:bg-blue-500 file:text-white
    hover:file:bg-blue-600
    disabled:opacity-50 disabled:cursor-not-allowed
  "
          />
        )}

        {paymentProof && (
          <img src={paymentProof} alt="Proof" className="w-40 mt-2" />
        )}

        <button
          disabled={uploading}
          onClick={handleConfirmPayment}
          className="
    w-64! px-4! py-2!
    text-sm font-medium text-white
    bg-blue-500 rounded-lg
    shadow-sm
    hover:bg-blue-600
    focus:outline-none focus:ring-2 focus:ring-blue-400
    disabled:opacity-50 disabled:cursor-not-allowed
  "
        >
          {uploading ? "Uploading..." : "Confirm Payment"}
        </button>
      </div>
      <PaymentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          navigate("/");
        }}
      />
    </div>
  );
}