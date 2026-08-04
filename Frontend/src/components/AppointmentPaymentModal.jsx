/**
 * AppointmentPaymentModal.jsx — Interactive Payment Checkout Modal for Appointment Booking
 * Sehat-Sathi | v1.0 | August 2026
 *
 * Supports:
 * - UPI (Google Pay, PhonePe, Paytm, BHIM, Custom UPI ID)
 * - Credit / Debit Cards
 * - Net Banking (HDFC, SBI, ICICI, Axis, Kotak)
 * - Pay at Clinic (Cash)
 */
import { useState } from "react";
import {
  X, CheckCircle2, ShieldCheck, CreditCard, QrCode, Building, Banknote,
  Lock, ArrowRight, Loader2, Calendar, Clock, Stethoscope, MapPin, IndianRupee, AlertCircle
} from "lucide-react";
import { API_BASE } from "../api/client";

export default function AppointmentPaymentModal({ doctor, appointmentData, onClose, onConfirmBooking }) {
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "card" | "netbanking" | "cash"
  const [upiId, setUpiId] = useState("");
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fee = doctor?.consultation_fee || doctor?.fee || 500;
  const platformFee = 0;
  const totalAmount = fee + platformFee;

  const handlePayAndBook = async () => {
    setErrorMsg("");
    setIsProcessing(true);

    const isCash = paymentMethod === "cash";

    if (isCash) {
      // Cash at Clinic workflow
      setTimeout(() => {
        setIsProcessing(false);
        onConfirmBooking({
          payment_method: "CASH",
          payment_status: "Cash at Clinic",
          amount: totalAmount,
          transaction_id: `CASH-${Date.now()}`,
        });
      }, 800);
      return;
    }

    // REAL RAZORPAY PAYMENT INTEGRATION FLOW
    try {
      const token = localStorage.getItem("sehat_sathi_token") || localStorage.getItem("token");
      const userStr = localStorage.getItem("sehat_sathi_user");
      let userObj = {};
      try { if (userStr) userObj = JSON.parse(userStr); } catch (e) {}

      const authHeaders = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      // 1. Create Razorpay Order via Backend POST /payments/create-order
      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          amount: totalAmount,
          currency: "INR",
          booking_type: "appointment",
          notes: {
            doctor_name: doctor?.name,
            doctor_id: doctor?.id || doctor?._id,
            date: appointmentData?.date,
            time_slot: appointmentData?.time_slot
          }
        })
      });

      const orderData = await orderRes.json();
      if (orderRes.status === 401) {
        throw new Error("Your login session has expired. Please log out and log in again to proceed with checkout.");
      }
      if (!orderRes.ok) throw new Error(orderData.detail || "Could not initialize Razorpay Order");

      // 2. Open Razorpay Checkout JS Popup
      const keyId = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TLFligzH93mFjS";

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Sehat-Sathi Healthcare",
        description: `Consultation Fee — Dr. ${doctor?.name || 'Specialist'}`,
        image: "https://sehat-sathi-bay.vercel.app/favicon.svg",
        order_id: orderData.order_id,
        handler: async function (response) {
          // 3. Cryptographic Signature Verification via Backend POST /payments/verify
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_type: "appointment",
                booking_payload: {
                  doctor_id: doctor?.id || doctor?._id || "650000000000000000000001",
                  hospital_id: doctor?.hospital_id || null,
                  date: appointmentData?.date,
                  time_slot: appointmentData?.time_slot,
                  reason: appointmentData?.reason || "General health consultation",
                  amount: totalAmount,
                  doctor_specialty: doctor?.specialty || doctor?.specialization || "General Physician",
                  hospital_name: doctor?.hospital_name || doctor?.hospital || "Sehat-Sathi Partnered Clinic"
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.detail || "Payment verification failed.");

            setIsProcessing(false);
            onConfirmBooking({
              payment_method: paymentMethod.toUpperCase(),
              payment_status: "Paid",
              amount: totalAmount,
              transaction_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              invoice: verifyData.invoice
            });
          } catch (err) {
            setIsProcessing(false);
            setErrorMsg(err.message || "Cryptographic signature verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userObj.name || "Patient",
          email: userObj.email || "patient@sehatsathi.com",
          contact: userObj.phone || ""
        },
        theme: {
          color: "#2563EB"
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setIsProcessing(false);
          setErrorMsg(`Payment Failed: ${resp.error.description || "Transaction declined"}`);
        });
        rzp.open();
      } else {
        // Fallback if Razorpay script is blocked
        throw new Error("Razorpay Checkout SDK script not loaded. Please check internet connection.");
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(err.message || "Failed to initialize Razorpay checkout.");
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(15, 23, 42, 0.70)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface, #FFFFFF)",
          border: "1px solid var(--border, #E2E8F0)",
          borderRadius: 24,
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          maxWidth: 540,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "fadeScale 0.2s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} style={{ color: "#60A5FA" }} />
              <span style={{ fontSize: 16, fontWeight: 700 }}>Secure Checkout</span>
            </div>
            <p style={{ fontSize: 12, opacity: 0.85, margin: "2px 0 0" }}>
              256-Bit Encrypted Healthcare Payment
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "#fff", width: 32, height: 32, borderRadius: 8,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Booking Summary Card */}
          <div style={{
            background: "var(--surface-alt, #F8FAFC)",
            border: "1px solid var(--border, #E2E8F0)",
            borderRadius: 16, padding: 16, marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--primary-light, rgba(37,99,235,0.1))",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--primary, #2563EB)", fontSize: 20, flexShrink: 0
              }}>
                👨‍⚕️
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text, #0F172A)" }}>
                  Dr. {doctor?.name || "Medical Specialist"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary, #475569)" }}>
                  {doctor?.specialty || doctor?.specialization || "General Physician"} · {doctor?.hospital_name || doctor?.hospital || "Clinic"}
                </div>
              </div>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
              paddingTop: 12, borderTop: "1px dashed var(--border, #E2E8F0)",
              fontSize: 12.5, color: "var(--text-secondary, #475569)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={13} style={{ color: "var(--primary, #2563EB)" }} />
                <span>Date: <strong>{appointmentData?.date}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={13} style={{ color: "var(--primary, #2563EB)" }} />
                <span>Slot: <strong>{appointmentData?.time_slot}</strong></span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text, #0F172A)", display: "block", marginBottom: 10 }}>
              Select Payment Method
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                style={{
                  padding: "12px 14px", borderRadius: 12,
                  border: paymentMethod === "upi" ? "2px solid var(--primary, #2563EB)" : "1px solid var(--border, #E2E8F0)",
                  background: paymentMethod === "upi" ? "var(--primary-light, rgba(37,99,235,0.08))" : "var(--surface, #FFF)",
                  cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.15s",
                }}
              >
                <QrCode size={18} style={{ color: paymentMethod === "upi" ? "var(--primary, #2563EB)" : "var(--text-muted)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: paymentMethod === "upi" ? "var(--primary, #2563EB)" : "var(--text)" }}>UPI Instant</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>GPay, PhonePe, Paytm</div>
                </div>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                style={{
                  padding: "12px 14px", borderRadius: 12,
                  border: paymentMethod === "card" ? "2px solid var(--primary, #2563EB)" : "1px solid var(--border, #E2E8F0)",
                  background: paymentMethod === "card" ? "var(--primary-light, rgba(37,99,235,0.08))" : "var(--surface, #FFF)",
                  cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.15s",
                }}
              >
                <CreditCard size={18} style={{ color: paymentMethod === "card" ? "var(--primary, #2563EB)" : "var(--text-muted)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: paymentMethod === "card" ? "var(--primary, #2563EB)" : "var(--text)" }}>Card</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Debit / Credit Card</div>
                </div>
              </button>

              {/* NetBanking */}
              <button
                type="button"
                onClick={() => setPaymentMethod("netbanking")}
                style={{
                  padding: "12px 14px", borderRadius: 12,
                  border: paymentMethod === "netbanking" ? "2px solid var(--primary, #2563EB)" : "1px solid var(--border, #E2E8F0)",
                  background: paymentMethod === "netbanking" ? "var(--primary-light, rgba(37,99,235,0.08))" : "var(--surface, #FFF)",
                  cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.15s",
                }}
              >
                <Building size={18} style={{ color: paymentMethod === "netbanking" ? "var(--primary, #2563EB)" : "var(--text-muted)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: paymentMethod === "netbanking" ? "var(--primary, #2563EB)" : "var(--text)" }}>Net Banking</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>All Major Indian Banks</div>
                </div>
              </button>

              {/* Cash at Clinic */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                style={{
                  padding: "12px 14px", borderRadius: 12,
                  border: paymentMethod === "cash" ? "2px solid var(--green, #10B981)" : "1px solid var(--border, #E2E8F0)",
                  background: paymentMethod === "cash" ? "var(--green-light, rgba(16,185,129,0.08))" : "var(--surface, #FFF)",
                  cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.15s",
                }}
              >
                <Banknote size={18} style={{ color: paymentMethod === "cash" ? "var(--green, #10B981)" : "var(--text-muted)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: paymentMethod === "cash" ? "var(--green, #10B981)" : "var(--text)" }}>Pay at Clinic</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Cash / Pay on arrival</div>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Input Details */}
          <div style={{
            background: "var(--surface-alt, #F8FAFC)",
            border: "1px solid var(--border, #E2E8F0)",
            borderRadius: 16, padding: 16, marginBottom: 20,
          }}>
            {paymentMethod === "upi" && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Enter UPI ID (e.g. 9876543210@paytm / mobile@upi)
                </label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid var(--border-strong, #CBD5E1)",
                    fontSize: 13, background: "var(--surface)", color: "var(--text)", outline: "none"
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                    <span key={app} style={{
                      background: "var(--surface)", border: "1px solid var(--border)",
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--text-secondary)"
                    }}>
                      ⚡ {app}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Card Number</label>
                  <input
                    type="text"
                    placeholder="4532 ···· ···· 8901"
                    maxLength={19}
                    value={cardData.number}
                    onChange={e => setCardData({ ...cardData, number: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="08/28"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Select Bank</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra"].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      style={{
                        padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: selectedBank === bank ? "1px solid var(--primary)" : "1px solid var(--border)",
                        background: selectedBank === bank ? "var(--primary-light)" : "var(--surface)",
                        color: selectedBank === bank ? "var(--primary)" : "var(--text)",
                        cursor: "pointer", textAlign: "left"
                      }}
                    >
                      🏦 {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === "cash" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8 }}>
                <CheckCircle2 size={20} style={{ color: "var(--green, #10B981)", flexShrink: 0 }} />
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  You can pay <strong>₹{fee}</strong> directly at the doctor's clinic when you arrive for your appointment.
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div style={{
              background: "var(--red-light, rgba(239,68,68,0.1))",
              border: "1px solid var(--red-border, rgba(239,68,68,0.3))",
              color: "var(--red, #EF4444)",
              borderRadius: 10, padding: "10px 14px", fontSize: 12,
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8
            }}>
              <AlertCircle size={15} />
              {errorMsg}
            </div>
          )}

          {/* Amount Breakdown */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
              <span>Consultation Fee</span>
              <span>₹{fee}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
              <span>Platform Booking Fee</span>
              <span style={{ color: "var(--green, #10B981)", fontWeight: 700 }}>FREE (₹0)</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 16, fontWeight: 800, color: "var(--text)",
              paddingTop: 8, borderTop: "1px dashed var(--border)"
            }}>
              <span>Total Amount</span>
              <span style={{ color: "var(--primary, #2563EB)" }}>₹{totalAmount}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayAndBook}
            disabled={isProcessing}
            style={{
              width: "100%", padding: "14px", borderRadius: 14,
              background: paymentMethod === "cash"
                ? "linear-gradient(135deg, #10B981, #059669)"
                : "linear-gradient(135deg, #2563EB, #1D4ED8)",
              border: "none", color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: isProcessing ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              transition: "all 0.15s",
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing Payment & Booking…
              </>
            ) : (
              <>
                {paymentMethod === "cash" ? `Confirm & Book (Pay ₹${totalAmount} at Clinic)` : `Pay ₹${totalAmount} & Book Appointment`}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
