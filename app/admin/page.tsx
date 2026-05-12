"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Location } from "@/lib/locations";
import {
  subscribeLocations,
  saveLocations,
  resetToDefaults,
  checkAdminPassword,
  setAdminPassword,
} from "@/lib/locationStorage";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  LangCode,
  TranslationKey,
} from "@/lib/i18n";
import {
  locationTranslations,
  saveLocationTranslation,
  subscribeLocationTranslations,
  type LocTranslationOverrides,
  type LocationContent,
} from "@/lib/locationTranslations";

const AdminMapPicker = dynamic(() => import("@/components/AdminMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center" style={{ height: "220px" }}>
      <span className="text-purple-400 text-sm animate-pulse">Loading map…</span>
    </div>
  ),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  id: string;
  name: string;
  description: string;
  story: string;
  modelUrl: string;
  modelObj: string;
  modelMtl: string;
  videoUrl: string;
  images: string; // newline-separated list of image URLs
  emoji: string;
  reward: string;
  lat: number;
  lng: number;
}

function formToLocation(f: FormData): import("@/lib/locations").Location {
  const imageList = f.images.split("\n").map((u) => u.trim()).filter(Boolean);
  return {
    id: f.id,
    name: f.name || "Untitled",
    description: f.description,
    story: f.story,
    modelUrl: f.modelUrl || undefined,
    modelObj: f.modelObj || undefined,
    modelMtl: f.modelMtl || undefined,
    videoUrl: f.videoUrl || undefined,
    images: imageList.length > 0 ? imageList : undefined,
    emoji: f.emoji || "🏛️",
    reward: f.reward,
    lat: f.lat,
    lng: f.lng,
  };
}

const BLANK_FORM = (): FormData => ({
  id: generateId(),
  name: "",
  description: "",
  story: "",
  modelUrl: "",
  modelObj: "",
  modelMtl: "",
  videoUrl: "",
  images: "",
  emoji: "🏛️",
  reward: "",
  lat: 43.8563,
  lng: 18.4131,
});

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminPage() {
  // Auth state
  const [authed, setAuthed] = useState(false);
  const [pwdInput, setPwdInput] = useState("");
  const [pwdError, setPwdError] = useState("");

  // Dashboard state
  const [locs, setLocs] = useState<Location[]>([]);
  const [form, setForm] = useState<FormData | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Preview pane state
  const [previewLang, setPreviewLang] = useState<LangCode>("en");
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const transPreviewIframeRef = useRef<HTMLIFrameElement>(null);

  // 3D model upload state
  const [uploadObjFile, setUploadObjFile] = useState<File | null>(null);
  const [uploadMtlFile, setUploadMtlFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadMsg, setUploadMsg] = useState("");

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [newPwdConfirm, setNewPwdConfirm] = useState("");
  const [pwdChangeMsg, setPwdChangeMsg] = useState("");

  // Translations state
  const [showTranslations, setShowTranslations] = useState(false);
  const [transActiveLang, setTransActiveLang] = useState<LangCode>("en");
  // overrides keyed by lang→key→value (edited in-memory, not yet saved)
  const [transEdits, setTransEdits] = useState<Partial<Record<LangCode, Partial<Record<TranslationKey, string>>>>>({});
  const [transLoading, setTransLoading] = useState(false);
  const [transSaving, setTransSaving] = useState(false);
  const [transSavedMsg, setTransSavedMsg] = useState("");

  // Location content translations state
  const [showLocTrans, setShowLocTrans] = useState(false);
  const [locTransActiveLang, setLocTransActiveLang] = useState<LangCode>("en");
  const [locTransActiveLocId, setLocTransActiveLocId] = useState<string>("");
  const [locTransOverrides, setLocTransOverrides] = useState<LocTranslationOverrides>({});
  // in-memory edits per locId+lang: { [locId]: { [lang]: { name, description, story } } }
  const [locTransEdits, setLocTransEdits] = useState<LocTranslationOverrides>({});
  const [locTransSaving, setLocTransSaving] = useState(false);
  const [locTransSavedMsg, setLocTransSavedMsg] = useState("");

  useEffect(() => {
    if (authed) return subscribeLocations((locs) => setLocs(locs));
  }, [authed]);

  // Subscribe to Firebase location translation overrides
  useEffect(() => {
    if (!authed) return;
    return subscribeLocationTranslations((data) => {
      setLocTransOverrides(data);
      // Merge Firebase data into edits so admin sees latest saved values
      setLocTransEdits((prev) => {
        const next = { ...prev };
        for (const locId of Object.keys(data)) {
          next[locId] = { ...(next[locId] ?? {}), ...(data[locId] ?? {}) };
        }
        return next;
      });
    });
  }, [authed]);

  // ── Preview iframe sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!form) return;
    function send() {
      if (!previewIframeRef.current?.contentWindow) return;
      previewIframeRef.current.contentWindow.postMessage(
        { type: "admin_preview", loc: formToLocation(form!), lang: previewLang },
        window.location.origin
      );
    }
    send();
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "preview_ready") send();
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [form, previewLang]);

  // ── Translations preview iframe sync ──────────────────────────────────────
  useEffect(() => {
    if (!showTranslations) return;
    function send() {
      if (!transPreviewIframeRef.current?.contentWindow) return;
      // Merge built-in defaults with any edits for the active lang
      const builtIn = TRANSLATIONS[transActiveLang] ?? TRANSLATIONS.en;
      const edits = transEdits[transActiveLang] ?? {};
      const merged = { ...builtIn, ...edits };
      transPreviewIframeRef.current.contentWindow.postMessage(
        { type: "admin_trans_preview", lang: transActiveLang, translations: merged },
        window.location.origin
      );
    }
    send();
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "trans_preview_ready") send();
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [showTranslations, transActiveLang, transEdits]);

  // ── Auth ────────────────────────────────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (await checkAdminPassword(pwdInput)) {
      setAuthed(true);
      setPwdError("");
    } else {
      setPwdError("Incorrect password.");
    }
  }
  // ── 3D model upload ─────────────────────────────────────────────────────────────

  async function handleModelUpload() {
    if (!uploadObjFile || !uploadMtlFile || !form) return;
    setUploadStatus("uploading");
    setUploadMsg("");
    try {
      const fd = new FormData();
      fd.append("objFile", uploadObjFile);
      fd.append("mtlFile", uploadMtlFile);
      fd.append("slug", form.reward || form.name || form.id);
      const res = await fetch("/api/upload-model", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      updateField("modelObj", data.objPath);
      updateField("modelMtl", data.mtlPath);
      setUploadStatus("done");
      setUploadMsg(`✓ Uploaded! Paths auto-filled below.`);
      setUploadObjFile(null);
      setUploadMtlFile(null);
    } catch (err: unknown) {
      setUploadStatus("error");
      setUploadMsg(err instanceof Error ? err.message : "Upload failed.");
    }
  }
  // ── CRUD ────────────────────────────────────────────────────────────────────

  function startEdit(loc: Location) {
    setIsAdding(false);
    setForm({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      story: loc.story || "",
      modelUrl: loc.modelUrl || "",
      modelObj: loc.modelObj || "",
      modelMtl: loc.modelMtl || "",
      videoUrl: loc.videoUrl || "",
      images: (loc.images || []).join("\n"),
      emoji: loc.emoji,
      reward: loc.reward,
      lat: loc.lat,
      lng: loc.lng,
    });
  }

  function startAdd() {
    setIsAdding(true);
    setForm(BLANK_FORM());
  }

  function closeForm() {
    setForm(null);
    setIsAdding(false);
  }

  function updateField(field: keyof FormData, value: string | number) {
    if (!form) return;
    const next = { ...form, [field]: value };
    // Auto-generate reward ID from location name when adding
    if (isAdding && field === "name") {
      next.reward = slugify(value as string);
    }
    setForm(next);
  }

  function handleMapPick(lat: number, lng: number) {
    if (!form) return;
    setForm({ ...form, lat, lng });
  }

  async function saveForm() {
    if (!form) return;
    if (!form.name.trim()) return alert("Location name is required.");
    if (!form.reward.trim()) return alert("Reward ID is required.");

    const imageList = form.images
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const updated: Location = {
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim(),
      story: form.story.trim(),
      modelUrl: form.modelUrl.trim(),
      modelObj: form.modelObj.trim() || undefined,
      modelMtl: form.modelMtl.trim() || undefined,
      videoUrl: form.videoUrl.trim() || undefined,
      images: imageList.length > 0 ? imageList : undefined,
      emoji: form.emoji || "🏛️",
      reward: form.reward.trim(),
      lat: form.lat,
      lng: form.lng,
    };

    const exists = locs.some((l) => l.id === form.id);
    const next = exists
      ? locs.map((l) => (l.id === form.id ? { ...l, ...updated } : l))
      : [...locs, updated];

    await saveLocations(next); // RTDB write — subscribeLocations listener auto-updates locs state
    closeForm();
  }

  async function deleteLocation(id: string) {
    const next = locs.filter((l) => l.id !== id);
    await saveLocations(next); // RTDB write — listener auto-updates locs
    setConfirmDeleteId(null);
  }

  async function handleReset() {
    await resetToDefaults(); // RTDB write — listener auto-updates locs
    closeForm();
    setShowSettings(false);
  }

  async function handleChangePwd(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd.length < 4) { setPwdChangeMsg("Min. 4 characters."); return; }
    if (newPwd !== newPwdConfirm) { setPwdChangeMsg("Passwords do not match."); return; }
    await setAdminPassword(newPwd);
    setNewPwd("");
    setNewPwdConfirm("");
    setPwdChangeMsg("✓ Password updated!");
  }

  // ── Password gate ────────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#07040D] flex items-center justify-center p-5 relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[220px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)" }}
        />
        <div className="w-full max-w-sm relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[20px] bg-purple-500/[0.08] border border-purple-500/[0.14] text-[44px] mb-4">
              🛡️
            </div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-white/35 text-sm mt-1.5">Sarajevo Hotspot Game</p>
          </div>
          <div className="bg-[#0E0B1A] rounded-2xl border border-white/[0.06] p-6 shadow-2xl shadow-black/60">
            <h2 className="text-white font-semibold text-[15px] mb-5">Enter your password</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] mb-2">Password</label>
                <input
                  type="password"
                  value={pwdInput}
                  onChange={(e) => setPwdInput(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  suppressHydrationWarning
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all duration-200"
                />
                {pwdError && <p className="text-red-400 text-xs mt-1.5">{pwdError}</p>}
              </div>
              <button
                type="submit"
                suppressHydrationWarning
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm"
              >
                Enter Admin Panel
              </button>
            </form>
          </div>
          <p className="text-center text-white/20 text-xs mt-5">Default password: <span className="font-mono text-white/35">admin</span></p>
        </div>
      </main>
    );
  }

  // ── Edit / Add form ─────────────────────────────────────────────────────────

  if (form) {
    return (
      <div className="min-h-screen bg-[#07040D] pb-10">
        {/* Sticky header */}
        <div className="bg-[#0E0B1A]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 sticky top-0 z-20 flex items-center gap-3">
          <button onClick={closeForm} className="text-purple-400 text-sm font-medium flex-shrink-0">
            ← Back
          </button>
          <h1 className="text-white font-bold flex-1 truncate text-[15px]">
            {isAdding ? "Add New Location" : `Edit: ${form.name || "…"}`}
          </h1>
          <button
            onClick={saveForm}
            className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-[0.97]"
          >
            Save
          </button>
        </div>

        <div className="lg:flex lg:items-start">
        <div className="lg:flex-1 lg:min-w-0">
        <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
          {/* Location info */}
          <div className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-4 space-y-4">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">📍 Location</h2>
            <div>
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Location Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Baščaršija"
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Short description shown on the location card"
                rows={2}
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all resize-none"
              />
            </div>
          </div>

          {/* Reward info */}
          <div className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-4 space-y-4">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">🏆 Collection Entry</h2>
            <div className="flex gap-3">
              <div className="flex-1">
                {/* Show the custom icon image when available; fall back to emoji text input */}
                {(() => {
                  const currentIcon = locs.find((l) => l.id === form.id)?.icon;
                  return currentIcon ? (
                    <div>
                      <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Icon</label>
                      <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 flex items-center justify-center" style={{ minHeight: "56px" }}>
                        <img src={currentIcon} alt={form.name} className="h-10 w-10 object-contain" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Emoji</label>
                      <input
                        type="text"
                        value={form.emoji}
                        onChange={(e) => updateField("emoji", e.target.value)}
                        placeholder="🏛️"
                        maxLength={4}
                        className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-4 py-3 text-center text-2xl focus:outline-none focus:border-purple-500/40 transition-all"
                      />
                    </div>
                  );
                })()}
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-1">
                  Reward ID <span className="text-white/20 normal-case font-normal">(unique)</span>
                </label>
                <input
                  type="text"
                  value={form.reward}
                  onChange={(e) => updateField("reward", e.target.value)}
                  placeholder="sebilj"
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
                />
                {isAdding && (
                  <p className="text-white/20 text-xs mt-1">Auto-filled from name.</p>
                )}
              </div>
            </div>
          </div>

          {/* Story */}
          <div className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-4 space-y-4">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">📖 Story</h2>
            <div>
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Historical Narrative</label>
              <textarea
                value={form.story}
                onChange={(e) => updateField("story", e.target.value)}
                placeholder="Write the historical story of this landmark. This is shown when users tap on a collected location in their collection."
                rows={6}
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all resize-none leading-relaxed"
              />
            </div>
            {/* ── 3D Model Upload ── */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">🧊 Upload 3D Model Files</h3>
              <p className="text-white/25 text-xs leading-relaxed">
                Select your <span className="font-mono text-purple-400/70">.obj</span> and <span className="font-mono text-purple-400/70">.mtl</span> files. They will be saved to <span className="font-mono">public/models/{form.reward || "folder"}/</span> and the paths below will be filled automatically.
              </p>

              <div className="space-y-2">
                {/* OBJ file picker */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest w-8 flex-shrink-0">OBJ</span>
                  <div className="flex-1 bg-white/[0.03] border border-white/[0.08] group-hover:border-purple-500/30 rounded-xl px-3 py-2 transition-all">
                    <span className="text-xs font-mono truncate block" style={{ color: uploadObjFile ? "#c4b5fd" : "rgba(255,255,255,0.2)" }}>
                      {uploadObjFile ? uploadObjFile.name : "Click to choose .obj file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".obj"
                    className="sr-only"
                    onChange={(e) => { setUploadObjFile(e.target.files?.[0] ?? null); setUploadStatus("idle"); setUploadMsg(""); }}
                  />
                </label>

                {/* MTL file picker */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest w-8 flex-shrink-0">MTL</span>
                  <div className="flex-1 bg-white/[0.03] border border-white/[0.08] group-hover:border-purple-500/30 rounded-xl px-3 py-2 transition-all">
                    <span className="text-xs font-mono truncate block" style={{ color: uploadMtlFile ? "#c4b5fd" : "rgba(255,255,255,0.2)" }}>
                      {uploadMtlFile ? uploadMtlFile.name : "Click to choose .mtl file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".mtl"
                    className="sr-only"
                    onChange={(e) => { setUploadMtlFile(e.target.files?.[0] ?? null); setUploadStatus("idle"); setUploadMsg(""); }}
                  />
                </label>
              </div>

              {uploadMsg && (
                <p className={`text-xs font-medium ${uploadStatus === "done" ? "text-green-400" : "text-red-400"}`}>
                  {uploadMsg}
                </p>
              )}

              <button
                type="button"
                onClick={handleModelUpload}
                disabled={!uploadObjFile || !uploadMtlFile || uploadStatus === "uploading"}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-xl transition-all active:scale-[0.98]"
              >
                {uploadStatus === "uploading" ? "Uploading…" : "Upload Files"}
              </button>
            </div>

            {/* Manual path overrides */}
            <div>
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">
                Local OBJ Model Path <span className="text-white/20 normal-case font-normal">(auto-filled after upload, or enter manually)</span>
              </label>
              <input
                type="text"
                value={form.modelObj}
                onChange={(e) => updateField("modelObj", e.target.value)}
                placeholder="/models/sebilj+3d+model/model.obj"
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">
                Local MTL Path <span className="text-white/20 normal-case font-normal">(auto-filled after upload, or enter manually)</span>
              </label>
              <input
                type="text"
                value={form.modelMtl}
                onChange={(e) => updateField("modelMtl", e.target.value)}
                placeholder="/models/sebilj+3d+model/model.mtl"
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
              />
              <p className="text-white/20 text-xs mt-1.5">
                OBJ takes priority over Sketchfab URL.
              </p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">
                Sketchfab Embed URL <span className="text-white/20 normal-case font-normal">(fallback if no OBJ)</span>
              </label>
              <input
                type="url"
                value={form.modelUrl}
                onChange={(e) => updateField("modelUrl", e.target.value)}
                placeholder="https://sketchfab.com/models/{id}/embed"
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">
                Video URL <span className="text-white/20 normal-case font-normal">(YouTube embed or direct)</span>
              </label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
              />
              <p className="text-white/20 text-xs mt-1.5">
                Shown above the historical story in the collection detail view.
              </p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">
                Photo Gallery <span className="text-white/20 normal-case font-normal">(one image URL per line)</span>
              </label>
              <textarea
                value={form.images}
                onChange={(e) => updateField("images", e.target.value)}
                placeholder={"https://upload.wikimedia.org/…/Sebilj.jpg\nhttps://example.com/photo2.jpg"}
                rows={4}
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all resize-none leading-relaxed"
              />
              <p className="text-white/20 text-xs mt-1.5">
                Paste one direct image URL per line. Shown as a horizontal photo strip below the story.
              </p>
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-4 space-y-4">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">🗺️ Coordinates</h2>
            <p className="text-white/30 text-xs">Tap anywhere on the map to drop the pin, or type manually.</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.lat}
                  onChange={(e) => updateField("lat", parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.lng}
                  onChange={(e) => updateField("lng", parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
                />
              </div>
            </div>
            <AdminMapPicker lat={form.lat} lng={form.lng} emoji={form.emoji} onPick={handleMapPick} />
          </div>

          {/* Bottom actions */}
          <div className="flex gap-3">
            <button
              onClick={closeForm}
              className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveForm}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>{/* /form */}
        </div>{/* /left col */}

          {/* Right: phone preview (desktop only) */}
          <div className="hidden lg:block w-[380px] flex-none px-4 pt-5 pb-10 self-start">
            <div className="sticky top-[73px] space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">📱 Live Preview</p>
                <span className="text-[10px] font-mono text-green-400/60 bg-green-400/[0.07] border border-green-400/[0.12] px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setPreviewLang(l.code)}
                    className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                    style={{
                      background: previewLang === l.code ? "rgba(168,85,247,0.20)" : "rgba(255,255,255,0.04)",
                      border: previewLang === l.code ? "1px solid rgba(168,85,247,0.45)" : "1px solid rgba(255,255,255,0.07)",
                      color: previewLang === l.code ? "#E9D5FF" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    <img
                      src={`https://flagcdn.com/w20/${l.countryCode}.png`}
                      srcSet={`https://flagcdn.com/w40/${l.countryCode}.png 2x`}
                      width={14}
                      height={11}
                      alt={l.label}
                      className="rounded-[2px] flex-shrink-0"
                      style={{ objectFit: "cover" }}
                    />
                    <span>{l.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
              {/* Phone mockup shell */}
              <div
                className="rounded-[44px] overflow-hidden mx-auto"
                style={{
                  width: 304,
                  border: "8px solid #1a182b",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.07), 0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                {/* Status bar */}
                <div className="h-7 bg-[#07040D] flex items-center justify-between px-4 flex-none">
                  <span className="text-white/35 text-[10px] font-semibold tabular-nums">9:41</span>
                  <div className="w-14 h-[14px] rounded-full bg-[#1a182b]" />
                  <div className="flex items-center gap-0.5">
                    <svg width="13" height="8" viewBox="0 0 13 8" fill="none">
                      <rect x="0" y="3.5" width="2.5" height="4.5" rx="0.4" fill="rgba(255,255,255,0.5)" />
                      <rect x="3.5" y="2" width="2.5" height="6" rx="0.4" fill="rgba(255,255,255,0.5)" />
                      <rect x="7" y="0.5" width="2.5" height="7.5" rx="0.4" fill="rgba(255,255,255,0.5)" />
                      <rect x="10.5" y="0" width="2.5" height="8" rx="0.4" fill="rgba(255,255,255,0.2)" />
                    </svg>
                  </div>
                </div>
                {/* Preview iframe */}
                <iframe
                  ref={previewIframeRef}
                  src="/admin/preview"
                  title="Landmark Preview"
                  className="w-full block border-0"
                  style={{ height: 556 }}
                />
                {/* Home indicator */}
                <div className="h-5 bg-[#07040D] flex items-center justify-center">
                  <div className="w-20 h-[3px] rounded-full bg-white/[0.12]" />
                </div>
              </div>
            </div>
          </div>
        </div>{/* /lg:flex */}
      </div>
    );
  }

  // ── Translations ──────────────────────────────────────────────────────────────

  async function loadTranslations() {
    setTransLoading(true);
    try {
      // Seed every field with built-in defaults so nothing is blank
      const base: Partial<Record<LangCode, Partial<Record<TranslationKey, string>>>> = {};
      for (const l of SUPPORTED_LANGUAGES) {
        base[l.code] = { ...(TRANSLATIONS[l.code] ?? TRANSLATIONS.en) };
      }

      // Overlay Firebase overrides on top (may fail if rules block unauthenticated reads)
      try {
        const snap = await get(ref(db, "translations"));
        if (snap.exists()) {
          const firebaseData = snap.val() as typeof base;
          for (const l of SUPPORTED_LANGUAGES) {
            if (firebaseData[l.code]) {
              base[l.code] = { ...base[l.code], ...firebaseData[l.code] };
            }
          }
        }
      } catch (fbErr) {
        console.warn("[Admin] Could not read /translations from Firebase (check DB rules):", fbErr);
      }

      setTransEdits(base);
    } finally {
      setTransLoading(false);
    }
  }

  async function saveTranslationsForLang() {
    setTransSaving(true);
    setTransSavedMsg("");
    try {
      const langData = transEdits[transActiveLang] ?? {};
      await set(ref(db, `translations/${transActiveLang}`), langData);
      setTransSavedMsg("\u2713 Saved!");
      setTimeout(() => setTransSavedMsg(""), 3000);
    } catch (err) {
      setTransSavedMsg("Error saving.");
    } finally {
      setTransSaving(false);
    }
  }

  // ── Location Translations helpers ─────────────────────────────────────────

  function updateLocTransEdit(
    locId: string,
    lang: LangCode,
    field: keyof LocationContent,
    value: string
  ) {
    setLocTransEdits((prev) => {
      const locEdits = prev[locId] ?? {};
      const langEdits: LocationContent = {
        name: "",
        description: "",
        story: "",
        ...(locEdits[lang] ?? {}),
        [field]: value,
      };
      return { ...prev, [locId]: { ...locEdits, [lang]: langEdits } };
    });
  }

  async function saveLocTransForCurrentCell() {
    if (!locTransActiveLocId) return;
    const content = locTransEdits[locTransActiveLocId]?.[locTransActiveLang];
    if (!content) return;
    setLocTransSaving(true);
    setLocTransSavedMsg("");
    try {
      await saveLocationTranslation(locTransActiveLocId, locTransActiveLang, content);
      setLocTransSavedMsg("✓ Saved!");
      setTimeout(() => setLocTransSavedMsg(""), 3000);
    } catch {
      setLocTransSavedMsg("Error saving.");
    } finally {
      setLocTransSaving(false);
    }
  }

  function updateTransEdit(key: TranslationKey, value: string) {
    setTransEdits((prev) => ({
      ...prev,
      [transActiveLang]: {
        ...(prev[transActiveLang] ?? {}),
        [key]: value,
      },
    }));
  }

  // ── Location Translations view ─────────────────────────────────────────────

  if (showLocTrans) {
    const activeLoc = locs.find((l) => l.id === locTransActiveLocId) ?? locs[0];
    const activeLocId = activeLoc?.id ?? "";

    // Get current edit values with fallback chain:
    // 1) in-memory edits, 2) hardcoded locationTranslations, 3) English from loc
    function getEditValue(field: keyof LocationContent): string {
      const edit = locTransEdits[activeLocId]?.[locTransActiveLang];
      if (edit?.[field] !== undefined && edit[field] !== "") return edit[field];
      const hardcoded = locationTranslations[activeLocId]?.[locTransActiveLang];
      if (hardcoded?.[field]) return hardcoded[field];
      // Fall back to English
      if (locTransActiveLang !== "en") {
        const hardEn = locationTranslations[activeLocId]?.en;
        if (hardEn?.[field]) return hardEn[field];
      }
      // Fall back to location defaults (en)
      if (activeLoc) {
        if (field === "name") return activeLoc.name;
        if (field === "description") return activeLoc.description;
        if (field === "story") return activeLoc.story;
      }
      return "";
    }

    const hasSavedOverride = !!(locTransOverrides[activeLocId]?.[locTransActiveLang]);

    return (
      <div className="min-h-screen bg-[#07040D] pb-10">
        {/* Header */}
        <div className="bg-[#0E0B1A]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 sticky top-0 z-20 flex items-center gap-3">
          <button onClick={() => setShowLocTrans(false)} className="text-purple-400 text-sm font-medium flex-shrink-0">
            ← Back
          </button>
          <h1 className="text-white font-bold flex-1 text-[15px]">Location Translations</h1>
          {locTransSavedMsg && <span className="text-green-400 text-xs font-medium">{locTransSavedMsg}</span>}
          <button
            onClick={saveLocTransForCurrentCell}
            disabled={locTransSaving || !activeLocId}
            className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-[0.97]"
          >
            {locTransSaving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          <p className="text-white/30 text-xs leading-relaxed">
            Edit the <strong className="text-white/50">name</strong>, <strong className="text-white/50">description</strong> and <strong className="text-white/50">story</strong> for each landmark in every language. Changes are saved to Firebase and applied instantly.
          </p>

          {/* Location selector */}
          <div className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-4 space-y-3">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">📍 Select Location</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
              {locs.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setLocTransActiveLocId(loc.id)}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: locTransActiveLocId === loc.id ? "rgba(168,85,247,0.22)" : "rgba(255,255,255,0.04)",
                    border: locTransActiveLocId === loc.id ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.07)",
                    color: locTransActiveLocId === loc.id ? "#E9D5FF" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {loc.icon
                    ? <img src={loc.icon} alt="" className="w-5 h-5 object-contain rounded" />
                    : <span>{loc.emoji}</span>}
                  <span>{loc.name}</span>
                  {locTransOverrides[loc.id] && (
                    <span className="text-[9px] text-purple-400/70 bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                      {Object.keys(locTransOverrides[loc.id]!).length} langs
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeLocId && (
            <>
              {/* Language tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {SUPPORTED_LANGUAGES.map((l) => {
                  const hasOverride = !!(locTransOverrides[activeLocId]?.[l.code]);
                  return (
                    <button
                      key={l.code}
                      onClick={() => setLocTransActiveLang(l.code)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: locTransActiveLang === l.code ? "rgba(168,85,247,0.22)" : "rgba(255,255,255,0.04)",
                        border: locTransActiveLang === l.code ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.07)",
                        color: locTransActiveLang === l.code ? "#E9D5FF" : "rgba(255,255,255,0.55)",
                      }}
                    >
                      <img
                        src={`https://flagcdn.com/w20/${l.countryCode}.png`}
                        srcSet={`https://flagcdn.com/w40/${l.countryCode}.png 2x`}
                        width={16} height={12} alt={l.label}
                        className="rounded-[2px] flex-shrink-0"
                        style={{ objectFit: "cover" }}
                      />
                      <span>{l.label}</span>
                      {hasOverride && <span className="w-1.5 h-1.5 rounded-full bg-green-400/70 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  hasSavedOverride
                    ? "text-green-400 bg-green-500/[0.08] border border-green-500/[0.15]"
                    : "text-white/30 bg-white/[0.04] border border-white/[0.07]"
                }`}>
                  {hasSavedOverride ? "✓ Firebase override active" : "Using built-in translation"}
                </span>
                {hasSavedOverride && (
                  <button
                    onClick={async () => {
                      if (!window.confirm("Reset this language to the built-in translation?")) return;
                      await saveLocationTranslation(activeLocId, locTransActiveLang, {
                        name: "", description: "", story: "",
                      });
                    }}
                    className="text-white/20 hover:text-white/40 text-xs"
                  >
                    ↺ reset to built-in
                  </button>
                )}
              </div>

              {/* Editable fields */}
              <div className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-4 space-y-4"
                style={{ direction: locTransActiveLang === "ar" ? "rtl" : "ltr" }}
              >
                <div>
                  <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Name</label>
                  <input
                    type="text"
                    value={getEditValue("name")}
                    onChange={(e) => updateLocTransEdit(activeLocId, locTransActiveLang, "name", e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Description</label>
                  <textarea
                    value={getEditValue("description")}
                    onChange={(e) => updateLocTransEdit(activeLocId, locTransActiveLang, "description", e.target.value)}
                    rows={2}
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Story</label>
                  <textarea
                    value={getEditValue("story")}
                    onChange={(e) => updateLocTransEdit(activeLocId, locTransActiveLang, "story", e.target.value)}
                    rows={10}
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>

              <button
                onClick={saveLocTransForCurrentCell}
                disabled={locTransSaving || !activeLocId}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                {locTransSaving ? "Saving…" : `Save ${SUPPORTED_LANGUAGES.find((l) => l.code === locTransActiveLang)?.label} translation`}
              </button>
            </>
          )}

          {locs.length === 0 && (
            <div className="text-center py-10 text-white/25 text-sm">No locations found.</div>
          )}
        </div>
      </div>
    );
  }

  // ── Translations view ────────────────────────────────────────────────────

  if (showTranslations) {
    const allKeys = Object.keys(TRANSLATIONS.en) as TranslationKey[];

    return (
      <div className="min-h-screen bg-[#07040D] pb-10">
        <div className="bg-[#0E0B1A]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 sticky top-0 z-20 flex items-center gap-3">
          <button
            onClick={() => setShowTranslations(false)}
            className="text-purple-400 text-sm font-medium flex-shrink-0"
          >
            ← Back
          </button>
          <h1 className="text-white font-bold flex-1 text-[15px]">Translations</h1>
          {transSavedMsg && (
            <span className="text-green-400 text-xs font-medium">{transSavedMsg}</span>
          )}
          <button
            onClick={saveTranslationsForLang}
            disabled={transSaving}
            className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-[0.97]"
          >
            {transSaving ? "Saving…" : "Save"}
          </button>
        </div>

        {transLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-white/30 text-sm animate-pulse">Loading…</p>
          </div>
        ) : (
          <div className="lg:flex lg:items-start">
            {/* Left: key editor */}
            <div className="lg:flex-1 lg:min-w-0">
          <div className="max-w-2xl mx-auto px-4 pt-4">
            {/* Language tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setTransActiveLang(l.code)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: transActiveLang === l.code ? "rgba(168,85,247,0.22)" : "rgba(255,255,255,0.04)",
                    border: transActiveLang === l.code ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.07)",
                    color: transActiveLang === l.code ? "#E9D5FF" : "rgba(255,255,255,0.55)",
                  }}
                >
                  <img
                    src={`https://flagcdn.com/w20/${l.countryCode}.png`}
                    srcSet={`https://flagcdn.com/w40/${l.countryCode}.png 2x`}
                    width={16}
                    height={12}
                    alt={l.label}
                    className="rounded-[2px] flex-shrink-0"
                    style={{ objectFit: "cover" }}
                  />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            <p className="text-white/30 text-xs mb-4">
              All fields are pre-filled with built-in translations for <strong className="text-white/50">{SUPPORTED_LANGUAGES.find((l) => l.code === transActiveLang)?.label}</strong>.
              Edit any value and tap <strong className="text-white/50">Save</strong> — changes are written to Firebase and applied instantly to all users.
            </p>

            {/* Keys */}
            <div className="space-y-2 pb-8">
              {allKeys.map((key) => {
                const builtIn = TRANSLATIONS[transActiveLang]?.[key] ?? TRANSLATIONS.en[key] ?? "";
                const value = (transEdits[transActiveLang] ?? {})[key] ?? builtIn;
                const isModified = value !== builtIn;
                return (
                  <div key={key} className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-purple-400/70 text-[10px] font-mono">{key}</span>
                      {isModified && (
                        <button
                          onClick={() => updateTransEdit(key, builtIn)}
                          className="text-white/20 hover:text-white/40 text-xs flex-shrink-0"
                          title="Reset to built-in default"
                        >
                          ↺ reset
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateTransEdit(key, e.target.value)}
                      className="w-full bg-white/[0.03] border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500/40 transition-all"
                      style={{
                        borderColor: isModified ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)",
                        color: isModified ? "#E9D5FF" : "rgba(255,255,255,0.75)",
                        direction: transActiveLang === "ar" ? "rtl" : "ltr",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>{/* /max-w-2xl */}
          </div>{/* /left col */}

            {/* Right: phone preview (desktop only) */}
            <div className="hidden lg:block w-[380px] flex-none px-4 pt-5 pb-10 self-start">
              <div className="sticky top-[73px] space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">📱 Live Preview</p>
                  <span className="text-[10px] font-mono text-green-400/60 bg-green-400/[0.07] border border-green-400/[0.12] px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                {/* Phone mockup shell */}
                <div
                  className="rounded-[44px] overflow-hidden mx-auto"
                  style={{
                    width: 304,
                    border: "8px solid #1a182b",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.07), 0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Status bar */}
                  <div className="h-7 bg-[#07040D] flex items-center justify-between px-4 flex-none">
                    <span className="text-white/35 text-[10px] font-semibold tabular-nums">9:41</span>
                    <div className="w-14 h-[14px] rounded-full bg-[#1a182b]" />
                    <div className="flex items-center gap-0.5">
                      <svg width="13" height="8" viewBox="0 0 13 8" fill="none">
                        <rect x="0" y="3.5" width="2.5" height="4.5" rx="0.4" fill="rgba(255,255,255,0.5)" />
                        <rect x="3.5" y="2" width="2.5" height="6" rx="0.4" fill="rgba(255,255,255,0.5)" />
                        <rect x="7" y="0.5" width="2.5" height="7.5" rx="0.4" fill="rgba(255,255,255,0.5)" />
                        <rect x="10.5" y="0" width="2.5" height="8" rx="0.4" fill="rgba(255,255,255,0.2)" />
                      </svg>
                    </div>
                  </div>
                  {/* Preview iframe */}
                  <iframe
                    ref={transPreviewIframeRef}
                    src="/admin/preview-translations"
                    title="Translations Preview"
                    className="w-full block border-0"
                    style={{ height: 556 }}
                  />
                  {/* Home indicator */}
                  <div className="h-5 bg-[#07040D] flex items-center justify-center">
                    <div className="w-20 h-[3px] rounded-full bg-white/[0.12]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Settings view ───────────────────────────────────────────────────────

  if (showSettings) {
    return (
      <div className="min-h-screen bg-[#07040D] pb-10">
        <div className="bg-[#0E0B1A]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 sticky top-0 z-20 flex items-center gap-3">
          <button onClick={() => { setShowSettings(false); setPwdChangeMsg(""); }} className="text-purple-400 text-sm font-medium">
            ← Back
          </button>
          <h1 className="text-white font-bold flex-1 text-[15px]">Settings</h1>
        </div>

        <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
          {/* Change password */}
          <div className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-4 space-y-4">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">🔑 Change Admin Password</h2>
            <form onSubmit={handleChangePwd} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">New Password</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Min. 4 characters"
                  suppressHydrationWarning
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] block mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={newPwdConfirm}
                  onChange={(e) => setNewPwdConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  suppressHydrationWarning
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 transition-all"
                />
              </div>
              {pwdChangeMsg && (
                <p className={`text-xs font-medium ${pwdChangeMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                  {pwdChangeMsg}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] text-sm"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="bg-[#0E0B1A] border border-red-500/[0.12] rounded-2xl p-4 space-y-3">
            <h2 className="text-[11px] font-bold text-red-400/70 uppercase tracking-[0.1em]">⚠️ Danger Zone</h2>
            <p className="text-white/35 text-sm leading-relaxed">
              Reset all locations back to the 5 default Sarajevo hotspots. Any custom changes will be lost permanently.
            </p>
            <button
              onClick={() => {
                if (window.confirm("Reset all locations to defaults? All custom edits will be lost.")) {
                  handleReset();
                }
              }}
              className="w-full bg-red-500/[0.08] hover:bg-red-500/[0.14] border border-red-500/20 text-red-400 font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Reset to Default Locations
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#07040D] pb-10">
      {/* Header */}
      <div className="bg-[#0E0B1A]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white font-bold text-[17px] tracking-tight">🛡️ Admin Panel</h1>
            <p className="text-white/30 text-xs mt-0.5">{locs.length} location{locs.length !== 1 ? "s" : ""} on the map</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowTranslations(true);
                loadTranslations();
              }}
              className="h-9 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5 text-white/40 hover:text-purple-400 hover:border-purple-500/30 transition-all text-xs font-semibold"
              title="Translations"
            >
              🌐 Translations
            </button>
            <button
              onClick={() => {
                setShowLocTrans(true);
                if (!locTransActiveLocId && locs.length > 0) setLocTransActiveLocId(locs[0].id);
              }}
              className="h-9 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5 text-white/40 hover:text-purple-400 hover:border-purple-500/30 transition-all text-xs font-semibold"
              title="Location Translations"
            >
              🗺️ Loc Translations
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-all text-base"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
        <button
          onClick={startAdd}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none font-bold">+</span> Add New Location
        </button>
      </div>

      {/* Locations list */}
      <div className="px-4 py-4 space-y-2.5 max-w-lg mx-auto">
        {locs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📍</div>
            <p className="text-white/25 text-sm">No locations yet. Tap the button above to add one.</p>
          </div>
        )}

        {locs.map((loc) => (
          <div
            key={loc.id}
            className="bg-[#0E0B1A] border border-white/[0.07] rounded-2xl p-4 transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Icon / emoji badge */}
              <div className="w-11 h-11 bg-white/[0.03] border border-white/[0.07] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {loc.icon
                  ? <img src={loc.icon} alt={loc.name} className="w-full h-full object-contain p-1" />
                  : loc.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{loc.name}</p>
                <p className="text-purple-500/60 text-xs mt-0.5 truncate">{loc.description}</p>
                <p className="text-white/20 text-xs mt-0.5 font-mono truncate">{loc.reward}</p>
                {loc.description && (
                  <p className="text-white/30 text-xs mt-1 line-clamp-1">{loc.description}</p>
                )}
                <p className="text-white/15 text-xs mt-0.5">
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
                <button
                  onClick={() => startEdit(loc)}
                  className="bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] text-white/60 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  title="Edit"
                >
                  ✏️
                </button>

                {confirmDeleteId === loc.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteLocation(loc.id)}
                      className="bg-red-500/[0.12] hover:bg-red-500/[0.20] border border-red-500/25 text-red-400 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                      title="Confirm delete"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="bg-white/[0.04] hover:bg-white/[0.08] text-white/40 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                      title="Cancel"
                    >
                      ✗
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(loc.id)}
                    className="bg-red-500/[0.06] hover:bg-red-500/[0.12] border border-red-500/[0.12] text-red-400/60 hover:text-red-400 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

