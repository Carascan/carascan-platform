"use client";

import { useEffect, useMemo, useState } from "react";

type SetupClientProps = {
  token: string;
};

type Plate = {
  id: string;
  identifier: string;
  slug: string;
  status: string;
  contact_enabled: boolean;
  emergency_enabled: boolean;
  preferred_contact_channel: string;
  sku: string;
};

type Profile = {
  plate_id: string;
  caravan_name: string;
  bio: string | null;
  owner_photo_url: string | null;
};

type Design = {
  plate_id: string;
  text_line_1: string;
  text_line_2: string;
  logo_url: string | null;
  qr_url: string | null;
  proof_approved: boolean;
  plate_width_mm: number;
  plate_height_mm: number;
  qr_size_mm: number;
  hole_diameter_mm: number;
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
  email: string;
  plate: Plate;
  profile: Profile | null;
  design: Design | null;
  contacts: EmergencyContact[];
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; error: string; details?: unknown }
  | { status: "ready"; data: SetupResponse };

function blankContact(): EmergencyContact {
  return {
    name: "",
    phone: "",
    email: "",
    enabled: true,
  };
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
  const [preferredChannel, setPreferredChannel] = useState("email");
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    blankContact(),
    blankContact(),
    blankContact(),
  ]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/setup/get?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        let body: unknown = null;
        try {
          body = await res.json();
        } catch {
          body = null;
        }

        if (cancelled) return;

        if (!res.ok) {
          const message =
            typeof body === "object" &&
            body !== null &&
            "error" in body &&
            typeof (body as { error?: unknown }).error === "string"
              ? (body as { error: string }).error
              : `Load failed with status ${res.status}`;

          setLoadState({
            status: "error",
            error: message,
            details: body,
          });
          return;
        }

        const data = body as SetupResponse;

        setCaravanName(data.profile?.caravan_name ?? "");
        setBio(data.profile?.bio ?? "");
        setContactEnabled(Boolean(data.plate?.contact_enabled));
        setEmergencyEnabled(Boolean(data.plate?.emergency_enabled));
        setPreferredChannel(data.plate?.preferred_contact_channel || "email");

        const existing = Array.isArray(data.contacts) ? data.contacts.slice(0, 3) : [];
        const padded = [...existing];
        while (padded.length < 3) padded.push(blankContact());
        setContacts(
          padded.map((c) => ({
            name: c.name ?? "",
            phone: c.phone ?? "",
            email: c.email ?? "",
            enabled: c.enabled ?? true,
          }))
        );

        setLoadState({ status: "ready", data });
      } catch (err) {
        if (cancelled) return;

        setLoadState({
          status: "error",
          error: err instanceof Error ? err.message : "Unknown load error",
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const activeContacts = useMemo(() => {
    return contacts
      .map((c) => ({
        name: c.name.trim(),
        phone: c.phone.trim(),
        email: c.email.trim(),
        enabled: c.enabled,
      }))
      .filter((c) => c.name || c.phone || c.email);
  }, [contacts]);

  function updateContact(index: number, patch: Partial<EmergencyContact>) {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const payload = {
        token,
        caravan_name: caravanName.trim(),
        bio: bio.trim(),
        contact_enabled: contactEnabled,
        emergency_enabled: emergencyEnabled,
        preferred_contact_channel: preferredChannel,
        emergency_contacts: activeContacts,
      };

      const res = await fetch("/api/setup/save", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (!res.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : `Save failed with status ${res.status}`;

        setSaveError(message);
        return;
      }

      setSaveMessage("Setup saved successfully.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unknown save error");
    } finally {
      setSaving(false);
    }
  }

  if (loadState.status === "loading") {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Carascan setup</h1>
          <p>Loading your setup details...</p>
        </div>
      </main>
    );
  }

  if (loadState.status === "error") {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Carascan setup</h1>
          <p style={styles.error}>Failed to load setup</p>
          <p>{loadState.error}</p>
          {loadState.details !== undefined && (
            <pre style={styles.pre}>
              {JSON.stringify(loadState.details, null, 2)}
            </pre>
          )}
        </div>
      </main>
    );
  }

  const { data } = loadState;

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Complete your Carascan setup</h1>
          <p style={styles.muted}>
            Plate: <strong>{data.plate.identifier}</strong>
          </p>
          <p style={styles.muted}>
            Email: <strong>{data.email}</strong>
          </p>
          <p style={styles.muted}>
            Public plate link: <strong>/p/{data.plate.slug}</strong>
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
              placeholder="Optional"
            />
          </label>

          <label style={styles.label}>
            Bio / notes
            <textarea
              style={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Optional"
              rows={4}
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

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={emergencyEnabled}
              onChange={(e) => setEmergencyEnabled(e.target.checked)}
            />
            Enable emergency alerts
          </label>

          <label style={styles.label}>
            Preferred contact channel
            <select
              style={styles.input}
              value={preferredChannel}
              onChange={(e) => setPreferredChannel(e.target.value)}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="sms">SMS</option>
            </select>
          </label>

          <h2 style={styles.h2}>Emergency contacts</h2>
          <p style={styles.muted}>Add up to 3. All fields are optional.</p>

          {contacts.map((contact, index) => (
            <div key={index} style={styles.contactBlock}>
              <h3 style={styles.h3}>Contact {index + 1}</h3>

              <label style={styles.label}>
                Name
                <input
                  style={styles.input}
                  value={contact.name}
                  onChange={(e) =>
                    updateContact(index, { name: e.target.value })
                  }
                />
              </label>

              <label style={styles.label}>
                Phone
                <input
                  style={styles.input}
                  value={contact.phone}
                  onChange={(e) =>
                    updateContact(index, { phone: e.target.value })
                  }
                />
              </label>

              <label style={styles.label}>
                Email
                <input
                  style={styles.input}
                  value={contact.email}
                  onChange={(e) =>
                    updateContact(index, { email: e.target.value })
                  }
                />
              </label>

              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={contact.enabled}
                  onChange={(e) =>
                    updateContact(index, { enabled: e.target.checked })
                  }
                />
                Enabled
              </label>
            </div>
          ))}

          {saveError && <p style={styles.error}>{saveError}</p>}
          {saveMessage && <p style={styles.success}>{saveMessage}</p>}

          <button type="submit" style={styles.button} disabled={saving}>
            {saving ? "Saving..." : "Save setup"}
          </button>
        </form>

        <div style={styles.card}>
          <h2 style={styles.h2}>Loaded data</h2>
          <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f7f9",
    padding: "32px 16px",
    fontFamily: "Arial, sans-serif",
  },
  wrapper: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
  },
  h1: {
    margin: "0 0 8px 0",
    fontSize: 28,
  },
  h2: {
    margin: "0 0 16px 0",
    fontSize: 22,
  },
  h3: {
    margin: "0 0 12px 0",
    fontSize: 18,
  },
  muted: {
    color: "#555",
    margin: "4px 0",
  },
  label: {
    display: "block",
    marginBottom: 14,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
    resize: "vertical",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  contactBlock: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  button: {
    padding: "12px 18px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
  error: {
    color: "#b00020",
    fontWeight: 700,
  },
  success: {
    color: "#0a7f39",
    fontWeight: 700,
  },
  pre: {
    background: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: 13,
  },
};