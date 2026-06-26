'use client';

// Shim for converse-ai's ActiveAgentContext. The active agent type id is derived
// from the bridge's agentType+agentCallType (e.g. "inboundSales").
import React, { createContext, useContext, useState } from 'react';
import { getConsoleContext, getActiveSegment } from '@/lib/settings/bridge/context-store';

function deriveAgentTypeId(): string {
  // Prefer the segment the shell set for the active agent sub-step.
  const seg = getActiveSegment();
  if (seg) return seg;
  const ctx = getConsoleContext();
  if (!ctx) return 'inboundSales';
  return `${ctx.agentCallType}${ctx.agentType.charAt(0).toUpperCase()}${ctx.agentType.slice(1)}`;
}

interface ActiveAgentValue {
  activeAgentId: string | null;
  activeAgentTypeId: string | null;
  setActiveAgentId: (id: string | null) => void;
  setActiveAgentTypeId: (id: string | null) => void;
}

const ActiveAgentContext = createContext<ActiveAgentValue | null>(null);

export const ActiveAgentProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [activeAgentTypeId, setActiveAgentTypeId] = useState<string | null>(deriveAgentTypeId());
  return (
    <ActiveAgentContext.Provider
      value={{ activeAgentId, activeAgentTypeId, setActiveAgentId, setActiveAgentTypeId }}
    >
      {children}
    </ActiveAgentContext.Provider>
  );
};

export const useActiveAgent = (): ActiveAgentValue => {
  const fromCtx = useContext(ActiveAgentContext);
  if (fromCtx) return fromCtx;
  return {
    activeAgentId: null,
    activeAgentTypeId: deriveAgentTypeId(),
    setActiveAgentId: () => {},
    setActiveAgentTypeId: () => {},
  };
};
