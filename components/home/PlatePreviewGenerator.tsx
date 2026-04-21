"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlateSvg } from "@/lib/laserSvg";

type Props = {
  identifier: string;
  qrImageHref: string;
  logoImageHref?: string;
};

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

export default function PlatePreviewGenerator({
  identifier,
  qrImageHref,
  logoImageHref,
}: Props) {
  const [embeddedQrHref, setEmbeddedQrHref] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function embedQr() {
      if (!qrImageHref) {
        setEmbeddedQrHref("");
        return;
      }

      try {
        const dataUrl = await imageUrlToDataUrl(qrImageHref);
        if (!cancelled) {
          setEmbeddedQrHref(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setEmbeddedQrHref(qrImageHref);
        }
      }
    }

    void embedQr();

    return () => {
      cancelled = true;
    };
  }, [qrImageHref]);

  const plateSvg = useMemo(() => {
    if (!identifier || !(embeddedQrHref || qrImageHref)) return "";

    return buildPlateSvg({
      identifier,
      qrImageHref: embeddedQrHref || qrImageHref,
      logoImageHref,
    });
  }, [identifier, embeddedQrHref, qrImageHref, logoImageHref]);

  if (!plateSvg) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      dangerouslySetInnerHTML={{ __html: plateSvg }}
    />
  );
}