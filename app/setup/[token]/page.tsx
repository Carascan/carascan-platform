import SetupClient from "./setupClient";

export default function SetupPage({ params }: { params: { token: string } }) {
  return <SetupClient token={params.token} />;
}
