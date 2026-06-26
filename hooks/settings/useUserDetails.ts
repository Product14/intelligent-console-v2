'use client';

// Shim for converse-ai's useUserDetails — returns IDs from the Console bridge
// instead of Redux. Same return shape the v3 components consume.
import { getConsoleContext } from '@/lib/settings/bridge/context-store';

const useUserDetails = () => {
  const ctx = getConsoleContext();
  return {
    enterpriseId: ctx?.enterpriseId,
    teamId: ctx?.teamId,
    teamName: ctx?.teamId,
    userId: ctx?.authKey,
    isLoggedIn: !!ctx?.authKey,
    teamsList: ctx?.teamId ? [ctx.teamId] : [],
  };
};

export default useUserDetails;
