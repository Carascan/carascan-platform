"use client";

import { useEffect, useMemo, useState } from "react";

type SetupClientProps = {
  token: string;
};

// --- TYPES (unchanged)
type Plate = {
  id: string;
  identifier: string;
  slug: string;
  status: string;
  contact_enabled: boolean;
  emergency_enabled: boolean;
  preferred_contact_channel: string;
  report_channel?: string | null;
  sku: string;
};

type Profile = {
  plate_id: string;
  caravan_name: string;
  bio: string | null;
};

type Design = {
  mounting_holes?: boolean | null;
};

type EmergencyContact = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  enabled: boolean;
};

type SetupResponse = {
  plateId: string;
  email: string | null;
  plate: Plate;
  profile: Profile | null;
  design: Design | null;
  contacts: EmergencyContact[];
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: SetupResponse };

function blankContact(): EmergencyContact {
  return { name: "", phone: "", email: "", enabled: true };
}

export default function SetupClient({ token }: SetupClientProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [caravanName, setCaravanName] = useState("");
  const [bio, setBio] = useState("");
  const [contactEnabled, setContactEnabled] = useState(true);
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [contactChannel, setContactChannel] = useState("email");
  const [reportChannel, setReportChannel] = useState("email");
  const [mountingHoles, setMountingHoles] = useState(true);

  const [contacts, setContacts] = useState<EmergencyContact[]>([
    blankContact(),
    blankContact(),
    blankContact(),
  ]);

  // --- LOAD
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/setup/get?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setLoadState({ status: "error", error: data.error });
          return;
        }

        if (cancelled) return;

        setCaravanName(data.profile?.caravan_name ?? "");
        setBio(data.profile?.bio ?? "");
        setContactEnabled(data.plate.contact_enabled);
        setEmergencyEnabled(data.plate.emergency_enabled);
        setContactChannel(data.plate.preferred_contact_channel || "email");
        setReportChannel(data.plate.report_channel || "email");
        setMountingHoles(data.design?.mounting_holes !== false);

        const padded = [...(data.contacts || [])];
        while (padded.length < 3) padded.push(blankContact());

        setContacts(padded.slice(0, 3));

        setLoadState({ status: "ready", data });
      } catch {
        setLoadState({
          status: "error",
          error: "Failed to load setup",
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function updateContact(index: number, patch: Partial<EmergencyContact>) {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  }

  const activeContacts = useMemo(() => {
    return contacts.filter((c) => c.name || c.phone || c.email);
  }, [contacts]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveMessage("");

    const res = await fetch("/api/setup/save", {
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
        mounting_holes: mountingHoles,
        emergency_contacts: activeContacts,
      }),
    });

    const body = await res.json();

    if (!res.ok) {
      setSaveError(body.error || "Save failed");
    } else {
      setSaveMessage("Setup saved successfully");
    }

    setSaving(false);
  }

  // --- STATES

  if (loadState.status === "loading") {
    return <div style={styles.page}>Loading...</div>;
  }

  if (loadState.status === "error") {
    return <div style={styles.page}>{loadState.error}</div>;
  }

  const { data } = loadState;

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

          <input
            style={styles.input}
            value={caravanName}
            onChange={(e) => setCaravanName(e.target.value)}
            placeholder="Caravan name"
          />

          <textarea
            style={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio / notes"
          />

          <h2 style={styles.h2}>Plate options</h2>

          <p style={styles.muted}>
            Mounting holes: <strong>{mountingHoles ? "On" : "Off"}</strong>
          </p>

          <h2 style={styles.h2}>Contact preferences</h2>

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={contactEnabled}
              onChange={(e) => setContactEnabled(e.target.checked)}
            />
            Enable public contact
          </label>

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={emergencyEnabled}
              onChange={(e) => setEmergencyEnabled(e.target.checked)}
            />
            Enable emergency alerts
          </label>

          <label style={styles.label}>
            Virtual Doorknock
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
            Report Location
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

          <h2 style={{ ...styles.h2, textAlign: "center" }}>
            Emergency contacts
          </h2>

          {contacts.map((c, i) => (
            <div key={i} style={styles.contactBlock}>
              <input
                style={styles.input}
                placeholder="Name"
                value={c.name}
                onChange={(e) =>
                  updateContact(i, { name: e.target.value })
                }
              />
              <input
                style={styles.input}
                placeholder="Phone"
                value={c.phone}
                onChange={(e) =>
                  updateContact(i, { phone: e.target.value })
                }
              />
              <input
                style={styles.input}
                placeholder="Email"
                value={c.email}
                onChange={(e) =>
                  updateContact(i, { email: e.target.value })
                }
              />
            </div>
          ))}

          {saveError && <p style={styles.error}>{saveError}</p>}
          {saveMessage && <p style={styles.success}>{saveMessage}</p>}

          <button style={styles.button} disabled={saving}>
            {saving ? "Saving..." : "Save setup"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Header() {
  return (
    <div style={styles.header}>
      <img
        src="https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg"
        style={styles.logo}
      />
      <a href="/help" style={styles.helpButton}>
        Need help?
      </a>
    </div>
  );
}

const styles: any = {
  page: { padding: 20 },
  wrapper: { maxWidth: 800, margin: "0 auto" },
  card: { background: "#fff", padding: 20, marginBottom: 20 },
  h1: { fontSize: 24 },
  h2: { fontSize: 18, marginTop: 20 },
  muted: { color: "#555" },
  input: { width: "100%", marginBottom: 10 },
  textarea: { width: "100%", marginBottom: 10 },
  checkboxRow: { marginBottom: 10 },
  contactBlock: {
    maxWidth: 500,
    margin: "0 auto 20px auto",
  },
  button: { padding: 10 },
  error: { color: "red" },
  success: { color: "green" },
};