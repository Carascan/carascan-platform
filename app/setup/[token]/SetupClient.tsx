"use client";

type SetupClientProps = {
  token: string;
};

export default function SetupClient({ token }: SetupClientProps) {
  return (
    <main style={{ padding: 24 }}>
      <h1>Carascan setup</h1>
      <p>Setup client is loading correctly.</p>
      <code>{token}</code>
    </main>
  );
}