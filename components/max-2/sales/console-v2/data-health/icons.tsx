"use client";

/**
 * Local icon wrapper for the data-health module. The shared MaterialSymbol only
 * allows sizes 14/16/20/24 and no style prop; this surface needs finer sizes and
 * per-icon coloring, so we back it with lucide-react (same library the other new
 * console surfaces use) behind a name→component map. Imported aliased as
 * `MaterialSymbol` so call sites read identically.
 */

import {
  ArrowLeft, ArrowRight, ArrowLeftRight, Sparkles, Moon, Ban, Zap, Wrench, Split,
  Check, CheckCheck, CheckCircle2, ChevronRight, ChevronUp, ChevronDown, UploadCloud,
  Users, Database, Car, Siren, AlertCircle, AlertTriangle, Package, Globe, Lock,
  GitMerge, ExternalLink, Clock, User, UserSearch, Play, ReceiptText, Rocket,
  ListChecks, Search, RefreshCw, MoveRight, FileUp, ShieldCheck, Webhook, Circle,
  Network, Key, Link, Link2Off, Megaphone, ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  sync_alt: ArrowLeftRight,
  auto_awesome: Sparkles,
  bedtime: Moon,
  block: Ban,
  bolt: Zap,
  build: Wrench,
  call_split: Split,
  check: Check,
  task_alt: CheckCheck,
  check_circle: CheckCircle2,
  chevron_right: ChevronRight,
  expand_less: ChevronUp,
  expand_more: ChevronDown,
  cloud_upload: UploadCloud,
  contacts: Users,
  database: Database,
  directions_car: Car,
  emergency: Siren,
  error: AlertCircle,
  warning: AlertTriangle,
  inventory_2: Package,
  language: Globe,
  lock: Lock,
  merge: GitMerge,
  open_in_new: ExternalLink,
  pending: Clock,
  schedule: Clock,
  person: User,
  person_search: UserSearch,
  play_arrow: Play,
  receipt_long: ReceiptText,
  rocket_launch: Rocket,
  rule: ListChecks,
  search: Search,
  sync: RefreshCw,
  trending_flat: MoveRight,
  upload_file: FileUp,
  verified_user: ShieldCheck,
  webhook: Webhook,
  account_tree: Network,
  key: Key,
  link: Link,
  link_off: Link2Off,
  campaign: Megaphone,
  north_east: ArrowUpRight,
};

export function Icon({
  name,
  size = 16,
  ...rest
}: {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  const Comp = MAP[name] ?? Circle;
  return <Comp size={size} aria-hidden {...rest} />;
}
