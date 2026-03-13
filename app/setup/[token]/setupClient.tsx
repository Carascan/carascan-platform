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
  const [preferredChannel, setPreferredChannel] =
    useState<"email" | "sms" | "both">("email");

  const [contacts, setContacts] = useState<Contact[]>([
    { name: "", relationship: "", phone: "", email: "", enabled: true },
  ]);

  const [message, setMessage] = useState("");

  const maxContacts = 3;

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(
          `/api/setup/get?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );

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
          (j.plate?.preferred_contact_channel ?? "email") as
            | "email"
            | "sms"
            | "both"
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
      setMessage(
        "Maximum of 3 contacts on the standard setup. Upgrade to unlock up to 10 contacts."
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
    <main style={{ minHeight: "100vh", padding: "32px 20px", background: "#f7f7f8" }}>
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

            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              style={{ width: "100%", padding: 10, borderRadius: 8 }}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
            </select>
          </section>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "16px 20px",
              fontSize: 17,
              fontWeight: 600,
              background: "#111827",
              color: "#ffffff",
            }}
          >
            {saving ? "Saving..." : "Save setup"}
          </button>
        </div>
      </div>
    </main>
  );
}
