type Props = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="shell">
      <h1>Property {id}</h1>
      <p>Show full property details, gallery, availability, and token booking CTA.</p>
    </main>
  );
}
