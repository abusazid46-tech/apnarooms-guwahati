type Props = {
  params: Promise<{ propertyId: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { propertyId } = await params;

  return (
    <main className="shell">
      <h1>Checkout</h1>
      <p>Create a Razorpay order for property `{propertyId}` from the backend.</p>
    </main>
  );
}
