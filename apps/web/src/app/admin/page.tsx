const stats = [
  ["New Leads", "42", "+12%"],
  ["Site Visits", "18", "Today"],
  ["Token Paid", "13", "This week"],
  ["Open Tickets", "7", "Support"]
];

const pipeline = [
  ["New", 18],
  ["Contacted", 14],
  ["Visit Scheduled", 8],
  ["Negotiation", 6],
  ["Token Paid", 4],
  ["Move-In", 3]
];

const leads = [
  ["Ananya Sharma", "Girls PG Near SPM IAS Academy", "Visit Scheduled", "Sales A"],
  ["Rahul Das", "2BHK Grandeur Flat", "Negotiation", "Sales B"],
  ["Priya Bora", "Velvet Suites PG", "New", "Unassigned"],
  ["Sameer Ali", "Jayanagar Student Room", "Token Paid", "Sales A"]
];

export default function AdminPage() {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>AR</span>
          <strong>ApnaRooms Admin</strong>
        </div>
        <nav>
          <a className="active" href="/admin">Dashboard</a>
          <a href="/admin/properties">Properties</a>
          <a href="/admin/bookings">Bookings</a>
          <a href="/admin/leads">CRM Leads</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/payments">Payments</a>
          <a href="/">Tenant Website</a>
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>Operations CRM</p>
            <h1>Admin Dashboard</h1>
          </div>
          <button type="button">Add Property</button>
        </header>

        <div className="admin-stat-grid">
          {stats.map(([label, value, note]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          ))}
        </div>

        <div className="admin-two-col">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>CRM Pipeline</h2>
              <span>Live funnel</span>
            </div>
            <div className="pipeline-list">
              {pipeline.map(([stage, count]) => (
                <div key={stage}>
                  <span>{stage}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Payment Health</h2>
              <span>Razorpay</span>
            </div>
            <div className="payment-meter">
              <strong>INR 1.84L</strong>
              <p>Verified token payments this month</p>
              <div><span style={{ width: "72%" }} /></div>
            </div>
          </section>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Lead Desk</h2>
            <span>Assigned follow-ups</span>
          </div>
          <div className="lead-table">
            <div className="lead-row head">
              <span>Name</span>
              <span>Property</span>
              <span>Status</span>
              <span>Owner</span>
            </div>
            {leads.map(([name, property, status, owner]) => (
              <div className="lead-row" key={name}>
                <span>{name}</span>
                <span>{property}</span>
                <span>{status}</span>
                <span>{owner}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
