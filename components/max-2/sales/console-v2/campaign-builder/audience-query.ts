import { Operator, defaultValueFor, findField } from "./audience-fields";
import type { ParsedAudience, FilterCondition as ParsedCondition } from "./audience-parser";

export type GroupOp = "AND" | "OR";
export type GroupMode = "include" | "exclude";

export interface ConditionNode {
  id: string;
  kind: "condition";
  field: string;
  op: Operator;
  value: string | string[] | number;
}

export interface GroupNode {
  id: string;
  kind: "group";
  mode: GroupMode; // only meaningful at the top level; nested groups inherit their parent's mode
  op: GroupOp;
  children: (ConditionNode | GroupNode)[];
}

export interface AudienceQuery {
  groups: GroupNode[];
}

export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function makeCondition(fieldId: string): ConditionNode {
  const field = findField(fieldId);
  if (!field) throw new Error(`Unknown field: ${fieldId}`);
  return {
    id: genId("c"),
    kind: "condition",
    field: fieldId,
    op: field.operators[0],
    value: defaultValueFor(field),
  };
}

export function makeGroup(mode: GroupMode = "include", op: GroupOp = "AND"): GroupNode {
  return {
    id: genId("g"),
    kind: "group",
    mode,
    op,
    children: [],
  };
}

export function makeEmptyQuery(): AudienceQuery {
  const g = makeGroup("include", "AND");
  g.children.push(makeCondition("vehicle_interest"));
  return { groups: [g] };
}

/** Recursively replace a node within a query tree. */
function mapNode<T extends ConditionNode | GroupNode>(
  node: T,
  visit: (n: ConditionNode | GroupNode) => ConditionNode | GroupNode | null
): T | null {
  const visited = visit(node);
  if (visited === null) return null;
  if (visited.kind === "group") {
    const children = visited.children
      .map((c) => mapNode(c, visit))
      .filter((c): c is ConditionNode | GroupNode => c !== null);
    return { ...visited, children } as T;
  }
  return visited as T;
}

export function updateNode(query: AudienceQuery, id: string, patch: Partial<ConditionNode> | Partial<GroupNode>): AudienceQuery {
  const groups = query.groups
    .map((g) => mapNode(g, (n) => (n.id === id ? ({ ...n, ...patch } as typeof n) : n)))
    .filter((g): g is GroupNode => g !== null);
  return { groups };
}

export function removeNode(query: AudienceQuery, id: string): AudienceQuery {
  const groups = query.groups
    .map((g) => mapNode(g, (n) => (n.id === id ? null : n)))
    .filter((g): g is GroupNode => g !== null);
  return { groups };
}

export function addChildTo(
  query: AudienceQuery,
  parentId: string,
  child: ConditionNode | GroupNode
): AudienceQuery {
  const groups = query.groups.map((g) =>
    mapNode(g, (n) => {
      if (n.id !== parentId || n.kind !== "group") return n;
      return { ...n, children: [...n.children, child] };
    })
  ).filter((g): g is GroupNode => g !== null);
  return { groups };
}

export function addTopLevelGroup(query: AudienceQuery, mode: GroupMode = "exclude"): AudienceQuery {
  const g = makeGroup(mode, "AND");
  g.children.push(makeCondition("appointment_status"));
  return { groups: [...query.groups, g] };
}

/**
 * Deterministic mock count: base 950, each include condition narrows by 35–65%,
 * each exclude removes 5–15%. Same query → same number.
 */
export function estimateCount(query: AudienceQuery): number {
  let n = 950;

  function walk(node: ConditionNode | GroupNode, parentMode: GroupMode): void {
    if (node.kind === "condition") {
      const seed = hashSeed(`${node.field}|${JSON.stringify(node.value)}|${node.op}`);
      if (parentMode === "include") {
        const factor = 0.35 + (seed % 30) / 100; // 0.35–0.64
        n = Math.round(n * factor + 30);
      } else {
        const reduction = 0.05 + (seed % 10) / 100; // 0.05–0.14
        n = Math.round(n * (1 - reduction));
      }
      return;
    }
    // Group: walk children with the group's mode (top-level) or inherit
    for (const child of node.children) walk(child, node.mode ?? parentMode);
  }

  for (const g of query.groups) {
    for (const child of g.children) walk(child, g.mode);
  }
  return Math.max(8, n);
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Convert a ParsedAudience (from audience-parser) into an AudienceQuery (visual builder shape).
 * Normalizes field operators + values to fit the audience-fields taxonomy.
 */
export function fromParsedAudience(parsed: ParsedAudience): AudienceQuery {
  const groups: GroupNode[] = parsed.groups.map((g) => ({
    id: genId("g"),
    kind: "group" as const,
    mode: g.mode,
    op: g.op,
    children: g.conditions
      .map((c) => convertParsedCondition(c))
      .filter((c): c is ConditionNode => c !== null),
  })).filter((g) => g.children.length > 0);

  if (groups.length === 0) {
    return makeEmptyQuery();
  }
  return { groups };
}

function convertParsedCondition(c: ParsedCondition): ConditionNode | null {
  const field = findField(c.field);
  if (!field) return null;

  let op = c.op as Operator;
  if (!field.operators.includes(op)) {
    op = field.operators[0];
  }

  let value: string | string[] | number;

  if (field.type === "number") {
    const n = parseInt(String(c.value), 10);
    value = Number.isFinite(n) ? n : 30;
  } else if (field.type === "bool") {
    value = "true";
  } else if (field.type === "select") {
    const target = String(c.value).toLowerCase();
    const opt = field.options?.find(
      (o) => o.value.toLowerCase() === target || o.label.toLowerCase() === target
    );
    value = opt?.value ?? field.options?.[0]?.value ?? "";
  } else if (field.type === "multiselect") {
    const target = String(c.value).toLowerCase();
    const opt = field.options?.find(
      (o) => o.value.toLowerCase() === target || o.label.toLowerCase() === target
    );
    value = opt ? [opt.value] : [];
    // multiselects only accept in/not_in
    if (op === "=" || op === "!=") op = field.operators[0];
  } else {
    value = String(c.value);
  }

  return {
    id: genId("c"),
    kind: "condition",
    field: c.field,
    op,
    value,
  };
}

/** Plain-English summary of the query, used as the audience description. */
export function summarizeQuery(query: AudienceQuery): string {
  const parts: string[] = [];
  for (const g of query.groups) {
    const cs = describeChildren(g.children, g.op);
    if (!cs) continue;
    parts.push(`${g.mode === "include" ? "Include" : "Exclude"} ${cs}`);
  }
  return parts.join(". ") || "Empty query";
}

function describeChildren(children: (ConditionNode | GroupNode)[], op: GroupOp): string {
  const labels = children.map((c) => {
    if (c.kind === "condition") return describeCondition(c);
    return `(${describeChildren(c.children, c.op)})`;
  }).filter(Boolean);
  if (labels.length === 0) return "";
  const sep = op === "AND" ? " AND " : " OR ";
  return labels.join(sep);
}

function describeCondition(c: ConditionNode): string {
  const field = findField(c.field);
  if (!field) return `${c.field} ${c.op} ${c.value}`;
  const valueLabel = renderValue(field, c.value);
  return `${field.label} ${c.op} ${valueLabel}`;
}

function renderValue(field: ReturnType<typeof findField>, value: string | string[] | number): string {
  if (!field) return String(value);
  if (Array.isArray(value)) {
    return value.map((v) => field.options?.find((o) => o.value === v)?.label ?? v).join(", ");
  }
  if (field.type === "bool") return value === "true" ? "yes" : "no";
  if (field.type === "select") {
    return field.options?.find((o) => o.value === String(value))?.label ?? String(value);
  }
  if (field.type === "number" && field.unit) return `${value} ${field.unit}`;
  return String(value);
}
