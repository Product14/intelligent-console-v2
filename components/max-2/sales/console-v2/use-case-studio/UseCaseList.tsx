"use client";

import { Plus, Shield, Phone, MessageSquare, Mail, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import type { Channel, UseCase, UseCaseStatus } from "./types";
import { DEPLOY_GATE_THRESHOLD } from "./engine";
import { AgentMark } from "../shared";

const CHANNEL_ICON: Record<Channel, typeof Phone> = {
  voice: Phone,
  sms: MessageSquare,
  email: Mail,
};

const STATUS_META: Record<UseCaseStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft:    { label: "Draft",    bg: "var(--spyne-surface-hover)",  text: "var(--spyne-text-secondary)", dot: "var(--spyne-text-muted)" },
  testing:  { label: "Testing",  bg: "var(--spyne-warning-subtle)", text: "var(--spyne-warning-ink)",    dot: "var(--spyne-warning-ink)" },
  deployed: { label: "Deployed", bg: "var(--spyne-success-subtle)", text: "var(--spyne-success-text)",   dot: "var(--spyne-success-text)" },
  archived: { label: "Archived", bg: "var(--spyne-surface-hover)",  text: "var(--spyne-text-secondary)", dot: "var(--spyne-text-muted)" },
};

interface UseCaseListProps {
  useCases: UseCase[];
  onNew: () => void;
  onOpen: (id: string) => void;
}

export default function UseCaseList({ useCases, onNew, onOpen }: UseCaseListProps) {
  if (useCases.length === 0) {
    return (
      <section className="spyne-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AgentMark size={20} className="shrink-0" />
            <div>
              <p className="text-[13px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>Use Cases — the agent definitions that power campaigns</p>
              <p className="mt-0.5 text-[11.5px] max-w-[640px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>
                A Use Case is the function definition (agent brain + workflow + test pack). Campaigns are function calls — they reference a deployed Use Case and never invent agent behavior. Build one to unlock the Campaign Builder template grid.
              </p>
            </div>
          </div>
          <button
            onClick={onNew}
            className="spyne-btn-primary shrink-0"
          >
            <Sparkles size={14} />
            Build use case
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="spyne-card px-4 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Shield size={13} style={{ color: "var(--spyne-primary)" }} />
          <p className="text-[12.5px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>Use Cases</p>
          <span className="spyne-badge spyne-badge-brand text-[9.5px] font-bold uppercase tracking-wider tabular-nums" style={{ padding: "2px 6px" }}>
            {useCases.length}
          </span>
          <span className="spyne-badge spyne-badge-success text-[9.5px] font-bold uppercase tracking-wider tabular-nums" style={{ padding: "2px 6px" }}>
            {useCases.filter((u) => u.status === "deployed").length} deployed
          </span>
        </div>
        <button
          onClick={onNew}
          className="spyne-btn-ghost text-[11px]"
        >
          <Plus size={11} strokeWidth={2.5} />
          New use case
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {useCases.map((u) => {
          const st = STATUS_META[u.status];
          const passRate = u.batchResult ? Math.round(u.batchResult.passRate * 100) : null;
          const gatePassed = u.batchResult && u.batchResult.passRate >= DEPLOY_GATE_THRESHOLD;
          return (
            <button
              key={u.id}
              onClick={() => onOpen(u.id)}
              className="group spyne-card-interactive spyne-focus-ring text-left p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                  style={{ background: st.bg, color: st.text }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: st.dot }} />
                  {st.label}
                </span>
                {passRate !== null && (
                  <span
                    className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                    style={
                      gatePassed
                        ? { background: "var(--spyne-success-subtle)", color: "var(--spyne-success-text)" }
                        : { background: "var(--spyne-danger-subtle)", color: "var(--spyne-danger-text)" }
                    }
                  >
                    {gatePassed ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                    {passRate}%
                  </span>
                )}
              </div>

              <p
                className="text-[13px] font-bold leading-tight line-clamp-1 transition-colors group-hover:[color:var(--spyne-primary)]"
                style={{ color: "var(--spyne-text-primary)" }}
              >
                {u.name || "Untitled"}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug line-clamp-2" style={{ color: "var(--spyne-text-secondary)" }}>{u.description || u.intent.slice(0, 120) || "—"}</p>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {u.channels.map((ch) => {
                    const Icon = CHANNEL_ICON[ch];
                    return (
                      <span
                        key={ch}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-lg"
                        style={{ background: "var(--spyne-surface)", border: "1px solid var(--spyne-border)" }}
                      >
                        <Icon size={9} style={{ color: "var(--spyne-text-secondary)" }} />
                      </span>
                    );
                  })}
                </div>
                <span className="text-[10px] tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>
                  {u.campaignsUsing > 0 ? `${u.campaignsUsing} campaign${u.campaignsUsing === 1 ? "" : "s"}` : "Not used"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
