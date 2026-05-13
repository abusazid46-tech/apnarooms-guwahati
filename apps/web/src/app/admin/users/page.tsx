"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiFetch, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BackendUser } from "@/types/api";

const roles: BackendUser["role"][] = ["USER", "ADMIN", "SALES", "SUPPORT", "LANDLORD"];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<BackendUser[]>([]);

  async function loadUsers() {
    if (!user) return;
    const result = await apiFetch<{ users: BackendUser[] }>("/users/admin", { user });
    setUsers(result.users);
  }

  useEffect(() => {
    loadUsers().catch(() => {});
  }, [user]);

  async function updateRole(id: string, role: BackendUser["role"]) {
    if (!user) return;
    await apiPatch(`/users/admin/${id}/role`, { role }, { user });
    await loadUsers();
  }

  return (
    <AdminShell active="/admin/users">
      <section className="admin-main">
        <header className="admin-topbar"><div><p>Access</p><h1>Users</h1></div></header>
        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Accounts</h2><span>{users.length} users</span></div>
          <div className="lead-table">
            <div className="lead-row head"><span>Name</span><span>Contact</span><span>Phone</span><span>Role</span></div>
            {users.map((item) => (
              <div className="lead-row" key={item.id}>
                <span>{item.name ?? "User"}</span>
                <span>{item.email ?? "-"}</span>
                <span>{item.phone ?? "-"}</span>
                <select value={item.role} onChange={(e) => updateRole(item.id, e.target.value as BackendUser["role"])}>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
