"use client";

import { useCallback, useEffect, useState } from "react";
import type { TrafficCount, TrafficOverview } from "@/lib/analytics";

const POLL_MS = 7000;

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function timeAgo(iso: string, now: number): string {
  const diff = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86_400)}d`;
}

const DEVICE_LABEL: Record<string, string> = {
  Desktop: "Desktop",
  Mobile: "Mobile",
  Tablet: "Tablet"
};

export function TrafficPanel({ initial }: { initial: TrafficOverview }) {
  const [data, setData] = useState<TrafficOverview>(initial);
  const [now, setNow] = useState<number>(() => new Date(initial.generatedAt).getTime());
  const [lastSync, setLastSync] = useState<number>(() =>
    new Date(initial.generatedAt).getTime()
  );

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/traffic", { cache: "no-store" });
      if (!res.ok) return;
      const next = (await res.json()) as TrafficOverview;
      setData(next);
      setLastSync(Date.now());
    } catch {
      /* keep showing the last good snapshot */
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  // 1s ticker so the "online now" pulse and "updated Xs ago" stay live.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const syncedAgo = Math.max(0, Math.round((now - lastSync) / 1000));
  const maxViews = Math.max(1, ...data.series.map((point) => point.views));
  const hasChartViews = data.series.some((point) => point.views > 0);

  return (
    <div className="grid gap-5 border border-line bg-card p-5 sm:p-7">
      {/* Header + live status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Live Traffic</p>
          <h2 className="mt-2 text-3xl font-black uppercase leading-none sm:text-4xl">
            Realtime Visitors
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 border border-success-border bg-success-bg px-3 py-2 text-success-fg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <span className="text-3xl font-black leading-none">{fmt(data.onlineNow)}</span>
            <span className="text-[0.62rem] font-black uppercase tracking-wide">online now</span>
          </span>
        </div>
      </div>

      {!data.available && (
        <p className="border border-line bg-paper px-4 py-3 text-xs font-bold uppercase text-muted">
          Connect Supabase to start recording live traffic.
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Today" value={data.today} />
        <Stat label="Unique today" value={data.uniqueToday} />
        <Stat label="7 days" value={data.last7d} />
        <Stat label="30 days" value={data.last30d} />
        <Stat label="All time" value={data.allTime} />
      </div>

      {/* 14-day bar chart */}
      <div className="border border-line bg-paper p-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Views · last 14 days</p>
          <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">
            synced {syncedAgo}s ago
          </p>
        </div>
        {hasChartViews ? (
          <div
            role="img"
            aria-label={`Daily page views, last 14 days — ${data.series
              .map((point) => `${point.label}: ${point.views}`)
              .join(", ")}.`}
            className="mt-5 flex h-32 items-end gap-1.5"
          >
            {data.series.map((point) => (
              <div key={point.day} className="group flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full bg-ink transition-[height] duration-500 group-hover:opacity-70"
                    style={{
                      height: `${Math.max(point.views ? 6 : 0, (point.views / maxViews) * 100)}%`
                    }}
                    title={`${point.label}: ${fmt(point.views)} views`}
                  />
                </div>
                <span className="text-[0.62rem] font-black uppercase text-muted">
                  {point.label.split(" ")[1]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 flex h-32 items-center justify-center text-xs font-bold uppercase text-muted">
            No views in the last 14 days
          </p>
        )}
      </div>

      {/* Breakdowns */}
      <div className="grid gap-3 lg:grid-cols-2">
        <RankList title="Top pages" items={data.topPages} empty="No views yet" />
        <RankList
          title="Top referrers"
          items={data.topReferrers}
          empty="Mostly direct traffic"
        />
        <RankList
          title="Devices"
          items={data.devices.map((d) => ({
            label: DEVICE_LABEL[d.label] ?? d.label,
            value: d.value
          }))}
          empty="No data yet"
        />
        <RankList title="Countries" items={data.countries} empty="No geo data yet" />
      </div>

      {/* Recent hits */}
      <div className="border border-line">
        <div className="border-b border-line px-4 py-3 text-xs font-black uppercase">
          Recent visits
        </div>
        <div className="divide-y divide-line">
          {data.recent.length === 0 && (
            <p className="px-4 py-4 text-xs font-bold uppercase text-muted">
              Waiting for the first visitor…
            </p>
          )}
          {data.recent.map((view, index) => (
            <div
              key={`${view.at}-${index}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-xs font-bold"
            >
              <span className="truncate font-mono lowercase text-ink">{view.path}</span>
              <span className="flex shrink-0 items-center gap-3 uppercase text-muted">
                <span>{[view.country, view.device].filter(Boolean).join(" · ") || "—"}</span>
                <span className="tabular-nums">{timeAgo(view.at, now)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line bg-paper p-4">
      <p className="text-[0.62rem] font-black uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-4xl font-black tabular-nums">{fmt(value)}</p>
    </div>
  );
}

function RankList({
  title,
  items,
  empty
}: {
  title: string;
  items: TrafficCount[];
  empty: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="border border-line bg-paper p-5">
      <p className="eyebrow">{title}</p>
      <div className="mt-4 grid gap-2.5">
        {items.length === 0 && (
          <p className="text-xs font-bold uppercase text-muted">{empty}</p>
        )}
        {items.map((item) => (
          <div key={item.label} className="grid gap-1">
            <div className="flex items-center justify-between gap-3 text-xs font-bold">
              <span className="truncate lowercase text-ink">{item.label}</span>
              <span className="tabular-nums text-muted">{fmt(item.value)}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-muted">
              <div
                className="h-full bg-ink"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
