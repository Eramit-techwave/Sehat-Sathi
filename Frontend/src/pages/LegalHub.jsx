/**
 * LegalHub.jsx — Enterprise Legal Documentation Viewer
 * Sehat-Sathi | v1.0 | 01 August 2026
 *
 * Features:
 * - All 50 legal documents in grouped sidebar
 * - English / Hindi language toggle
 * - Sticky table of contents per document
 * - Search across documents
 * - Print / Copy support
 * - Version badge + effective date
 * - Responsive layout
 */
import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Globe, Printer, Copy, Check, ChevronRight, ChevronDown, X, FileText } from "lucide-react";
import FULL_DOCUMENT_REGISTRY from "../legal/legalDocuments";

// ── Helpers ──────────────────────────────────────────────────────────────────
function getDocLang(doc, lang) {
  if (!doc?.data) return null;
  // For documents from terms.js, data has {en, hi} or {sections:[]}
  const d = doc.data;
  if (d?.en && d?.hi) return lang === "hi" ? d.hi : d.en;
  if (d?.sections) return d; // flat structure
  return d;
}

function getSections(langData) {
  if (!langData) return [];
  if (Array.isArray(langData.sections)) return langData.sections;
  if (Array.isArray(langData.content)) return langData.content;
  if (langData.rights) return langData.rights.map((r, i) => ({ id: String(i), title: r, content: "" }));
  return [];
}

function getDocTitle(doc, lang) {
  const d = getDocLang(doc, lang);
  return d?.title || doc.label;
}

function getDocSubtitle(doc, lang) {
  const d = getDocLang(doc, lang);
  return d?.subtitle || "";
}

// Group docs
function groupDocs(registry) {
  const groups = {};
  registry.forEach(doc => {
    const g = doc.group || "Other";
    if (!groups[g]) groups[g] = [];
    groups[g].push(doc);
  });
  return groups;
}

// ── Mini Components ───────────────────────────────────────────────────────────
function SectionContent({ section, lang }) {
  const body = section.body || section.content || section.text || "";
  return (
    <div style={{ marginBottom: 28 }}>
      {section.heading || section.title ? (
        <h3 style={{
          fontSize: 15, fontWeight: 700,
          color: "var(--text)",
          marginBottom: 10, marginTop: 0,
          paddingBottom: 6,
          borderBottom: "1px solid var(--border)",
        }}>
          {section.heading || section.title}
        </h3>
      ) : null}
      {body && (
        <p style={{
          fontSize: 13.5, lineHeight: 1.85,
          color: "var(--text-secondary)",
          whiteSpace: "pre-line",
          margin: 0,
        }}>
          {body}
        </p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LegalHub() {
  const [activeLang, setActiveLang] = useState("en");
  const [activeDocId, setActiveDocId] = useState(FULL_DOCUMENT_REGISTRY[0]?.id || "terms");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef(null);

  const grouped = useMemo(() => groupDocs(FULL_DOCUMENT_REGISTRY), []);

  // Initialize all groups expanded & read ?doc= URL parameter
  useEffect(() => {
    const initial = {};
    Object.keys(groupDocs(FULL_DOCUMENT_REGISTRY)).forEach(g => { initial[g] = true; });
    setExpandedGroups(initial);

    try {
      const params = new URLSearchParams(window.location.search);
      const docParam = params.get("doc");
      if (docParam && FULL_DOCUMENT_REGISTRY.some(d => d.id === docParam)) {
        setActiveDocId(docParam);
      }
    } catch {}
  }, []);

  const filteredRegistry = useMemo(() => {
    if (!searchQuery.trim()) return FULL_DOCUMENT_REGISTRY;
    const q = searchQuery.toLowerCase();
    return FULL_DOCUMENT_REGISTRY.filter(doc =>
      doc.label.toLowerCase().includes(q) ||
      doc.labelHi?.includes(q) ||
      doc.group?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredGrouped = useMemo(() => groupDocs(filteredRegistry), [filteredRegistry]);

  const activeDoc = FULL_DOCUMENT_REGISTRY.find(d => d.id === activeDocId);
  const langData = getDocLang(activeDoc, activeLang);
  const sections = getSections(langData);

  function handleCopy() {
    const text = sections.map(s => `${s.heading || s.title || ""}\n${s.body || s.content || ""}`).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #2563EB 60%, #1D4ED8 100%)",
        padding: "40px 6% 36px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -20, left: "40%", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
              <FileText size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 2 }}>
                Legal Documentation
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                Sehat-Sathi Legal Hub
              </h1>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: "0 0 20px", maxWidth: 640, lineHeight: 1.6 }}>
            Complete enterprise-grade legal documentation for all Sehat-Sathi platforms.
            50 bilingual documents covering all aspects of our healthcare technology platform.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Documents", value: "50" },
              { label: "Languages", value: "EN + HI" },
              { label: "Version", value: "v1.0" },
              { label: "Effective", value: "01 Aug 2026" },
              { label: "Compliance", value: "IT Act · DPDP · Telemedicine" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 14px", backdropFilter: "blur(8px)" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", maxWidth: 1200, margin: "0 auto", width: "100%", padding: "0 6%", gap: 0 }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: sidebarOpen ? 280 : 0,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          transition: "width 0.25s ease",
          overflow: "hidden",
          position: "sticky",
          top: 68,
          height: "calc(100vh - 68px)",
          overflowY: "auto",
        }}>
          <div style={{ padding: "20px 0 40px", minWidth: 280 }}>

            {/* Search */}
            <div style={{ padding: "0 16px 16px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--surface-alt)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
              }}>
                <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    border: "none", background: "transparent", outline: "none",
                    fontSize: 13, color: "var(--text)", width: "100%",
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 0 }}>
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Doc count */}
            <div style={{ padding: "0 16px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {filteredRegistry.length} Documents
            </div>

            {/* Groups */}
            {Object.entries(filteredGrouped).map(([group, docs]) => (
              <div key={group}>
                {/* Group header */}
                <button
                  onClick={() => setExpandedGroups(g => ({ ...g, [group]: !g[group] }))}
                  style={{
                    width: "100%", border: "none", background: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 16px", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  {group}
                  {expandedGroups[group] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {/* Docs in group */}
                {expandedGroups[group] && docs.map(doc => {
                  const isActive = activeDocId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => { setActiveDocId(doc.id); contentRef.current?.scrollTo(0, 0); }}
                      style={{
                        width: "100%", border: "none",
                        background: isActive ? "var(--primary-light)" : "transparent",
                        cursor: "pointer", textAlign: "left",
                        padding: "8px 16px 8px 20px",
                        display: "flex", alignItems: "center", gap: 8,
                        transition: "all 0.1s",
                        borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--surface-alt)"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{doc.icon}</span>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{
                          fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                          color: isActive ? "var(--primary)" : "var(--text)",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {activeLang === "hi" && doc.labelHi ? doc.labelHi : doc.label}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div style={{ height: 8 }} />
              </div>
            ))}
          </div>
        </aside>

        {/* ── Document Viewer ── */}
        <main
          ref={contentRef}
          style={{
            flex: 1,
            padding: "32px 40px",
            maxHeight: "calc(100vh - 68px)",
            overflowY: "auto",
            minWidth: 0,
          }}
        >
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 28, flexWrap: "wrap", gap: 12,
          }}>
            {/* Left: sidebar toggle + breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{
                  background: "var(--surface-alt)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "8px 10px",
                  cursor: "pointer", display: "flex", color: "var(--text-secondary)",
                }}
              >
                {sidebarOpen ? <X size={14} /> : <FileText size={14} />}
              </button>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {activeDoc?.group} →
                <span style={{ fontWeight: 600, color: "var(--text)", marginLeft: 4 }}>
                  {activeLang === "hi" && activeDoc?.labelHi ? activeDoc.labelHi : activeDoc?.label}
                </span>
              </div>
            </div>

            {/* Right: Language toggle + actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Language toggle */}
              <div style={{
                display: "flex", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", overflow: "hidden",
              }}>
                {["en", "hi"].map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLang(l)}
                    style={{
                      border: "none", padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      background: activeLang === l ? "var(--primary)" : "var(--surface)",
                      color: activeLang === l ? "#fff" : "var(--text-secondary)",
                      transition: "all 0.15s",
                    }}
                  >
                    <Globe size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                    {l === "en" ? "English" : "हिन्दी"}
                  </button>
                ))}
              </div>

              {/* Copy */}
              <button
                onClick={handleCopy}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "var(--surface-alt)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "6px 12px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)",
                }}
              >
                {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "var(--surface-alt)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "6px 12px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)",
                }}
              >
                <Printer size={13} />
                Print
              </button>
            </div>
          </div>

          {/* Document Content */}
          {activeDoc && langData ? (
            <div style={{ maxWidth: 760 }}>
              {/* Doc header */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 14px)",
                padding: "24px 28px",
                marginBottom: 28,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <span style={{ fontSize: 32 }}>{activeDoc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                        background: "rgba(37,99,235,0.1)", color: "var(--primary)",
                        border: "1px solid rgba(37,99,235,0.2)",
                        borderRadius: 6, padding: "2px 8px", textTransform: "uppercase",
                      }}>
                        v{activeDoc.data?.meta?.version || "1.0"}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                        background: "rgba(16,185,129,0.1)", color: "#059669",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: 6, padding: "2px 8px",
                      }}>
                        Effective: {activeDoc.data?.meta?.effectiveDate || "01 August 2026"}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        background: "var(--surface-alt)", color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        borderRadius: 6, padding: "2px 8px",
                      }}>
                        {activeDoc.group}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                      {getDocTitle(activeDoc, activeLang)}
                    </h2>
                    {getDocSubtitle(activeDoc, activeLang) && (
                      <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                        {getDocSubtitle(activeDoc, activeLang)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Preamble (for Terms) */}
              {langData?.preamble && (
                <div style={{
                  background: "rgba(37,99,235,0.06)",
                  border: "1px solid rgba(37,99,235,0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 20px",
                  marginBottom: 24,
                  fontSize: 13, fontWeight: 600, color: "var(--text)",
                  lineHeight: 1.7,
                }}>
                  ⚠️ {langData.preamble}
                </div>
              )}

              {/* Sections */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 14px)",
                padding: "28px",
              }}>
                {/* Rights list */}
                {langData?.rights && (
                  <ul style={{ margin: 0, padding: "0 0 0 20px" }}>
                    {langData.rights.map((right, i) => (
                      <li key={i} style={{
                        fontSize: 13.5, lineHeight: 1.8, color: "var(--text-secondary)",
                        marginBottom: 8, paddingLeft: 4,
                      }}>
                        {right}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Consent body */}
                {langData?.body && (
                  <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "var(--text-secondary)", margin: 0, whiteSpace: "pre-line" }}>
                    {langData.body}
                  </p>
                )}

                {/* Standard sections */}
                {sections.length > 0 && sections.map((section, idx) => (
                  <div key={section.id || idx}>
                    <SectionContent section={section} lang={activeLang} />

                    {/* Sub-sections (content array within section) */}
                    {Array.isArray(section.content) && section.content.map((sub, si) => (
                      <div key={si} style={{ marginLeft: 16, marginBottom: 20 }}>
                        <SectionContent section={sub} lang={activeLang} />
                      </div>
                    ))}
                  </div>
                ))}

                {sections.length === 0 && !langData?.body && !langData?.rights && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    This document is being updated. Please check back soon.
                  </p>
                )}
              </div>

              {/* Contact footer */}
              <div style={{
                marginTop: 24,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                    {activeLang === "hi" ? "कानूनी प्रश्न या शिकायत?" : "Legal Questions or Grievances?"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {activeLang === "hi" ? "हमसे संपर्क करें:" : "Contact us:"}{" "}
                    <a href="mailto:legal@sehatsathi.in" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                      legal@sehatsathi.in
                    </a>
                    {" | "}
                    <a href="mailto:grievance@sehatsathi.in" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                      grievance@sehatsathi.in
                    </a>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Jurisdiction: Republic of India
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div>Select a document from the sidebar</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
