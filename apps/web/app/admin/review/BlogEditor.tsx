"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import { createBlogPost } from "./actions";
import { useToast } from "@/components/ui/Toast";

interface BlogEditorProps {
  onPublished: () => void;
}

// ─── Simple markdown → HTML renderer (no external deps) ──────────────────
function renderMarkdown(md: string): string {
  return md
    // Images  ![alt](url)
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:1.5rem 0;display:block;" />'
    )
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.25rem;font-weight:700;margin:1.5rem 0 0.5rem;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.6rem;font-weight:800;margin:2rem 0 0.75rem;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:2rem;font-weight:900;margin:2rem 0 1rem;">$1</h1>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Blockquote
    .replace(
      /^> (.+)$/gm,
      '<blockquote style="border-left:4px solid #e5e7eb;margin:1rem 0;padding:0.5rem 1rem;color:#6b7280;font-style:italic;">$1</blockquote>'
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;">$1</code>'
    )
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:2rem 0;" />')
    // Bullet lists
    .replace(/^[-*] (.+)$/gm, '<li style="margin:0.25rem 0 0.25rem 1.25rem;list-style:disc;">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="margin:1rem 0;">$&</ul>')
    // Paragraphs (double newline = paragraph break)
    .split(/\n\n+/)
    .map((block) =>
      block.startsWith("<") ? block : `<p style="margin:0 0 1.2rem;line-height:1.8;">${block.replace(/\n/g, "<br/>")}</p>`
    )
    .join("\n");
}

export default function BlogEditor({ onPublished }: BlogEditorProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Metadata fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("general");
  const [summary, setSummary] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);

  // Body content
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Image insert dialog
  const [showImgDialog, setShowImgDialog] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Formatting helpers ──────────────────────────────────────────────────
  const insertAtCursor = useCallback((before: string, after = "", placeholder = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end) || placeholder;
    const newBody = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(newBody);
    // Restore focus and selection after state update
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length;
      el.setSelectionRange(cursor, cursor);
    });
  }, [body]);

  const insertLine = useCallback((prefix: string, placeholder = "Text here") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    const before = body.slice(0, lineStart);
    const after = body.slice(lineStart);
    setBody(before + prefix + " " + placeholder + "\n" + after);
    requestAnimationFrame(() => {
      el.focus();
      const pos = lineStart + prefix.length + 1 + placeholder.length;
      el.setSelectionRange(pos, pos);
    });
  }, [body]);

  const handleInsertImage = () => {
    if (!imgUrl.trim()) return;
    const syntax = `\n![${imgAlt || "image"}](${imgUrl.trim()})\n`;
    const el = textareaRef.current;
    const pos = el ? el.selectionStart : body.length;
    setBody(body.slice(0, pos) + syntax + body.slice(pos));
    setImgUrl("");
    setImgAlt("");
    setShowImgDialog(false);
    requestAnimationFrame(() => el?.focus());
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      toast.error("Title and Summary are required.");
      return;
    }
    startTransition(async () => {
      const tagsArray = tags
        ? tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];
      const result = await createBlogPost(
        title, summary, body, coverUrl, author, category, tagsArray, featured, slug || undefined
      );
      if (result.error) {
        toast.error(`Failed to publish: ${result.error}`);
      } else {
        toast.success("Blog post published! Live at /blog");
        // Reset
        setTitle(""); setSlug(""); setAuthor(""); setCategory("general");
        setSummary(""); setCoverUrl(""); setTags(""); setFeatured(false);
        setBody(""); setShowPreview(false);
        onPublished();
      }
    });
  };

  const handleClear = () => {
    if (!confirm("Clear all content?")) return;
    setTitle(""); setSlug(""); setAuthor(""); setCategory("general");
    setSummary(""); setCoverUrl(""); setTags(""); setFeatured(false);
    setBody(""); setShowPreview(false);
  };

  // ── Derived slug preview ────────────────────────────────────────────────
  const slugPreview = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "your-slug";

  return (
    <form onSubmit={handlePublish} className="flex flex-col gap-0 w-full max-w-5xl">
      {/* ── Editor chrome bar (dark, matching admin theme) ── */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-t-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-base">✍️</span>
          <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-extrabold uppercase tracking-widest text-white/80">
            Blog Editor
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] border border-violet-500/30 bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded">
            → /blog/{slugPreview}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition ${!showPreview ? "bg-white text-zinc-900" : "text-white/40 hover:text-white"}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition ${showPreview ? "bg-white text-zinc-900" : "text-white/40 hover:text-white"}`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* ── White editor body ── */}
      <div className="bg-white border-x border-zinc-200 flex flex-col">

        {/* ── Metadata strip (light gray) ── */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Author */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="TheGameBit Staff"
              className="bg-white border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-violet-400 transition"
            />
          </div>
          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-violet-400 transition"
            >
              <option value="general">General</option>
              <option value="games">Games</option>
              <option value="anime">Anime</option>
              <option value="esports">Esports</option>
              <option value="guide">Guide / How-to</option>
              <option value="news">News</option>
              <option value="opinion">Opinion / Editorial</option>
              <option value="review">Review</option>
            </select>
          </div>
          {/* Slug */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Custom Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated"
              className="bg-white border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-violet-400 transition"
            />
          </div>
          {/* Tags */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Tags (comma)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="codm, guide, season-5"
              className="bg-white border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-violet-400 transition"
            />
          </div>
        </div>

        {/* ── Cover image ── */}
        <div className="border-b border-gray-200 px-6 py-4 flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Cover Image URL</label>
          <div className="flex gap-3 items-start">
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-white border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-violet-400 transition"
            />
            {coverUrl && (
              <div className="w-20 h-14 rounded overflow-hidden border border-gray-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        </div>

        {/* ── Title ── */}
        <div className="px-8 pt-8 pb-2">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title"
            className="w-full text-3xl sm:text-4xl font-extrabold text-gray-900 placeholder:text-gray-300 bg-transparent border-none outline-none leading-tight tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          />
        </div>

        {/* ── Summary / Excerpt ── */}
        <div className="px-8 pb-4">
          <textarea
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a short excerpt that hooks the reader (shown on card previews)..."
            rows={2}
            className="w-full text-lg text-gray-500 placeholder:text-gray-300 bg-transparent border-none outline-none resize-none leading-relaxed italic"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          />
        </div>

        <div className="mx-8 border-t border-gray-100" />

        {!showPreview ? (
          <>
            {/* ── Formatting toolbar ── */}
            <div className="flex flex-wrap items-center gap-1 px-6 py-2.5 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
              {/* Text format */}
              <button type="button" title="Bold" onClick={() => insertAtCursor("**", "**", "bold text")}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded font-bold text-sm transition">B</button>
              <button type="button" title="Italic" onClick={() => insertAtCursor("*", "*", "italic text")}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded italic text-sm transition">I</button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              {/* Headings */}
              <button type="button" title="Heading 1" onClick={() => insertLine("#", "Big Heading")}
                className="h-8 px-2 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-xs font-bold transition">H1</button>
              <button type="button" title="Heading 2" onClick={() => insertLine("##", "Section Heading")}
                className="h-8 px-2 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-xs font-bold transition">H2</button>
              <button type="button" title="Heading 3" onClick={() => insertLine("###", "Sub-heading")}
                className="h-8 px-2 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-xs font-bold transition">H3</button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              {/* Block elements */}
              <button type="button" title="Blockquote" onClick={() => insertLine(">", "Quote text")}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-base transition">&ldquo;</button>
              <button type="button" title="Bullet List" onClick={() => insertLine("-", "List item")}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-base transition">•</button>
              <button type="button" title="Inline Code" onClick={() => insertAtCursor("`", "`", "code")}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded font-mono text-xs transition">&lt;/&gt;</button>
              <button type="button" title="Divider" onClick={() => setBody(b => b + "\n\n---\n\n")}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-base transition">—</button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              {/* Image insert */}
              <button
                type="button"
                title="Insert Image"
                onClick={() => setShowImgDialog(true)}
                className="h-8 px-3 flex items-center gap-1.5 text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded text-xs font-bold transition"
              >
                <span>🖼</span> Insert Image
              </button>
              {/* Featured toggle */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFeatured(f => !f)}
                  className={`h-8 px-3 rounded text-xs font-bold uppercase tracking-wider border transition ${featured ? "bg-amber-100 border-amber-300 text-amber-700" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}
                >
                  {featured ? "⭐ Featured" : "☆ Feature"}
                </button>
              </div>
            </div>

            {/* ── Main textarea ── */}
            <div className="px-8 py-6">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`Start writing your post...\n\nTips:\n## Use ## for section headings\n**bold** and *italic* for emphasis\n> for blockquotes\n- for bullet lists\n\`inline code\`\n\n---  for a divider\n\nUse the "Insert Image" button in the toolbar to drop images anywhere in your post.`}
                rows={24}
                className="w-full text-gray-800 text-[1.05rem] leading-[1.85] placeholder:text-gray-300 bg-transparent border-none outline-none resize-none font-[Georgia,'Times_New_Roman',serif]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              />
            </div>
          </>
        ) : (
          /* ── Preview pane ── */
          <div className="px-8 py-8 min-h-[400px]">
            {/* Rendered cover */}
            {coverUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden mb-8 border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            {/* Category + tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-violet-100 text-violet-600 px-2 py-0.5 rounded">
                {category}
              </span>
              {tags.split(",").filter(Boolean).map(t => (
                <span key={t} className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  #{t.trim()}
                </span>
              ))}
            </div>
            {/* Title */}
            <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              className="text-4xl font-black text-gray-900 leading-tight mb-3">
              {title || <span className="text-gray-300">Post Title</span>}
            </h1>
            {/* Author + date */}
            <p className="text-sm text-gray-400 mb-4">
              By <strong className="text-gray-600">{author || "TheGameBit Staff"}</strong> · {new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date())}
            </p>
            {/* Summary */}
            {summary && (
              <p style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                className="text-xl text-gray-500 italic border-l-4 border-gray-200 pl-4 mb-8 leading-relaxed">
                {summary}
              </p>
            )}
            <div className="border-t border-gray-200 mb-8" />
            {/* Body */}
            <div
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1a1a1a", lineHeight: 1.85, fontSize: "1.05rem" }}
              dangerouslySetInnerHTML={{ __html: body ? renderMarkdown(body) : '<p style="color:#d1d5db;">Nothing written yet…</p>' }}
            />
          </div>
        )}
      </div>

      {/* ── Image insert dialog ── */}
      {showImgDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 text-lg">Insert Image</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Image URL *</label>
              <input
                type="url"
                autoFocus
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-violet-400 transition"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleInsertImage())}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Alt Text / Caption</label>
              <input
                type="text"
                value={imgAlt}
                onChange={(e) => setImgAlt(e.target.value)}
                placeholder="Describe the image..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-violet-400 transition"
              />
            </div>
            {imgUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={imgAlt} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowImgDialog(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition">Cancel</button>
              <button type="button" onClick={handleInsertImage}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg transition">
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer action bar (dark, matching admin) ── */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 border-t-0 rounded-b-xl px-5 py-3">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-bold uppercase tracking-wider text-white/30 hover:text-white/60 transition"
        >
          Clear
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/25 hidden sm:block">
            Publishes immediately to <span className="text-violet-400/70 font-mono">/blog/{slugPreview}</span>
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="min-h-9 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-2 text-xs font-bold uppercase tracking-[0.12em] rounded-lg transition"
          >
            {isPending ? "Publishing…" : "✍️ Publish Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
