"use client";

import { useEffect, useState } from "react";

type Contact = { id?: string; name: string; relationship?: string; phone?: string; email?: string; enabled: boolean };

export default function SetupClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [plateId, setPlateId] = useState<string | null>(null);
  const [caravanName, setCaravanName] = useState("");
  const [bio, setBio] = useState("");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [contactEnabled, setContactEnabled] = useState(true);
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [preferredChannel, setPreferredChannel] = useState<"email"|"sms">("email");
  const [contacts, setContacts] = useState<Contact[]>([{ name:"", relationship:"", phone:"", email:"", enabled:true }]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/setup/get?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) { setMessage(j?.error ?? "Invalid or expired setup link."); setLoading(false); return; }
      setPlateId(j.plateId);
      setCaravanName(j.profile?.caravan_name ?? "");
      setBio(j.profile?.bio ?? "");
      setText1(j.design?.text_line_1 ?? (j.profile?.caravan_name ?? ""));
      setText2(j.design?.text_line_2 ?? "");
      setContactEnabled(j.plate?.contact_enabled ?? true);
      setEmergencyEnabled(j.plate?.emergency_enabled ?? true);
      setPreferredChannel(j.plate?.preferred_contact_channel ?? "email");
      setContacts((j.contacts?.length ? j.contacts : [{ name:"", relationship:"", phone:"", email:"", enabled:true }]).map((c:any)=>({
        id: c.id, name: c.name ?? "", relationship: c.relationship ?? "", phone: c.phone ?? "", email: c.email ?? "", enabled: !!c.enabled
      })));
      setLoading(false);
    })();
  }, [token]);

  const addContact = () => setContacts([...contacts, { name:"", relationship:"", phone:"", email:"", enabled:true }]);

  const save = async () => {
    setMessage("");
    const r = await fetch("/api/setup/save", {
      method:"POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({
        token, caravanName, bio, text1: text1 || caravanName, text2, contactEnabled, emergencyEnabled, preferredChannel, contacts
      })
    });
    const j = await r.json();
    if (!r.ok) { setMessage(j?.error ?? "Save failed."); return; }
    setMessage("Saved. Your plate is now ready for engraving.");
  };

  if (loading) return <main><p>Loading…</p></main>;

  return (
    <main>
      <h1>Set up your Carascan plate</h1>
      {message && <div className="card"><b>{message}</b></div>}
      {!plateId ? (
        <div className="card">Setup link invalid or expired.</div>
      ) : (
        <>
          <div className="card">
            <h3>Public page</h3>
            <label>Caravan name (required)</label>
            <input value={caravanName} onChange={(e)=>setCaravanName(e.target.value)} placeholder="e.g., The Wandering Wombat" />
            <label>Bio (optional)</label>
            <textarea value={bio} onChange={(e)=>setBio(e.target.value)} rows={4} maxLength={300} />
          </div>

          <div className="card">
            <h3>Plate engraving text</h3>
            <label>Text line 1 (required)</label>
            <input value={text1} onChange={(e)=>setText1(e.target.value)} placeholder="Defaults to caravan name" />
            <label>Text line 2 (optional)</label>
            <input value={text2} onChange={(e)=>setText2(e.target.value)} placeholder="Optional smaller line" />
          </div>

          <div className="card">
            <h3>Buttons</h3>
            <label><input type="checkbox" checked={contactEnabled} onChange={(e)=>setContactEnabled(e.target.checked)} /> Enable Contact button</label>
            <label><input type="checkbox" checked={emergencyEnabled} onChange={(e)=>setEmergencyEnabled(e.target.checked)} /> Enable Emergency button</label>
            <label>Owner receives Contact alerts via</label>
            <select value={preferredChannel} onChange={(e)=>setPreferredChannel(e.target.value as any)}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="card">
            <h3>Emergency contacts</h3>
            <small>Emergency sends BOTH SMS + Email (when provided) to each enabled contact.</small>
            {contacts.map((c, idx) => (
              <div key={idx} style={{borderTop: idx? "1px solid #e5e7eb":"0", paddingTop: idx?12:0, marginTop: idx?12:0}}>
                <label>Name (required)</label>
                <input value={c.name} onChange={(e)=>{ const n=[...contacts]; n[idx]={...n[idx], name:e.target.value}; setContacts(n); }} />
                <div className="grid grid2">
                  <div>
                    <label>Relationship</label>
                    <input value={c.relationship ?? ""} onChange={(e)=>{ const n=[...contacts]; n[idx]={...n[idx], relationship:e.target.value}; setContacts(n); }} />
                  </div>
                  <div>
                    <label>Enabled</label>
                    <select value={c.enabled ? "yes":"no"} onChange={(e)=>{ const n=[...contacts]; n[idx]={...n[idx], enabled: e.target.value==="yes"}; setContacts(n); }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid2">
                  <div>
                    <label>Phone (for SMS)</label>
                    <input value={c.phone ?? ""} onChange={(e)=>{ const n=[...contacts]; n[idx]={...n[idx], phone:e.target.value}; setContacts(n); }} placeholder="+61..." />
                  </div>
                  <div>
                    <label>Email</label>
                    <input value={c.email ?? ""} onChange={(e)=>{ const n=[...contacts]; n[idx]={...n[idx], email:e.target.value}; setContacts(n); }} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn secondary" onClick={addContact} type="button">+ Add another contact</button>
          </div>

          <button className="btn" onClick={save} type="button">Save setup</button>
        </>
      )}
    </main>
  );
}
