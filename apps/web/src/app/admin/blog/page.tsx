"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api";
import type { BackendBlogPost } from "@/types/api";

type BlogForm = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  body: string;
  status: BackendBlogPost["status"];
};

const initialForm: BlogForm = {
  title: "",
  slug: "",
  category: "Tenant Tips",
  excerpt: "",
  coverImage: "",
  authorName: "ApnaRooms Team",
  body: "",
  status: "DRAFT"
};

function postToForm(post: BackendBlogPost): BlogForm {
  return {
    title: post.title,
    slug: post.slug,
    category: post.category ?? "",
    excerpt: post.excerpt ?? "",
    coverImage: post.coverImage ?? "",
    authorName: post.authorName ?? "ApnaRooms Team",
    body: post.body,
    status: post.status
  };
}

function formatDate(value?: string | null) {
  if (!value) return "Not published";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function AdminBlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BackendBlogPost[]>([]);
  const [form, setForm] = useState<BlogForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPosts() {
    if (!user) return;
    const result = await apiFetch<{ posts: BackendBlogPost[] }>("/blog/admin", { user });
    setPosts(result.posts);
  }

  useEffect(() => {
    loadPosts().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load blog posts."));
  }, [user]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function buildPayload(statusOverride?: BackendBlogPost["status"]) {
    return {
      title: form.title,
      slug: form.slug || undefined,
      category: form.category || null,
      excerpt: form.excerpt || null,
      coverImage: form.coverImage || null,
      authorName: form.authorName || null,
      body: form.body,
      status: statusOverride ?? form.status
    };
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(editingId ? "Updating blog post..." : "Creating blog post...");

    try {
      if (editingId) {
        await apiPatch(`/blog/admin/${editingId}`, buildPayload(), { user });
        setMessage("Blog post updated.");
      } else {
        await apiPost("/blog/admin", buildPayload(), { user });
        setMessage("Blog post created.");
      }
      resetForm();
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Blog save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(post: BackendBlogPost, status: BackendBlogPost["status"]) {
    if (!user) return;
    await apiPatch(`/blog/admin/${post.id}`, { status }, { user });
    await loadPosts();
  }

  async function removePost(post: BackendBlogPost) {
    if (!user) return;
    await apiDelete(`/blog/admin/${post.id}`, { user });
    await loadPosts();
  }

  return (
    <AdminShell active="/admin/blog">
      <section className="admin-main">
        <header className="admin-topbar">
          <div><p>Content publishing</p><h1>Blog</h1></div>
        </header>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>{editingId ? "Edit Blog Post" : "Write Blog Post"}</h2>
            <span>{message}</span>
          </div>
          <form className="admin-form blog-editor-form" onSubmit={savePost}>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Post title" required />
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Custom slug, optional" />
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category, e.g. Tenant Tips" />
            <input value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} placeholder="Author name" />
            <input value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} placeholder="Cover image URL" />
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as BackendBlogPost["status"] })}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <textarea value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} placeholder="Short excerpt for the website card" rows={3} />
            <textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Write the full blog content here" rows={12} required />
            <div className="admin-form-actions">
              <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Post" : "Save Post"}</button>
              <button type="button" disabled={saving} onClick={() => setForm({ ...form, status: "PUBLISHED" })}>Mark Published</button>
              {editingId ? <button type="button" onClick={resetForm}>Cancel Edit</button> : null}
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>All Blog Posts</h2><span>{posts.length} total</span></div>
          <div className="lead-table blog-admin-table">
            <div className="lead-row blog-row head"><span>Post</span><span>Status</span><span>Published</span><span>Actions</span></div>
            {posts.map((post) => (
              <div className="lead-row blog-row" key={post.id}>
                <span>
                  <strong>{post.title}</strong>
                  <small>{post.category ?? "Uncategorized"} - /{post.slug}</small>
                </span>
                <select value={post.status} onChange={(event) => updateStatus(post, event.target.value as BackendBlogPost["status"])}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
                <span>{formatDate(post.publishedAt)}</span>
                <span className="admin-actions">
                  <button type="button" onClick={() => {
                    setEditingId(post.id);
                    setForm(postToForm(post));
                    setMessage(`Editing ${post.title}`);
                  }}>Edit</button>
                  <button type="button" onClick={() => removePost(post)}>Delete</button>
                </span>
              </div>
            ))}
            {!posts.length ? <div className="lead-row blog-row"><span>No blog posts yet.</span></div> : null}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
