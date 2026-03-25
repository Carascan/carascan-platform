"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlateSvg } from "@/lib/laserSvg";

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
  report_channel?: string | null;
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
  | { status: "error"; error: string; details?: unknown }
  | { status: "ready"; data: SetupResponse };

const DEFAULT_LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

function blankContact(): EmergencyContact {
  return {
    name: "",
    phone: "",
    email: "",
    enabled: true,
  };
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status}`);
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert image to data URL."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(blob);
  });
}

export default function SetupClient({ token }: SetupClientProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [embeddedQrHref, setEmbeddedQrHref] = useState("");

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadState({ status: "loading" });
        setSaveMessage("");
        setSaveError("");

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
          const errorMessage =
            typeof body === "object" &&
            body !== null &&
            "error" in body &&
            typeof (body as { error?: unknown }).error === "string"
              ? (body as { error: string }).error
              : "Failed to load setup data.";

          setLoadState({
            status: "error",
            error: errorMessage,
            details: body,
          });
          return;
        }

        const data = body as SetupResponse;

        setCaravanName(data.profile?.caravan_name ?? "");
        setBio(data.profile?.bio ?? "");
        setContactEnabled(Boolean(data.plate?.contact_enabled));
        setEmergencyEnabled(Boolean(data.plate?.emergency_enabled));

        const incomingContactChannel =
          data.plate?.preferred_contact_channel || "email";
        setContactChannel(
          incomingContactChannel === "sms" || incomingContactChannel === "both"
            ? incomingContactChannel
            : "email"
        );

        const incomingReportChannel = data.plate?.report_channel || "email";
        setReportChannel(
          incomingReportChannel === "sms" || incomingReportChannel === "both"
            ? incomingReportChannel
            : "email"
        );

        setMountingHoles(data.design?.mounting_holes !== false);

        const existing = Array.isArray(data.contacts)
          ? data.contacts.slice(0, 3)
          : [];
        const padded = [...existing];
        while (padded.length < 3) padded.push(blankContact());

        setContacts(
          padded.map((c) => ({
            id: c.id,
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
          error: "Failed to load setup data.",
          details: err instanceof Error ? err.message : err,
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const qrUrl =
    loadState.status === "ready"
      ? loadState.data.design?.qr_url?.trim() || ""
      : "";

  useEffect(() => {
    let cancelled = false;

    async function embedQr() {
      if (!qrUrl) {
        setEmbeddedQrHref("");
        return;
      }

      try {
        const dataUrl = await imageUrlToDataUrl(qrUrl);
        if (!cancelled) {
          setEmbeddedQrHref(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setEmbeddedQrHref(qrUrl);
        }
      }
    }

    void embedQr();

    return () => {
      cancelled = true;
    };
  }, [qrUrl]);

  const activeContacts = useMemo(() => {
    return contacts
      .map((c) => ({
        id: c.id,
        name: c.name.trim(),
        phone: c.phone.trim(),
        email: c.email.trim(),
        enabled: c.enabled,
      }))
      .filter((c) => c.name || c.phone || c.email);
  }, [contacts]);

  const logoUrl =
    loadState.status === "ready"
      ? loadState.data.design?.logo_url?.trim() || DEFAULT_LOGO_URL
      : DEFAULT_LOGO_URL;

  const plateSvg = useMemo(() => {
    if (loadState.status !== "ready") return "";
    if (!loadState.data.plate.identifier || !(embeddedQrHref || qrUrl)) return "";

    return buildPlateSvg({
      identifier: loadState.data.plate.identifier,
      qrImageHref: embeddedQrHref || qrUrl,
      mountingHoles,
      logoImageHref: logoUrl,
      includeCrosshair: false,
    });
  }, [loadState, embeddedQrHref, qrUrl, mountingHoles, logoUrl]);

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
        contact_channel: contactChannel,
        report_channel: reportChannel,
        mounting_holes: mountingHoles,
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
        <div style={styles.wrapper}>
          <Header />
          <div style={styles.card}>
            <h1 style={styles.h1}>Complete your Carascan setup</h1>
            <p style={styles.muted}>Loading your setup details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (loadState.status === "error") {
    return (
      <main style={styles.page}>
        <div style={styles.wrapper}>
          <Header />
          <div style={styles.card}>
            <h1 style={styles.h1}>Setup link issue</h1>
            <p style={styles.error}>{loadState.error}</p>
            <p style={styles.muted}>
              This setup link may be invalid, expired, revoked, or already used.
            </p>
            <p style={styles.muted}>
              Use the Help button if you need a new setup link.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { data } = loadState;

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <Header />

        <div style={styles.card}>
          <h1 style={{ ...styles.h1, textAlign: "center" }}>
            Customer Configuration Page
          </h1>
          <p style={{ ...styles.muted, textAlign: "center" }}>
            Plate: <strong>{data.plate.identifier}</strong>
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>Plate preview</h2>

          <div style={styles.previewWrap}>
            {plateSvg ? (
              <div
                style={styles.previewFrame}
                dangerouslySetInnerHTML={{ __html: plateSvg }}
              />
            ) : (
              <div style={styles.previewPlaceholder}>
                QR preview not available yet.
              </div>
            )}
          </div>
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

          <h2 style={styles.h2}>Emergency contacts</h2>
          <p style={styles.muted}>
            Add up to 3. All fields are optional. Emergency alerts always send
            via both email and SMS where details are provided.
          </p>

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
      </div>
    </main>
  );
}

function Header() {
  return (
    <div style={styles.header}>
      <a href="/" style={styles.logoWrap}>
        <img
          src="https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg"
          alt="Carascan"
          style={styles.logo}
        />
      </a>

      <a href="/help" style={styles.helpButton}>
        Need help?
      </a>
    </div>
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 4,
  },
  logoWrap: {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
  },
  logo: {
    height: 32,
    width: "auto",
    display: "block",
  },
  helpButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
    background: "#111827",
    color: "#ffffff",
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
  previewWrap: {
    display: "flex",
    justifyContent: "center",
    marginTop: 8,
  },
  previewFrame: {
    width: "100%",
    maxWidth: 430,
  },
  previewLink: {
    display: "block",
    width: "100%",
    maxWidth: 430,
    textDecoration: "none",
    color: "inherit",
  },
  previewPlaceholder: {
    width: "100%",
    maxWidth: 430,
    minHeight: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f8fafc",
    color: "#6b7280",
  },
  inlineLink: {
    color: "#111827",
    fontWeight: 700,
    textDecoration: "underline",
  },
  button: {
    padding: "12px 18px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    background: "#111827",
    color: "#fff",
  },
  error: {
    color: "#b00020",
    fontWeight: 700,
  },
  success: {
    color: "#0a7f39",
    fontWeight: 700,
  },
};