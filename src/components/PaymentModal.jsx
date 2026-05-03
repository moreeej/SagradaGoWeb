export default function PaymentModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      
      {/* Modal Card */}
      <div className="bg-white w-80 rounded-2xl shadow-lg p-6! flex flex-col items-center gap-4">
        
        <h1 className="text-lg font-semibold text-gray-800 text-center">
          Payment confirmed!
        </h1>

        <p className="text-sm text-gray-600 text-center">
          Thank you for your payment.
        </p>

        <button
          onClick={onClose}
          className="
            w-full px-4! py-2!
            bg-blue-500 text-white text-sm font-medium
            rounded-lg!
            hover:bg-blue-600
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
        >
          Close
        </button>
      </div>
    </div>
  );
}