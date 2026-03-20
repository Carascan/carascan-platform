"use client";

import { useEffect, useState } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

type LocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
};

type PlateResponse = {
  plate?: {
    identifier?: string;
    contact_enabled?: boolean;
    emergency_enabled?: boolean;
  };
};

async function getPreciseLocation(): Promise<LocationSnapshot> {
  if (!navigator.geolocation) {
    throw new Error("Location access is not supported on this device.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy ?? null,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new Error(
              "Location permission was denied. Please allow access and try again."
            )
          );
          return;
        }

        if (err.code === err.POSITION_UNAVAILABLE) {
          reject(new Error("Your current location could not be determined."));
          return;
        }

        if (err.code === err.TIMEOUT) {
          reject(new Error("Location request timed out. Please try again."));
          return;
        }

        reject(new Error(err.message || "Unable to access your location."));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  });
}

export default function PlatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<PlateResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [reportStatus, setReportStatus] = useState("");
  const [reportBusy, setReportBusy] = useState(false);

  const [emergencyStatus, setEmergencyStatus] = useState("");
  const [emergencyBusy, setEmergencyBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const resolved = await params;
      if (!mounted) return;

      setSlug(resolved.slug);

      try {
        const r = await fetch(`/api/plates/${encodeURIComponent(resolved.slug)}`, {
          cache: "no-store",
        });
        const j = await r.json();

        if (!mounted) return;

        setData(j);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [params]);

  async function sendReportLocation() {
    if (!slug) return;

    try {
      setReportBusy(true);
      setReportStatus("Requesting location permission...");

      const precise = await getPreciseLocation();

      const r = await fetch(
        `/api/plates/${encodeURIComponent(slug)}/report-location`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            latitude: precise.latitude,
            longitude: precise.longitude,
            accuracy_m: precise.accuracy_m,
            location_source: "device",
            message: "Location report",
          }),
        }
      );

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        setReportStatus(j?.error ?? "Failed to send location report.");
        return;
      }

      setReportStatus("Location report sent successfully.");
    } catch (error) {
      setReportStatus(
        error instanceof Error ? error.message : "Failed to send location report."
      );
    } finally {
      setReportBusy(false);
    }
  }

  async function sendEmergencyAlert() {
    if (!slug) return;

    try {
      setEmergencyBusy(true);
      setEmergencyStatus("Requesting location permission...");

      const precise = await getPreciseLocation();

      const r = await fetch(
        `/api/plates/${encodeURIComponent(slug)}/emergency`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            latitude: precise.latitude,
            longitude: precise.longitude,
            accuracy_m: precise.accuracy_m,
            location_source: "device",
            message: "Emergency alert",
          }),
        }
      );

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        setEmergencyStatus(j?.error ?? "Failed to send emergency alert.");
        return;
      }

      setEmergencyStatus("Emergency alert sent successfully.");
    } catch (error) {
      setEmergencyStatus(
        error instanceof Error ? error.message : "Failed to send emergency alert."
      );
    } finally {
      setEmergencyBusy(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 24 }}>Loading...</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <img src={LOGO_URL} alt="Carascan" style={{ maxWidth: 300 }} />

      <h2>{data?.plate?.identifier ?? "Carascan"}</h2>

      <div style={{ marginBottom: 12, fontSize: 12, color: "#6b7280" }}>
        Your device will ask for location permission when you send a report.
      </div>

      <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
        <button onClick={sendReportLocation} disabled={reportBusy}>
          {reportBusy ? "Sending..." : "Report Location"}
        </button>

        {data?.plate?.emergency_enabled !== false && (
          <button
            onClick={sendEmergencyAlert}
            disabled={emergencyBusy}
            style={{ background: "#dc2626", color: "#ffffff" }}
          >
            {emergencyBusy ? "Sending..." : "Emergency"}
          </button>
        )}
      </div>

      {reportStatus && <p>{reportStatus}</p>}
      {emergencyStatus && <p>{emergencyStatus}</p>}
    </main>
  );
}