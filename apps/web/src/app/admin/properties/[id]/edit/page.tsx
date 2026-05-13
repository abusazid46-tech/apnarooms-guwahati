type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="shell">
      <h1>Edit Property {id}</h1>
      <p>Load the property and submit changes to the admin API.</p>
    </main>
  );
}
