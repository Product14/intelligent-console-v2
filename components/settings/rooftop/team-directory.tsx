'use client';

import { useEffect, useState } from 'react';
import { Upload, UserPlus } from 'lucide-react';
import { api } from '@/services/settings';
import type { TeamMember } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { Input, DsButton } from '@/components/settings/ds';

export function TeamDirectory({ subStepId }: { subStepId: string }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [draft, setDraft] = useState({ name: '', email: '', designation: '' });
  useSubStep(subStepId, true); // optional per config sheet

  useEffect(() => {
    api.team.list().then(setMembers);
  }, []);

  const invite = async () => {
    if (!draft.name || !draft.email) return;
    const created = await api.team.invite(draft);
    setMembers((prev) => [...prev, created]);
    setDraft({ name: '', email: '', designation: '' });
    setShowInvite(false);
  };

  return (
    <div>
      <SubStepHeader
        title="Set up your Employee Directory"
        description="Manage and invite members to your rooftop. You can also do this later from settings."
      />
      <div className="mb-4 flex gap-3">
        <DsButton label="Import CSV" type="bordered" size="AA" icon={<Upload className="h-4 w-4" />} />
        <DsButton label="Invite User" size="AA" icon={<UserPlus className="h-4 w-4" />} onClick={() => setShowInvite((s) => !s)} />
      </div>

      {showInvite && (
        <div className="mb-4 grid grid-cols-1 items-end gap-4 rounded-2xl border border-blue-1 bg-blue-4 p-4 md:grid-cols-4">
          <Input label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Input label="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
          <Input label="Designation" value={draft.designation} onChange={(v) => setDraft({ ...draft, designation: v })} />
          <DsButton label="Send Invite" onClick={invite} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/10">
        <table className="w-full text-sm">
          <thead className="bg-gray-lighter text-left text-xs uppercase tracking-wide text-black-40">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Designation</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2.5 text-black-80">{m.name}</td>
                <td className="px-4 py-2.5 text-black-60">{m.email}</td>
                <td className="px-4 py-2.5 text-black-60">{m.designation}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      m.status === 'active'
                        ? 'rounded-full bg-green-lighter px-2 py-0.5 text-xs text-green-darker'
                        : 'rounded-full bg-reddish_orange-lightest px-2 py-0.5 text-xs text-reddish_orange'
                    }
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
