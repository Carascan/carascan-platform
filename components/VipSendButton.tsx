"use client";

import { useFormStatus } from "react-dom";

export default function VipSendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "12px 18px",
        borderRadius: 10,
        border: "none",
        cursor: pending ? "not-allowed" : "pointer",
        fontWeight: 700,
        fontSize: 14,
        background: pending ? "#6b7280" : "#111827",
        color: "#fff",
        opacity: pending ? 0.8 : 1,
      }}
    >
      {pending ? "Sending..." : "Send"}
    </button>
  );
}