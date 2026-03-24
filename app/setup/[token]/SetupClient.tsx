"use client";

import { useEffect, useMemo, useState } from "react";

type SetupClientProps = {
  token: string;
};

// (types unchanged)

export default function SetupClient({ token }: SetupClientProps) {
  const [loadState, setLoadState] = useState<any>({ status: "loading" });

  const [caravanName, setCaravanName] = useState("");
  const [bio, setBio] = useState("");
  const [contactEnabled, setContactEnabled] = useState(true);
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);

  // UPDATED
  const [contactChannel, setContactChannel] = useState("email");
  const [reportChannel, setReportChannel] = useState("email");

  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/setup/get?token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        window.location.href = `/support?token=${token}`;
        return;
      }

      setCaravanName(data.profile?.caravan_name ?? "");
      setBio(data.profile?.bio ?? "");
      setContactEnabled(data.plate.contact_enabled);
      setEmergencyEnabled(data.plate.emergency_enabled);

      setContactChannel(data.plate.preferred_contact_channel || "email");
      setReportChannel(data.plate.report_channel || "email");

      setContacts(data.contacts ?? []);

      setLoadState({ status: "ready", data });
    }

    load();
  }, [token]);

  async function handleSave(e: any) {
    e.preventDefault();

    await fetch("/api/setup/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token,
        caravan_name: caravanName,
        bio,
        contact_enabled: contactEnabled,
        emergency_enabled: emergencyEnabled,

        contact_channel: contactChannel,
        report_channel: reportChannel,

        emergency_contacts: contacts,
      }),
    });

    alert("Saved");
  }

  if (loadState.status !== "ready") return null;

  const data = loadState.data;

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <Header />

        <div style={styles.card}>
          <h1 style={styles.h1}>Complete your Carascan setup</h1>
          <p style={styles.muted}>
            Plate: <strong>{data.plate.identifier}</strong>
          </p>
        </div>

        <form style={styles.card} onSubmit={handleSave}>
          <h2 style={styles.h2}>Profile</h2>

          <label style={styles.label}>
            Caravan name
            <input
              style={styles.input}
              value={caravanName}
              onChange={(e) => setCaravanName(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            Bio
            <textarea
              style={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          <h2 style={styles.h2}>Preferences</h2>

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={contactEnabled}
              onChange={(e) => setContactEnabled(e.target.checked)}
            />
            Enable public contact
          </label>

          <label style={styles.label}>
            Contact method
            <select
              style={styles.input}
              value={contactChannel}
              onChange={(e) => setContactChannel(e.target.value)}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
            </select>
          </label>

          <label style={styles.label}>
            Report location method
            <select
              style={styles.input}
              value={reportChannel}
              onChange={(e) => setReportChannel(e.target.value)}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
            </select>
          </label>

          <h2 style={styles.h2}>Emergency</h2>
          <p style={styles.muted}>
            Emergency alerts always send via SMS and Email
          </p>

          <button style={styles.button}>Save setup</button>
        </form>
      </div>
    </main>
  );
}