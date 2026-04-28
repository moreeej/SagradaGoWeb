import { useContext, useState } from "react";
import { NavbarContext } from "../../context/AllContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import qr1 from "../../assets/qr-codes/qr-1.png";

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


  function handleConfirmPayment() {
    alert("Payment confirmed! Thank you for your payment.");
    navigate("/");
  }

  return (
    <div className="w-full py-7! px-4! bg-red-400 flex flex-col items-center gap-3">

      <select
        className="p-2 rounded border border-black w-40"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="" hidden>Select Payment</option>
        <option value="cash">Cash</option>
        <option value="gcash">GCash</option>
        <option value="paymaya">PayMaya</option>
      </select>

      <h1>Amount to pay: {getTotalAmount}</h1>

      {paymentMethod === "gcash" && (
        <div className="w-40 h-40 bg-green-300 flex items-center justify-center">
          GCash QR
        </div>
      )}

      {paymentMethod === "paymaya" && (
        <div className="w-40 h-40 bg-blue-300 flex items-center justify-center">
          <img src={qr1} alt="PayMaya QR" className="w-full h-full object-contain" />
        </div>
      )}

      {(paymentMethod === "gcash" || paymentMethod === "paymaya") && (
        <input
          type="file"
          accept="image/*"
          className="border p-2"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      )}

      {paymentProof && (
        <img src={paymentProof} alt="Proof" className="w-40 mt-2" />
      )}

      <button
        className="p-4! bg-white rounded-xl hover:bg-gray-400"
        disabled={uploading}
        onClick={handleConfirmPayment}
      >
        {uploading ? "Uploading..." : "Confirm Payment"}
      </button>
    </div>
  );
}