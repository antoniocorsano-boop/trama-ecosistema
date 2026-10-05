import { PathwayWorkspace } from "../../../components/PathwayWorkspace";

export default async function PathwayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PathwayWorkspace id={id} />;
}
