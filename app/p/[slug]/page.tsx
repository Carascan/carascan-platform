"use client";

import { useEffect, useMemo, useState } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const CONTACT_CHAR_LIMIT = 500;
const REPORT_CHAR_LIMIT = 500;
const EMERGENCY_CHAR_LIMIT = 700;

type LocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
};

async function getCoarseLocation(): Promise<LocationSnapshot | null> {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy ?? null,
        }),
      () => resolve(null),
      {
        enableHighAccuracy: false, // 👈 COARSE
        maximumAge: 600000,
        timeout: 5000,
      }
    );
  });
}

async function getPreciseLocation(): Promise<LocationSnapshot> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy ?? null,
        }),
      (err) => reject(err),
      {
        enableHighAccuracy: true, // 👈 PRECISE (user prompted)
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [coarseLocation, setCoarseLocation] =
    useState<LocationSnapshot | null>(null);

  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function init() {
      const resolved = await params;
      setSlug(resolved.slug);

      // 👇 SILENT COARSE LOCATION ON LOAD
      const loc = await getCoarseLocation();
      setCoarseLocation(loc);

      const r = await fetch(`/api/plates/${resolved.slug}`);
      const j = await r.json();

      setData(j);
      setLoading(false);
    }

    init();
  }, [params]);

  async function sendLocation(type: "contact" | "emergency") {
    if (!slug) return;

    try {
      setSending(true);
      setStatus("Requesting location permission...");

      // 👇 ONLY NOW we ask for precise
      const precise = await getPreciseLocation();

      const r = await fetch(
        `/api/plates/${slug}/${type === "emergency" ? "emergency" : "contact"}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            latitude: precise.latitude,
            longitude: precise.longitude,
            accuracy_m: precise.accuracy_m,
            location_source: "device",
            message: type === "emergency" ? "Emergency alert" : "Location report",
          }),
        }
      );

      const j = await r.json();

      if (!r.ok) {
        setStatus(j?.error ?? "Failed.");
        return;
      }

      setStatus("Location sent successfully.");
    } catch {
      setStatus("Location permission denied.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <main>Loading...</main>;

  return (
    <main style={{ padding: 24 }}>
      <img src={LOGO_URL} style={{ maxWidth: 300 }} />

      <h2>{data?.plate?.identifier}</h2>

      {coarseLocation && (
        <div style={{ marginBottom: 12, fontSize: 12, color: "#6b7280" }}>
          Approximate location detected
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        <button
          onClick={() => sendLocation("contact")}
          disabled={sending}
        >
          {sending ? "Sending..." : "Contact Owner"}
        </button>

        <button
          onClick={() => sendLocation("emergency")}
          disabled={sending}
          style={{ background: "red", color: "white" }}
        >
          {sending ? "Sending..." : "Emergency"}
        </button>
      </div>

      {status && <p>{status}</p>}
    </main>
  );
}