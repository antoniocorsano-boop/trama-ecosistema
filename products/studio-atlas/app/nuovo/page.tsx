import { NewPathwayForm } from "../../components/NewPathwayForm";

export default async function NewPathwayPage({ searchParams }: {
  searchParams: Promise<{ modalita?: string | string[] }>;
}) {
  const { modalita } = await searchParams;
  return <NewPathwayForm startInComposition={modalita === "COMPOSITION"} />;
}
