"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlateSvg } from "@/lib/laserSvg";
import NavBar from "@/components/NavBar";

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
  emergency_plan?: "3" | "10" | string | null;
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
  enabled?: boolean;
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

const BACKGROUND_IMAGE_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg";

function blankContact(): EmergencyContact {
  return {
    name: "",
    phone: "",
    email: "",
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
  const [contactChannel, setContactChannel] = useState("email");
  const [reportChannel, setReportChannel] = useState("email");
  const [ownerPhone1, setOwnerPhone1] = useState("");
  const [ownerPhone2, setOwnerPhone2] = useState("");
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const maxContacts =
    loadState.status === "ready" &&
    loadState.data.plate?.emergency_plan === "10"
      ? 10
      : 3;

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

        const allowedContacts = data.plate?.emergency_plan === "10" ? 10 : 3;

        const existing = Array.isArray(data.contacts)
          ? data.contacts.slice(0, allowedContacts)
          : [];
        const padded = [...existing];
        while (padded.length < allowedContacts) padded.push(blankContact());

        setContacts(
          padded.map((c) => ({
            id: c.id,
            name: c.name ?? "",
            phone: c.phone ?? "",
            email: c.email ?? "",
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
      }))
      .filter((c) => c.name || c.phone || c.email);
  }, [contacts]);

  const logoUrl =
    loadState.status === "ready"
      ? loadState.data.design?.logo_url?.trim() || DEFAULT_LOGO_URL
      : DEFAULT_LOGO_URL;

  const plateSvg = useMemo(() => {
    if (loadState.status !== "ready") return "";
    if (!loadState.data.plate.identifier || !(embeddedQrHref || qrUrl)) {
      return "";
    }

    return buildPlateSvg({
      identifier: loadState.data.plate.identifier,
      qrImageHref: embeddedQrHref || qrUrl,
      logoImageHref: logoUrl,
      includeCrosshair: false,
    });
  }, [loadState, embeddedQrHref, qrUrl, logoUrl]);

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
        contact_channel: contactChannel,
        report_channel: reportChannel,
        owner_phone_1: ownerPhone1,
        owner_phone_2: ownerPhone2,
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
      <>
        <NavBar variant="inner" />
        <main style={styles.page}>
          <Background />
          <div style={styles.wrapper}>
            <div style={styles.heroCard}>
              <h1 style={styles.heroTitle}>Complete your Carascan setup</h1>
              <p style={styles.heroText}>Loading your setup details...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (loadState.status === "error") {
    return (
      <>
        <NavBar variant="inner" />
        <main style={styles.page}>
          <Background />
          <div style={styles.wrapper}>
            <div style={styles.heroCard}>
              <h1 style={styles.heroTitle}>Setup link issue</h1>
              <p style={styles.error}>{loadState.error}</p>
              <p style={styles.heroText}>
                This setup link may be invalid, expired, revoked, or already
                used.
              </p>
              <p style={styles.heroText}>
                Use the Help button if you need a new setup link.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar variant="inner" />
      <main style={styles.page}>
        <Background />

        <div style={styles.wrapper}>
          <section style={styles.heroCard}>
            <div style={styles.kicker}>Carascan setup</div>
            <h1 style={styles.heroTitle}>Customer configuration page</h1>
            <p style={styles.heroText}>
              Configure your public plate profile, communication preferences,
              and emergency contacts.
            </p>
            <p style={styles.heroSubText}>
              Plate: {loadState.data.plate.identifier}
            </p>
          </section>

          <div style={styles.previewCard}>
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
            <h2 style={styles.h2}>Carascan QR Plate Profile</h2>

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
              General Information (Share everything or share nothing - the choice
              is yours)
              <textarea
                style={styles.textarea}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Optional"
                rows={4}
              />
            </label>

            <div style={styles.channelGrid}>
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
            </div>

            <label style={styles.label}>
              Owner 1 phone (optional - used for SMS notifications only)
              <input
                style={styles.input}
                value={ownerPhone1}
                onChange={(e) => setOwnerPhone1(e.target.value)}
                placeholder="Optional"
              />
            </label>

            <label style={styles.label}>
              Owner 2 phone (optional - used for SMS notifications only)
              <input
                style={styles.input}
                value={ownerPhone2}
                onChange={(e) => setOwnerPhone2(e.target.value)}
                placeholder="Optional"
              />
            </label>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={contactEnabled}
                onChange={(e) => setContactEnabled(e.target.checked)}
              />
              Enable Virtual Doorknock
            </label>

            <h2 style={styles.h2}>
              Emergency contacts - SMS &amp; Email contacted in an emergency
              scan
            </h2>

            <p style={styles.muted}>
              Add up to {maxContacts}. All fields are optional. Emergency alerts
              always send via both email and SMS where details are provided.
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
    </>
  );
}

function Background() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(17,24,39,0.76) 0%, rgba(17,24,39,0.64) 30%, rgba(246,247,249,0.96) 100%)",
          zIndex: 0,
        }}
      />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    padding: "32px 16px 56px",
  },
  wrapper: {
    position: "relative",
    zIndex: 1,
    maxWidth: 980,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  },
  heroCard: {
    background: "rgba(20,26,32,0.72)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    color: "#F3F1EC",
    boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
    backdropFilter: "blur(8px)",
  },
  kicker: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#D7D2C8",
    marginBottom: 10,
  },
  heroTitle: {
    margin: "0 0 10px 0",
    fontSize: 34,
    lineHeight: 1.15,
  },
  heroText: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.65,
    color: "#E5E7EB",
  },
  heroSubText: {
    margin: "12px 0 0 0",
    fontSize: 14,
    color: "#D7D2C8",
    fontWeight: 700,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 14px 34px rgba(17,24,39,0.08)",
  },
  previewCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 14px 34px rgba(17,24,39,0.08)",
  },
  h2: {
    margin: "0 0 16px 0",
    fontSize: 22,
    color: "#111827",
  },
  h3: {
    margin: "0 0 12px 0",
    fontSize: 18,
    color: "#111827",
  },
  muted: {
    color: "#555",
    margin: "4px 0 16px 0",
    lineHeight: 1.6,
  },
  label: {
    display: "block",
    marginBottom: 14,
    fontWeight: 600,
    color: "#111827",
  },
  input: {
    width: "100%",
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
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
    background: "#fff",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    color: "#111827",
  },
  channelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 8,
  },
  contactBlock: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: "#fafafa",
  },
  previewWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  previewFrame: {
    width: "100%",
    maxWidth: 430,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
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
    margin: "0 auto",
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