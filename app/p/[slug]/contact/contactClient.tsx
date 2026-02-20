"use client";
import { useState } from "react";

export default function ContactClient({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState<string>("");

  const send = async () => {
    setStatus("");
    const r = await fetch(`/api/plates/${encodeURIComponent(slug)}/contact`, {
      method:"POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify({ reporter_name:name, reporter_phone:phone, reporter_email:email, message:msg })
    });
    const j = await r.json();
    if (!r.ok) return setStatus(j?.error ?? "Failed.");
    setStatus("Sent. The owner has been notified.");
  };

  return (
    <main>
      <h1>Contact owner</h1>
      {status && <div className="card"><b>{status}</b></div>}
      <div className="card">
        <label>Your name (optional)</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} />
        <div className="grid grid2">
          <div>
            <label>Your phone (optional)</label>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} />
          </div>
          <div>
            <label>Your email (optional)</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
        </div>
        <label>Message (required)</label>
        <textarea value={msg} onChange={(e)=>setMsg(e.target.value)} rows={5} />
        <button className="btn" type="button" onClick={send}>Send</button>
      </div>
      <small>No owner contact details are shown. This relays a message to the owner only.</small>
    </main>
  );
}
