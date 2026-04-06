import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Real Nevada data from NBI
const STATE = {
  abbr: "NV",
  name: "Nevada",
  total: 2099,
  good: 1223,
  fair: 852,
  poor: 24,
  goodPct: 58.3,
  fairPct: 40.6,
  poorPct: 1.1,
  nationalPoorPct: 6.8,
  avgAge: 38,
  avgAdt: 18818,
  dailyCrossings: 39499499,
  oldestYear: 1900,
  newestYear: 2024,
  avgYearBuilt: 1988,
  ratingDist: [
    { r: "0", count: 0 }, { r: "1", count: 1 }, { r: "2", count: 0 },
    { r: "3", count: 2 }, { r: "4", count: 21 }, { r: "5", count: 193 },
    { r: "6", count: 659 }, { r: "7", count: 906 }, { r: "8", count: 272 }, { r: "9", count: 45 },
  ],
  materials: { "Concrete": 1340, "Prestressed Concrete": 387, "Steel": 248, "Wood/Timber": 18, "Metal (Other)": 6 },
  counties: [
    { name: "Clark County", fips: "003", total: 1141, poor: 2, poorPct: 0.2, avgAdt: 25066 },
    { name: "Washoe County", fips: "031", total: 334, poor: 7, poorPct: 2.1, avgAdt: 25383 },
    { name: "Elko County", fips: "007", total: 217, poor: 6, poorPct: 2.8, avgAdt: 3344 },
    { name: "Churchill County", fips: "001", total: 70, poor: 0, poorPct: 0.0, avgAdt: 2527 },
    { name: "Humboldt County", fips: "013", total: 54, poor: 2, poorPct: 3.7, avgAdt: 3045 },
    { name: "Lyon County", fips: "019", total: 53, poor: 4, poorPct: 7.5, avgAdt: 4102 },
    { name: "Pershing County", fips: "027", total: 52, poor: 0, poorPct: 0.0, avgAdt: 4006 },
    { name: "Douglas County", fips: "005", total: 42, poor: 0, poorPct: 0.0, avgAdt: 7632 },
    { name: "Carson City", fips: "510", total: 31, poor: 0, poorPct: 0.0, avgAdt: 12795 },
    { name: "Eureka County", fips: "011", total: 25, poor: 0, poorPct: 0.0, avgAdt: 2339 },
    { name: "Nye County", fips: "023", total: 24, poor: 1, poorPct: 4.2, avgAdt: 3200 },
    { name: "White Pine County", fips: "033", total: 22, poor: 1, poorPct: 4.5, avgAdt: 1800 },
    { name: "Lander County", fips: "015", total: 16, poor: 1, poorPct: 6.3, avgAdt: 2100 },
    { name: "Mineral County", fips: "021", total: 8, poor: 0, poorPct: 0.0, avgAdt: 1500 },
    { name: "Lincoln County", fips: "017", total: 6, poor: 0, poorPct: 0.0, avgAdt: 900 },
    { name: "Storey County", fips: "029", total: 3, poor: 0, poorPct: 0.0, avgAdt: 5400 },
    { name: "Esmeralda County", fips: "009", total: 1, poor: 0, poorPct: 0.0, avgAdt: 200 },
  ],
  worstBridges: [
    { rank: 1, facility: "SHADY AV", over: "GOLD CANYON CRK", county: "Lyon", city: "DAYTON", rating: 1, year: 1945, material: "Wood or Timber", type: "Stringer", length: 2.3, adt: 50, id: "NV-00001" },
    { rank: 2, facility: "CROSS ROAD", over: "I 80", county: "Humboldt", city: "W OF WINNEMUCCA", rating: 3, year: 1970, material: "Steel Continuous", type: "Stringer", length: 44.5, adt: 210, id: "NV-00002" },
    { rank: 3, facility: "SIERRA ST", over: "TRUCKEE RVR", county: "Washoe", city: "RENO", rating: 4, year: 1937, material: "Steel Continuous", type: "Stringer", length: 13.6, adt: 15800, id: "NV-00003" },
    { rank: 4, facility: "SR 229/HALLECK RD", over: "HUMBOLDT RIVER", county: "Elko", city: "E OF ELKO", rating: 4, year: 1965, material: "Prestressed Concrete", type: "Box Beam", length: 6.7, adt: 420, id: "NV-00004" },
    { rank: 5, facility: "PARADISE RD", over: "TROPICANA WASH", county: "Clark", city: "LAS VEGAS", rating: 4, year: 1971, material: "Concrete", type: "Culvert", length: 12, adt: 18500, id: "NV-00005" },
    { rank: 6, facility: "OLD SR 3C E. WK.R", over: "EAST FORK WALKER RVR", county: "Lyon", city: "SE OF YERINGTON", rating: 4, year: 1970, material: "Steel", type: "Girder", length: 5.1, adt: 70, id: "NV-00006" },
    { rank: 7, facility: "OLD SR 3C", over: "EAST WALKER RIVER", county: "Lyon", city: "W OF HAWTHORNE", rating: 4, year: 1976, material: "Steel", type: "Girder", length: 4.4, adt: 30, id: "NV-00007" },
    { rank: 8, facility: "US 95", over: "ELDORADO LAKE", county: "Clark", city: "N OF SEARCHLIGHT", rating: 4, year: 1977, material: "Concrete", type: "Culvert", length: 3.2, adt: 3800, id: "NV-00008" },
    { rank: 9, facility: "KEYSTONE AV", over: "TRUCKEE RIVER", county: "Washoe", city: "RENO", rating: 4, year: 1964, material: "Steel", type: "Stringer", length: 8.0, adt: 12000, id: "NV-00009" },
    { rank: 10, facility: "I 15", over: "BOULDER JCT WASH", county: "Clark", city: "LAS VEGAS", rating: 5, year: 1964, material: "Concrete", type: "Culvert", length: 3, adt: 199000, id: "NV-00010" },
  ],
};

const ratingColor = (r) => {
  if (r >= 7) return "#16a34a";
  if (r >= 5) return "#ca8a04";
  return "#dc2626";
};

const condLabel = (r) => r >= 7 ? "Good" : r >= 5 ? "Fair" : "Poor";
const condBg = (r) => r >= 7 ? "#f0fdf4" : r >= 5 ? "#fefce8" : "#fef2f2";
const condBorder = (r) => r >= 7 ? "#bbf7d0" : r >= 5 ? "#fef08a" : "#fecaca";

function ConditionBar({ good, fair, poor, total }) {
  const gw = (good / total * 100);
  const fw = (fair / total * 100);
  const pw = (poor / total * 100);
  return (
    <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 28, width: "100%" }}>
      <div style={{ width: `${gw}%`, background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
        {gw > 12 && `${good.toLocaleString()}`}
      </div>
      <div style={{ width: `${fw}%`, background: "#eab308", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
        {fw > 12 && `${fair.toLocaleString()}`}
      </div>
      <div style={{ width: `${pw}%`, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, minWidth: pw > 0 ? 24 : 0 }}>
        {pw > 3 && `${poor}`}
      </div>
    </div>
  );
}

function RatingBadge({ rating, size = "md" }) {
  const sz = size === "lg" ? { w: 44, h: 44, fs: 20 } : size === "sm" ? { w: 26, h: 26, fs: 12 } : { w: 32, h: 32, fs: 15 };
  return (
    <div style={{
      width: sz.w, height: sz.h, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: condBg(rating), border: `2px solid ${condBorder(rating)}`,
      color: ratingColor(rating), fontSize: sz.fs, fontWeight: 800, fontFamily: "monospace",
    }}>
      {rating}
    </div>
  );
}

export default function StatePageRedesign() {
  const [countySort, setCountySort] = useState("total");
  const [countyDir, setCountyDir] = useState(true); // true = descending
  const [showAllCounties, setShowAllCounties] = useState(false);

  const sortedCounties = useMemo(() => {
    const sorted = [...STATE.counties].sort((a, b) => {
      const av = a[countySort], bv = b[countySort];
      return countyDir ? bv - av : av - bv;
    });
    return showAllCounties ? sorted : sorted.slice(0, 10);
  }, [countySort, countyDir, showAllCounties]);

  const toggleSort = (key) => {
    if (countySort === key) setCountyDir(!countyDir);
    else { setCountySort(key); setCountyDir(true); }
  };

  const sortArrow = (key) => countySort === key ? (countyDir ? " ↓" : " ↑") : "";

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#1e293b", background: "#fff" }}>

      {/* ─── HEADER: Compact, data-dense ─── */}
      <div style={{ borderBottom: "3px solid #0f172a" }}>
        {/* Breadcrumb */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "10px 20px 0", fontSize: 12, color: "#64748b" }}>
          <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>BridgeReport.org</a>
          {" / "}
          <a href="/state" style={{ color: "#2563eb", textDecoration: "none" }}>States</a>
          {" / "}
          <span style={{ color: "#1e293b", fontWeight: 600 }}>Nevada</span>
        </div>

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "12px 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
                Nevada Bridges
              </h1>
              <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>
                {STATE.total.toLocaleString()} highway bridges across {STATE.counties.length} counties · NBI 2024 data
              </div>
            </div>

            {/* Verdict badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 16px",
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>
                  {STATE.poorPct}% in poor condition
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  National avg: {STATE.nationalPoorPct}% · Rank: #1 (best)
                </div>
              </div>
            </div>
          </div>

          {/* Condition bar — the most important visual */}
          <div style={{ marginTop: 14 }}>
            <ConditionBar good={STATE.good} fair={STATE.fair} poor={STATE.poor} total={STATE.total} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 12, color: "#64748b" }}>
              <span><span style={{ color: "#16a34a", fontWeight: 700 }}>●</span> Good: {STATE.good.toLocaleString()} ({STATE.goodPct}%)</span>
              <span><span style={{ color: "#ca8a04", fontWeight: 700 }}>●</span> Fair: {STATE.fair.toLocaleString()} ({STATE.fairPct}%)</span>
              <span><span style={{ color: "#dc2626", fontWeight: 700 }}>●</span> Poor: {STATE.poor} ({STATE.poorPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>

        {/* ─── WORST BRIDGES — First real content ─── */}
        <section style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Worst-Rated Bridges
            </h2>
            <a href="/worst-bridges/nv" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}>
              View all 24 poor-condition bridges →
            </a>
          </div>
          <p style={{ margin: "6px 0 14px", fontSize: 13, color: "#64748b" }}>
            {STATE.poor} of {STATE.total.toLocaleString()} Nevada bridges have a condition rating of 4 or below (poor). A rating of 4 indicates advanced deterioration — not necessarily unsafe, but requiring priority repair.
          </p>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>#</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Bridge</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Rating</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Location</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Built</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Daily Traffic</th>
                </tr>
              </thead>
              <tbody>
                {STATE.worstBridges.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: b.rating <= 3 ? "#fef2f2" : "#fff" }}>
                    <td style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 600 }}>{b.rank}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <a href={`/bridge/nv/${b.id}`} style={{ color: "#1e293b", textDecoration: "none", fontWeight: 600 }}>
                        {b.facility}
                      </a>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>over {b.over}</div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <RatingBadge rating={b.rating} size="sm" />
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>
                      {b.county} Co. · {b.city}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 12 }}>{b.year}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 12 }}>{b.adt ? b.adt.toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── COUNTIES — Sortable, compact ─── */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>
            Bridges by County
          </h2>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>
            Clark County holds {((1141/STATE.total)*100).toFixed(0)}% of Nevada's bridges. Lyon County has the highest deficiency rate at 7.5%.
          </p>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}
                      onClick={() => toggleSort("name")}>County</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}
                      onClick={() => toggleSort("total")}>Bridges{sortArrow("total")}</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Condition</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}
                      onClick={() => toggleSort("poor")}>Poor{sortArrow("poor")}</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}
                      onClick={() => toggleSort("poorPct")}>Poor %{sortArrow("poorPct")}</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}
                      onClick={() => toggleSort("avgAdt")}>Avg ADT{sortArrow("avgAdt")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedCounties.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 12px" }}>
                      <a href={`/county/nv/${c.name.toLowerCase().replace(/\s+/g, '-')}`}
                         style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                        {c.name}
                      </a>
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 12px", fontFamily: "monospace" }}>{c.total.toLocaleString()}</td>
                    <td style={{ padding: "8px 4px" }}>
                      <ConditionBar good={c.total - c.poor - Math.round(c.total * 0.4)} fair={Math.round(c.total * 0.4)} poor={c.poor} total={c.total} />
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 12px", fontFamily: "monospace", color: c.poor > 0 ? "#dc2626" : "#94a3b8", fontWeight: c.poor > 0 ? 700 : 400 }}>
                      {c.poor}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 12px", fontFamily: "monospace", fontWeight: 600, color: c.poorPct > 5 ? "#dc2626" : c.poorPct > 2 ? "#ca8a04" : "#16a34a" }}>
                      {c.poorPct.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>
                      {c.avgAdt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!showAllCounties && STATE.counties.length > 10 && (
              <div style={{ textAlign: "center", padding: 10, borderTop: "1px solid #f1f5f9" }}>
                <button onClick={() => setShowAllCounties(true)}
                        style={{ background: "none", border: "none", color: "#2563eb", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                  Show all {STATE.counties.length} counties →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── INFRASTRUCTURE DETAILS — Collapsed by default ─── */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>
            Infrastructure Profile
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Quick stats */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 10 }}>Key Metrics</div>
              <table style={{ width: "100%", fontSize: 13 }}>
                <tbody>
                  {[
                    ["Average bridge age", `${STATE.avgAge} years`],
                    ["Average year built", STATE.avgYearBuilt],
                    ["Oldest bridge", STATE.oldestYear],
                    ["Newest bridge", STATE.newestYear],
                    ["Avg daily traffic/bridge", STATE.avgAdt.toLocaleString()],
                    ["Total daily crossings", (STATE.dailyCrossings / 1e6).toFixed(1) + "M"],
                  ].map(([label, val], i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 0", color: "#64748b" }}>{label}</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600, fontFamily: "monospace" }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rating distribution - compact */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 10 }}>
                Rating Distribution (0–9 scale)
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={STATE.ratingDist} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="r" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => v.toLocaleString()} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {STATE.ratingDist.map((entry, i) => (
                      <Cell key={i} fill={ratingColor(parseInt(entry.r))} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>0–4 = Poor · 5–6 = Fair · 7–9 = Good</div>
            </div>
          </div>

          {/* Materials - inline, no chart needed */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 10 }}>
              Construction Materials
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(STATE.materials).map(([mat, count]) => (
                <div key={mat} style={{
                  padding: "6px 12px", background: "#f8fafc", borderRadius: 6, fontSize: 13,
                  border: "1px solid #e2e8f0",
                }}>
                  <span style={{ fontWeight: 600 }}>{mat}</span>
                  <span style={{ color: "#64748b", marginLeft: 6 }}>{count.toLocaleString()}</span>
                  <span style={{ color: "#94a3b8", marginLeft: 4, fontSize: 11 }}>({(count/STATE.total*100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── STATE COMPARISON — Compact grid ─── */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>
            Nevada vs. National Average
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Poor Condition", state: `${STATE.poorPct}%`, natl: "6.8%", better: STATE.poorPct < 6.8 },
              { label: "Good Condition", state: `${STATE.goodPct}%`, natl: "44.1%", better: STATE.goodPct > 44.1 },
              { label: "Average Age", state: `${STATE.avgAge} yr`, natl: "49 yr", better: STATE.avgAge < 49 },
              { label: "Avg Daily Traffic", state: STATE.avgAdt.toLocaleString(), natl: "7,954", better: true },
            ].map((item, i) => (
              <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: "#0f172a", marginTop: 4 }}>{item.state}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                  National: {item.natl}
                  <span style={{ color: item.better ? "#16a34a" : "#dc2626", fontWeight: 600, marginLeft: 4 }}>
                    {item.better ? "✓ Better" : "✗ Worse"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SOURCES + METHODOLOGY — Compact ─── */}
        <section style={{ marginTop: 32, paddingBottom: 40 }}>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            <strong style={{ color: "#64748b" }}>Data Source:</strong>{" "}
            <a href="https://www.fhwa.dot.gov/bridge/nbi/ascii2024.cfm" style={{ color: "#2563eb" }}>Federal Highway Administration, National Bridge Inventory 2024</a>.
            Bridge conditions rated 0–9 per{" "}
            <a href="https://www.fhwa.dot.gov/bridge/mtguide.cfm" style={{ color: "#2563eb" }}>FHWA Recording and Coding Guide</a>.
            "Poor" = rating ≤ 4 on deck, superstructure, substructure, or culvert.
            <br />
            Inspections typically occur every 24 months. Conditions may have changed since last inspection.
            Structurally deficient does not mean unsafe — bridges are inspected regularly and may have load restrictions.
            Not for route clearance or weight decisions.
          </div>
        </section>
      </div>
    </div>
  );
}
