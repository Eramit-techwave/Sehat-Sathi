/**
 * ServiceMarketplace — Healthcare service booking marketplace.
 * Patients can browse, filter, and book healthcare services.
 */
import { useState } from "react";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import ServiceCard from "../../components/ServiceCard";
import DS from "../../ui/design-system";
import T from "../../ui/tokens";
import { SERVICES, SERVICE_CATEGORIES, getPopularServices } from "../../data/services";

export default function ServiceMarketplace({ onBack }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [bookingService, setBookingService] = useState(null);

  const filtered = SERVICES.filter(s => {
    const matchCategory = activeCategory === "All" || s.category === activeCategory;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>

      {/* ── BACK HEADER ─────────────────────────────────────────── */}
      {onBack && (
        <button onClick={onBack} style={{ ...DS.btnGhost(), marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      )}

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
        borderRadius: T.radiusXl,
        padding: "32px 36px",
        marginBottom: 28,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: T.radiusMd, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={20} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: T.radiusFull }}>
              SEHAT-SATHI SERVICES
            </span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Healthcare at Your Doorstep
          </h2>
          <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 20px", maxWidth: 480, lineHeight: 1.6 }}>
            Book professional nurses, physiotherapists, home sample collection, ambulance, and more — all from one platform.
          </p>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 440 }}>
            <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)" }} />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...DS.input(),
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                paddingLeft: 38,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── POPULAR SERVICES ──────────────────────────────────────── */}
      {!search && activeCategory === "All" && (
        <div style={{ marginBottom: 28 }}>
          <div style={DS.between({ marginBottom: 16 })}>
            <h3 style={DS.sectionTitle()}>⭐ Popular Services</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {getPopularServices().map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={svc => setBookingService(svc)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORY FILTERS ──────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={DS.sectionTitle({ marginBottom: 14 })}>All Services</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={DS.tab(activeCategory === cat, { padding: "7px 16px", fontSize: 12 })}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── SERVICE GRID ──────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={DS.emptyState()}>
          <Search size={36} style={{ margin: "0 auto 12px", display: "block", color: T.textMuted }} />
          <p style={{ color: T.textMuted, fontSize: 13 }}>No services found for "{search}". Try a different search term.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={svc => setBookingService(svc)}
            />
          ))}
        </div>
      )}

      {/* ── BOOKING MODAL ──────────────────────────────────────────── */}
      {bookingService && (
        <div style={DS.modalOverlay()} onClick={() => setBookingService(null)}>
          <div style={{ ...DS.modal({ maxWidth: 520 }), padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{
              background: `linear-gradient(135deg, ${bookingService.color}, ${bookingService.color}cc)`,
              padding: "24px 28px",
              color: "#fff",
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{bookingService.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{bookingService.name}</h3>
              <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>{bookingService.description}</p>
            </div>

            <div style={{ padding: "24px 28px" }}>
              {/* Service details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={DS.insetCard({ textAlign: "center" })}>
                  <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 4 }}>PRICE RANGE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{bookingService.priceRange}</div>
                </div>
                <div style={DS.insetCard({ textAlign: "center" })}>
                  <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 4 }}>EST. ARRIVAL</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: bookingService.color }}>{bookingService.estimatedArrival}</div>
                </div>
              </div>

              {/* Features */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, marginBottom: 10 }}>What's included:</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {(bookingService.features || []).map((f, i) => (
                    <div key={i} style={DS.row(6)}>
                      <span style={{ color: bookingService.color, fontSize: 12 }}>✓</span>
                      <span style={{ fontSize: 12, color: T.textSecondary }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming soon notice */}
              <div style={{
                background: T.amberLight,
                border: `1px solid ${T.amberBorder}`,
                borderRadius: T.radiusMd,
                padding: "12px 16px",
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, color: T.amber, fontWeight: 600 }}>
                  🔔 Full booking system launching soon. We'll notify you when it's live!
                </div>
              </div>

              <div style={DS.row(10)}>
                <button onClick={() => setBookingService(null)} style={{ ...DS.btnGhost(), flex: 1, justifyContent: "center" }}>
                  Close
                </button>
                <button style={{ ...DS.btnPrimary({ flex: 1, justifyContent: "center", background: `linear-gradient(135deg, ${bookingService.color}, ${bookingService.color}cc)` }) }}>
                  Notify Me When Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
