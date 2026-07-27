import { CardDetailView } from "@/components/app/CardDetailView";

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CardDetailView id={id} />;
}
