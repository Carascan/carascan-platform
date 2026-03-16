import SetupClient from "./SetupClient";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <SetupClient token={token} />;
}