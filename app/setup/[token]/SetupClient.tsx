"use client";

import { useEffect, useState } from "react";

type SetupClientProps = {
  token: string;
};

type ApiState =
  | { status: "loading" }
  | { status: "success"; data: unknown }
  | { status: "error"; error: string; details?: unknown };

export default function SetupClient({ token }: SetupClientProps) {
  const [state, setState] = useState<ApiState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/setup/get?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
            },
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
              : `Request failed with status ${res.status}`;

          setState({
            status: "error",
            error: message,
            details: body,
          });
          return;
        }

        setState({
          status: "success",
          data: body,
        });
      } catch (err) {
        if (cancelled) return;

        setState({
          status: "error",
          error:
            err instanceof Error ? err.message : "Unknown network error",
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#f7f7f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h1 style={{ marginTop: 0 }}>Carascan setup</h1>

        <p>
          <strong>Token</strong>
        </p>
        <code
          style={{
            display: "block",
            padding: 12,
            background: "#f1f1f1",
            borderRadius: 8,
            wordBreak: "break-all",
          }}
        >
          {token}
        </code>

        <div style={{ marginTop: 24 }}>
          {state.status === "loading" && (
            <>
              <p>
                <strong>Status:</strong> Loading setup data...
              </p>
              <p>Calling: <code>/api/setup/get?token=...</code></p>
            </>
          )}

          {state.status === "error" && (
            <>
              <p>
                <strong>Status:</strong> Error
              </p>
              <p>{state.error}</p>

              {state.details !== undefined && (
                <>
                  <p>
                    <strong>Response details</strong>
                  </p>
                  <pre
                    style={{
                      padding: 12,
                      background: "#f8f8f8",
                      borderRadius: 8,
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {JSON.stringify(state.details, null, 2)}
                  </pre>
                </>
              )}
            </>
          )}

          {state.status === "success" && (
            <>
              <p>
                <strong>Status:</strong> Success
              </p>
              <p>
                The token is reaching the API and the API returned a valid JSON
                response.
              </p>

              <p>
                <strong>API response</strong>
              </p>
              <pre
                style={{
                  padding: 12,
                  background: "#f8f8f8",
                  borderRadius: 8,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                {JSON.stringify(state.data, null, 2)}
              </pre>
            </>
          )}
        </div>
      </div>
    </main>
  );
}