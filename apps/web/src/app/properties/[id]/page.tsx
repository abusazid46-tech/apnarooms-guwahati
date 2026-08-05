import { PropertyDetailClient } from "./PropertyDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;

  return <PropertyDetailClient propertyId={id} />;
}
