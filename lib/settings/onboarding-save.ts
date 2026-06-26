// Save + tracking abstraction. Screens call saveStepData / trackTaskComplete;
// the strategy is chosen from the sub-step's section kind so common (rooftop)
// config saves once and agent config saves per segment.

// @ts-ignore - vendored service
import { updateRooftopConfigAPI, createViniConfigAPI } from '@/services/settings/vini-config.service';
// @ts-ignore - vendored service
import { updateOnboardingTaskAPI, OnboardingTaskName } from '@/services/settings/onboarding.service';
import { TRACKING_MODE, COMMON_SEGMENT, type TrackingMode } from '@/lib/settings/onboarding-config';
import type { SectionKind } from '@/lib/settings/onboarding-model';

export interface SaveContext {
  enterpriseId?: string;
  teamId?: string;
  userId?: string;
  productLineId?: string;
  agentType?: 'sales' | 'service';
  agentCallType?: 'inbound' | 'outbound';
  segment?: string;
  agentId?: string;
}

export interface SaveResult {
  ok: boolean;
  data?: unknown;
  error?: unknown;
}

/**
 * Save step form data. `flat`/`shared` → common (rooftop) config (once, no segment);
 * `agent` → per-segment agent config. Callers pass an already-built payload
 * (using the vendored helpers/vini-config-builder + cnam-config-builder).
 */
export async function saveStepData(
  sectionKind: SectionKind,
  payload: unknown,
  _ctx: SaveContext
): Promise<SaveResult> {
  try {
    if (sectionKind === 'agent') {
      const data = await createViniConfigAPI(payload);
      return { ok: true, data };
    }
    // flat (General) or shared (Integrations) → rooftop-common config
    const data = await updateRooftopConfigAPI(payload);
    return { ok: true, data };
  } catch (error) {
    // mock mode / no backend — surface but don't crash the wizard
    return { ok: false, error };
  }
}

/**
 * Mark an onboarding task complete. Agent tasks track against their own segment.
 * Common (General/shared) tasks follow TRACKING_MODE.
 */
export async function trackTaskComplete(
  task: OnboardingTaskName,
  ctx: SaveContext,
  opts?: { sectionKind?: SectionKind; contractedSegments?: string[]; mode?: TrackingMode }
): Promise<void> {
  const mode = opts?.mode ?? TRACKING_MODE;
  const isCommon = opts?.sectionKind === 'flat' || opts?.sectionKind === 'shared';

  const call = (segmentName: string, agentType?: string, agentCallType?: string) =>
    updateOnboardingTaskAPI({
      productLineId: ctx.productLineId,
      taskName: task,
      segmentName,
      agentType,
      agentCallType,
    }).catch(() => {/* no backend in mock */});

  try {
    if (!isCommon) {
      // Agent step → its own segment.
      await call(ctx.segment ?? '', ctx.agentType, ctx.agentCallType);
      return;
    }
    if (mode === 'common-segment') {
      await call(COMMON_SEGMENT);
    } else {
      // replicate-across-segments
      const segs = opts?.contractedSegments ?? [];
      await Promise.all(segs.map((s) => call(s)));
    }
  } catch {
    /* ignore in mock mode */
  }
}
