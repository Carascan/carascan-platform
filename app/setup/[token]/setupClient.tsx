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
  const [identifier, setIdentifier] = useState<string>("");

  const [bio, setBio] = useState("");

  const [contactEnabled, setContactEnabled] = useState(true);
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [preferredChannel, setPreferredChannel] =
    useState<"email" | "sms" | "both">("email");

  const [contacts, setContacts] = useState<Contact[]>([
    { name: "", relationship: "", phone: "", email: "", enabled: true },
  ]);

  const [message, setMessage] = useState("");

  const maxContacts = 3;

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const r = await fetch(
          `/api/setup/get?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );

        const j = await r.json();

        if (!r.ok) {
          if (!active) return;
          setMessage(j?.error ?? "Invalid or expired setup link.");
          setLoading(false);
          return;
        }

        if (!active) return;

        setPlateId(j.plateId ?? null);
        setIdentifier(j.plate?.identifier ?? "");

        setBio(j.profile?.bio ?? "");
        setContactEnabled(j.plate?.contact_enabled ?? true);
        setEmergencyEnabled(j.plate?.emergency_enabled ?? true);

        setPreferredChannel(
          (j.plate?.preferred_contact_channel ?? "email") as
            | "email"
            | "sms"
            | "both",
        );

        const incomingContacts =
          j.contacts?.length > 0
            ? j.contacts
            : [
                {
                  name: "",
                  relationship: "",
                  phone: "",
                  email: "",
                  enabled: true,
                },
              ];

        setContacts(
          incomingContacts.map((c: any) => ({
            id: c.id,
            name: c.name ?? "",
            relationship: c.relationship ?? "",
            phone: c.phone ?? "",
            email: c.email ?? "",
            enabled: c.enabled !== false,
          })),
        );
      } catch {
        if (!active) return;
        setMessage("Failed to load setup details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
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
      setMessage(
        "Maximum of 3 contacts on the standard setup. Upgrade to unlock up to 10 contacts.",
      );
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

    const cleanedContacts = contacts
      .map((c) => ({
        ...c,
        name: c.name.trim(),
        relationship: c.relationship?.trim() ?? "",
        phone: c.phone?.trim() ?? "",
        email: c.email?.trim() ?? "",
      }))
      .filter((c) => c.name || c.phone || c.email);

    setSaving(true);

    const payload = {
      token,
      caravanName: null,
      text1: "",
      text2: "",
      bio: bio.trim() || null,
      contactEnabled,
      emergencyEnabled,
      preferredChannel,
      contacts: cleanedContacts,
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

      setMessage("Saved. Your plate is now active.");
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
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
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

            {identifier && (
              <p style={{ margin: "12px 0 0", color: "#111827", fontWeight: 600 }}>
                Plate reference: {identifier}
              </p>
            )}
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

            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={contactEnabled}
                onChange={(e) => setContactEnabled(e.target.checked)}
              />
              Enable Contact button
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
              }}
            >
              <input
                type="checkbox"
                checked={emergencyEnabled}
                onChange={(e) => setEmergencyEnabled(e.target.checked)}
              />
              Enable Emergency button
            </label>

            <label style={{ marginTop: 12, display: "block", fontWeight: 600 }}>
              Owner receives alerts via
            </label>

            <select
              value={preferredChannel}
              onChange={(e) =>
                setPreferredChannel(e.target.value as "email" | "sms" | "both")
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
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
            <h3 style={{ marginTop: 0 }}>Optional notes</h3>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Add optional notes or details"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                resize: "vertical",
              }}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3 style={{ margin: 0 }}>Emergency contacts</h3>
              <button
                type="button"
                onClick={addContact}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontWeight: 600,
                  background: "#e5e7eb",
                  color: "#111827",
                  cursor: "pointer",
                }}
              >
                Add contact
              </button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {contacts.map((contact, idx) => (
                <div
                  key={contact.id ?? idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                        Name
                      </label>
                      <input
                        value={contact.name}
                        onChange={(e) =>
                          updateContact(idx, { name: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                        Relationship
                      </label>
                      <input
                        value={contact.relationship ?? ""}
                        onChange={(e) =>
                          updateContact(idx, { relationship: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                        Phone
                      </label>
                      <input
                        value={contact.phone ?? ""}
                        onChange={(e) =>
                          updateContact(idx, { phone: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                        Email
                      </label>
                      <input
                        value={contact.email ?? ""}
                        onChange={(e) =>
                          updateContact(idx, { email: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={contact.enabled}
                        onChange={(e) =>
                          updateContact(idx, { enabled: e.target.checked })
                        }
                      />
                      Enabled
                    </label>

                    <button
                      type="button"
                      onClick={() => removeContact(idx)}
                      style={{
                        border: 0,
                        borderRadius: 8,
                        padding: "8px 12px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 12,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Need more than 3 contacts?
              </div>
              <button
                type="button"
                onClick={goToUpgradeCheckout}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontWeight: 600,
                  background: "#111827",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Upgrade to 10 contacts
              </button>
            </div>
          </section>

          <button
            type="button"
            onClick={save}
            disabled={saving || !plateId}
            style={{
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "16px 20px",
              fontSize: 17,
              fontWeight: 600,
              background: "#111827",
              color: "#ffffff",
              opacity: saving || !plateId ? 0.7 : 1,
              cursor: saving || !plateId ? "default" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save setup"}
          </button>
        </div>
      </div>
    </main>
  );
}