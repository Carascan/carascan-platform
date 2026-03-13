"use client";

import { useEffect, useState } from "react";

type Contact = {
  id?: string;
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  enabled: boolean;
};

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function SetupClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plateId, setPlateId] = useState<string | null>(null);

  const [caravanName, setCaravanName] = useState("");
  const [bio, setBio] = useState("");

  const [contactEnabled, setContactEnabled] = useState(true);
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [preferredChannel, setPreferredChannel] = useState<"email" | "sms">(
    "email"
  );

  const [contacts, setContacts] = useState<Contact[]>([
    { name: "", relationship: "", phone: "", email: "", enabled: true },
  ]);

  const [message, setMessage] = useState("");

  const maxContacts = 3;

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/setup/get?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const j = await r.json();

        if (!r.ok) {
          setMessage(j?.error ?? "Invalid or expired setup link.");
          setLoading(false);
          return;
        }

        setPlateId(j.plateId);
        setCaravanName(j.profile?.caravan_name ?? "");
        setBio(j.profile?.bio ?? "");
        setContactEnabled(j.plate?.contact_enabled ?? true);
        setEmergencyEnabled(j.plate?.emergency_enabled ?? true);
        setPreferredChannel(
          (j.plate?.preferred_contact_channel ?? "email") as "email" | "sms"
        );

        const incomingContacts =
          j.contacts?.length > 0
            ? j.contacts
            : [{ name: "", relationship: "", phone: "", email: "", enabled: true }];

        setContacts(
          incomingContacts.map((c: any) => ({
            id: c.id,
            name: c.name ?? "",
            relationship: c.relationship ?? "",
            phone: c.phone ?? "",
            email: c.email ?? "",
            enabled: !!c.enabled,
          }))
        );
      } catch {
        setMessage("Failed to load setup details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const updateContact = (idx: number, patch: Partial<Contact>) => {
    setContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const removeContact = (idx: number) => {
    setContacts((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length
        ? next
        : [{ name: "", relationship: "", phone: "", email: "", enabled: true }];
    });
  };

  const addContact = () => {
    if (contacts.length >= maxContacts) {
      setMessage("Maximum of 3 contacts on the standard setup. Upgrade to unlock up to 10 contacts.");
      return;
    }

    setContacts((prev) => [
      ...prev,
      { name: "", relationship: "", phone: "", email: "", enabled: true },
    ]);
  };

  const goToUpgradeCheckout = () => {
    window.location.href = "/buy?upgrade=contacts10";
  };

  const save = async () => {
    setMessage("");

    if (!caravanName.trim()) {
      setMessage("Please enter a caravan name.");
      return;
    }

    setSaving(true);

    const payload = {
      token,
      caravanName: caravanName.trim(),
      text1: caravanName.trim(),
      text2: "",
      bio: bio.trim() || null,
      contactEnabled,
      emergencyEnabled,
      preferredChannel,
      contacts,
    };

    try {
      const r = await fetch("/api/setup/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await r.json();

      if (!r.ok) {
        setMessage(j?.error ?? "Save failed.");
        return;
      }

      setMessage("Saved. Your plate is now ready.");
    } catch {
      setMessage("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "32px 20px",
          background: "#f7f7f8",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={LOGO_URL}
            alt="Carascan"
            style={{ width: "100%", maxWidth: 320, marginBottom: 24 }}
          />
          <p>Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "#f7f7f8",
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            marginBottom: 20,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img
              src={LOGO_URL}
              alt="Carascan"
              style={{
                width: "100%",
                maxWidth: 340,
                height: "auto",
                display: "block",
                margin: "0 auto 18px",
              }}
            />

            <h1 style={{ margin: "0 0 10px", fontSize: 32 }}>
              Set up your Carascan plate
            </h1>
            <p style={{ margin: 0, color: "#4b5563" }}>
              Configure your contact options and emergency contacts.
            </p>
          </div>

          {message && (
            <div
              style={{
                marginBottom: 20,
                padding: "14px 16px",
                borderRadius: 12,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                color: "#111827",
              }}
            >
              <strong>{message}</strong>
            </div>
          )}

          {!plateId ? (
            <div
              style={{
                padding: 18,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#f9fafb",
              }}
            >
              Setup link invalid or expired.
            </div>
          ) : (
            <>
              <section
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 18,
                }}
              >
                <h3 style={{ marginTop: 0 }}>Profile</h3>

                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Caravan name
                </label>
                <input
                  value={caravanName}
                  onChange={(e) => setCaravanName(e.target.value)}
                  placeholder="Your caravan name"
                  style={inputStyle}
                />

                <label
                  style={{
                    display: "block",
                    marginTop: 14,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Bio (optional)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 110 }}
                />
              </section>

              <section
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 18,
                }}
              >
                <h3 style={{ marginTop: 0 }}>Contact options</h3>

                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={contactEnabled}
                    onChange={(e) => setContactEnabled(e.target.checked)}
                  />
                  Enable Contact button
                </label>

                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={emergencyEnabled}
                    onChange={(e) => setEmergencyEnabled(e.target.checked)}
                  />
                  Enable Emergency button
                </label>

                <label
                  style={{
                    display: "block",
                    marginTop: 14,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Owner receives Contact alerts via
                </label>
                <select
                  value={preferredChannel}
                  onChange={(e) =>
                    setPreferredChannel(e.target.value as "email" | "sms")
                  }
                  style={inputStyle}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </section>

              <section
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>Emergency contacts</h3>
                    <small style={{ color: "#6b7280" }}>
                      Maximum 3 contacts included. Upgrade to unlock up to 10 contacts.
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={goToUpgradeCheckout}
                    style={secondaryButtonStyle}
                  >
                    Upgrade to 10 contacts
                  </button>
                </div>

                {contacts.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderTop: idx ? "1px solid #e5e7eb" : "0",
                      paddingTop: idx ? 16 : 0,
                      marginTop: idx ? 16 : 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                        gap: 10,
                      }}
                    >
                      <strong>Contact {idx + 1}</strong>
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(idx)}
                          style={linkButtonStyle}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <label style={labelStyle}>Name</label>
                    <input
                      value={c.name}
                      onChange={(e) => updateContact(idx, { name: e.target.value })}
                      style={inputStyle}
                    />

                    <div style={grid2Style}>
                      <div>
                        <label style={labelStyle}>Relationship</label>
                        <input
                          value={c.relationship ?? ""}
                          onChange={(e) =>
                            updateContact(idx, { relationship: e.target.value })
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Enabled</label>
                        <select
                          value={c.enabled ? "yes" : "no"}
                          onChange={(e) =>
                            updateContact(idx, { enabled: e.target.value === "yes" })
                          }
                          style={inputStyle}
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>

                    <div style={grid2Style}>
                      <div>
                        <label style={labelStyle}>Phone (for SMS)</label>
                        <input
                          value={c.phone ?? ""}
                          onChange={(e) => updateContact(idx, { phone: e.target.value })}
                          placeholder="+61..."
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Email</label>
                        <input
                          value={c.email ?? ""}
                          onChange={(e) => updateContact(idx, { email: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={addContact}
                    disabled={contacts.length >= maxContacts}
                    style={{
                      ...secondaryButtonStyle,
                      opacity: contacts.length >= maxContacts ? 0.5 : 1,
                      cursor: contacts.length >= maxContacts ? "not-allowed" : "pointer",
                    }}
                  >
                    + Add another contact
                  </button>
                </div>
              </section>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                style={{
                  ...primaryButtonStyle,
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save setup"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 15,
  background: "#ffffff",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  marginTop: 10,
  fontWeight: 600,
};

const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
};

const grid2Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderRadius: 12,
  padding: "16px 20px",
  fontSize: 17,
  fontWeight: 600,
  background: "#111827",
  color: "#ffffff",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  background: "#ffffff",
  color: "#111827",
};

const linkButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#b91c1c",
  cursor: "pointer",
  padding: 0,
  fontWeight: 600,
};