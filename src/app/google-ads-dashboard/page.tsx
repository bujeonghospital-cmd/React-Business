"use client";

import React, { useEffect, useState } from "react";

type Row = {
  campaignId: string | null;
  campaignName: string | null;
  clicks: number;
  impressions: number;
  averageCpc: number;
  cost: number;
};

export default function GoogleAdsDashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState({ clicks: 0, impressions: 0, cost: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(from?: string, to?: string) {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      const res = await fetch("/api/google-ads?" + qs.toString());
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Unknown error");
      } else {
        setRows(json.rows || []);
        setTotals(json.totals || { clicks: 0, impressions: 0, cost: 0 });
      }
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Google Ads Dashboard (Example)</h1>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => load()}
          disabled={loading}
          style={{ marginRight: 8 }}
        >
          Refresh
        </button>
        <small>Data pulled from Google Ads API via server route</small>
      </div>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              Campaign
            </th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
              Clicks
            </th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
              Impressions
            </th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
              Avg CPC
            </th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
              Cost
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: "8px 4px" }}>
                {r.campaignName || r.campaignId}
              </td>
              <td style={{ padding: "8px 4px", textAlign: "right" }}>
                {r.clicks.toLocaleString()}
              </td>
              <td style={{ padding: "8px 4px", textAlign: "right" }}>
                {r.impressions.toLocaleString()}
              </td>
              <td style={{ padding: "8px 4px", textAlign: "right" }}>
                {r.averageCpc ? `฿${r.averageCpc.toFixed(2)}` : "-"}
              </td>
              <td style={{ padding: "8px 4px", textAlign: "right" }}>
                {r.cost ? `฿${r.cost.toFixed(2)}` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ paddingTop: 8, fontWeight: 700 }}>Totals</td>
            <td style={{ paddingTop: 8, textAlign: "right", fontWeight: 700 }}>
              {totals.clicks.toLocaleString()}
            </td>
            <td style={{ paddingTop: 8, textAlign: "right", fontWeight: 700 }}>
              {totals.impressions.toLocaleString()}
            </td>
            <td />
            <td style={{ paddingTop: 8, textAlign: "right", fontWeight: 700 }}>
              {totals.cost ? `฿${totals.cost.toFixed(2)}` : "-"}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
