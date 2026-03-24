"use client";

import { useState } from "react";

export default function SupportClient() {
  const [type, setType] = useState("general");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending...");

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, email, message }),
    });

    setStatus(res.ok ? "Sent successfully" : "Failed to send");
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Support</h1>

      <form onSubmit={submit}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="general">General enquiry</option>
          <option value="feedback">Feedback</option>
          <option value="renew">Renew setup link</option>
          <option value="other">Other</option>
        </select>

        <input
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button>Send</button>

        {status && <p>{status}</p>}
      </form>
    </main>
  );
}