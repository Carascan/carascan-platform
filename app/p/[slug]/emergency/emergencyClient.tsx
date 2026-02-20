"use client";
import { useState } from "react";

export default function EmergencyClient({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loc, setLoc] = useState<{lat:number,lng:number,acc:number}|null>(null);

  const getLoc = async () => {
    setStatus("");
    if (!navigator.geolocation) { setStatus("Geolocation not available."); return; }
    navigator.geolocation.getCurrentPosition(
      (p)=> setLoc({ lat:p.coords.latitude, lng:p.coords.longitude, acc:p.coords.accuracy }),
      ()=> setStatus("Location permission denied (still can send without location)."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const send = async () => {
    setStatus("");
    const r = await fetch(`/api/plates/${encodeURIComponent(slug)}/emergency`, {
      method:"POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify({
        reporter_name:name, reporter_phone:phone, reporter_email:email, message:msg,
        geo_lat: loc?.lat, geo_lng: loc?.lng, geo_accuracy_m: loc?.acc
      })
    });
    const j = await r.json();
    if (!r.ok) return setStatus(j?.error ?? "Failed.");
    setStatus("Emergency alert sent to emergency contacts.");
  };

  return (
    <main>
      <h1>In Case of Emergency</h1>
      {status && <div className="card"><b>{status}</b></div>}
      <div className="card">
        <p><b>This will notify the caravan’s emergency contacts by SMS + email (where provided).</b></p>
        <label>Your name (recommended)</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} />
        <div className="grid grid2">
          <div>
            <label>Your phone (recommended)</label>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} />
          </div>
          <div>
            <label>Your email (optional)</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
        </div>
        <label>Message (required)</label>
        <textarea value={msg} onChange={(e)=>setMsg(e.target.value)} rows={5} />
        <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
          <button className="btn secondary" type="button" onClick={getLoc}>Share my location</button>
          {loc && <small>Location attached ✅ ({loc.lat.toFixed(5)}, {loc.lng.toFixed(5)})</small>}
        </div>
        <div style={{height:10}} />
        <button className="btn" type="button" onClick={send}>Send Emergency Alert</button>
      </div>
      <small>If you are in immediate danger, call emergency services.</small>
    </main>
  );
}
