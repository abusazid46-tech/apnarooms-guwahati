"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BackendLead, BackendProperty, Paginated } from "@/types/api";

const statuses: BackendLead["status"][] = [
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "VISIT_COMPLETED",
  "NEGOTIATION",
  "TOKEN_PAID",
  "MOVED_IN",
  "LOST"
];

export default function AdminLeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<BackendLead[]>([]);
  const [properties, setProperties] = useState<BackendProperty[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", propertyId: "" });

  async function load() {
    if (!user) return;
    const [leadResult, propertyResult] = await Promise.all([
      apiFetch<Paginated<"leads", BackendLead>>("/leads/admin?limit=100", { user }),
      apiFetch<Paginated<"properties", BackendProperty>>("/properties/admin?limit=100", { user })
    ]);
    setLeads(leadResult.leads);
    setProperties(propertyResult.properties);
  }

  useEffect(() => {
    load().catch(() => {});
  }, [user]);

  async function createLead(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    await apiPost(
      "/leads",
      {
        name: form.name || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        message: form.message || undefined,
        propertyId: form.propertyId || undefined,
        source: "admin"
      },
      { user }
    );
    setForm({ name: "", phone: "", email: "", message: "", propertyId: "" });
    await load();
  }

  async function updateLead(id: string, status: BackendLead["status"]) {
    if (!user) return;
    await apiPatch(`/leads/admin/${id}`, { status }, { user });
    await load();
  }

  async function removeLead(id: string) {
    if (!user) return;
    await apiDelete(`/leads/admin/${id}`, { user });
    await load();
  }

  return (
    <AdminShell active="/admin/leads">
      <section className="admin-main">
        <header className="admin-topbar"><div><p>CRM</p><h1>Lead Desk</h1></div></header>
        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Add Lead</h2><span>Manual entry</span></div>
          <form className="admin-form" onSubmit={createLead}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
              <option value="">General inquiry</option>
              {properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}
            </select>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message" />
            <button type="submit">Create Lead</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Leads</h2><span>{leads.length} records</span></div>
          <div className="lead-table">
            <div className="lead-row head"><span>Name</span><span>Property</span><span>Status</span><span>Action</span></div>
            {leads.map((lead) => (
              <div className="lead-row" key={lead.id}>
                <span>{lead.name ?? lead.phone ?? lead.email ?? "Unknown"}</span>
                <span>{lead.property?.title ?? "General"}</span>
                <select value={lead.status} onChange={(e) => updateLead(lead.id, e.target.value as BackendLead["status"])}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="button" onClick={() => removeLead(lead.id)}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
