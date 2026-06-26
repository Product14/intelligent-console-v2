import React from 'react';
import { AiOutlineDashboard } from 'react-icons/ai';
import { FaShippingFast } from 'react-icons/fa';
import { GrServices } from 'react-icons/gr';
import {
  MdStorefront,
  MdPhoneInTalk,
  MdAccessTime,
  MdGroups,
  MdNotificationsActive,
  MdCreditCard,
  MdOutlineMail,
  MdPerson,
  MdChatBubbleOutline,
  MdInventory,
  MdManageHistory,
  MdPhone,
  MdSmartToy,
  MdCall,
  MdRocketLaunch,
  MdLocalShipping,
  MdSupportAgent,
  MdVerifiedUser,
} from 'react-icons/md';

const ICONS: Record<string, React.ReactNode> = {
  // Rooftop
  profile: <MdStorefront className="h-6 w-6" />,
  'caller-id': <MdPhoneInTalk className="h-6 w-6" />,
  departments: <MdAccessTime className="h-6 w-6" />,
  team: <MdGroups className="h-6 w-6" />,
  preferences: <MdNotificationsActive className="h-6 w-6" />,
  plan: <MdCreditCard className="h-6 w-6" />,
  review: <MdOutlineMail className="h-6 w-6" />,
  // Agent (sales/service)
  'agent-profile': <MdPerson className="h-6 w-6" />,
  'first-message': <MdChatBubbleOutline className="h-6 w-6" />,
  ims: <MdInventory className="h-6 w-6" />,
  crm: <AiOutlineDashboard className="h-6 w-6" />,
  'car-history': <MdManageHistory className="h-6 w-6" />,
  'speed-to-lead': <FaShippingFast className="h-6 w-6" />,
  phone: <MdPhone className="h-6 w-6" />,
  chatbot: <MdSmartToy className="h-6 w-6" />,
  'voice-test': <MdCall className="h-6 w-6" />,
  deploy: <MdRocketLaunch className="h-6 w-6" />,
  // Service extras
  'service-scheduler': <GrServices className="h-6 w-6" />,
  'service-facilities': <MdLocalShipping className="h-6 w-6" />,
  'human-transfer': <MdSupportAgent className="h-6 w-6" />,
  consent: <MdVerifiedUser className="h-6 w-6" />,
};

export function stepIcon(id: string): React.ReactNode {
  return ICONS[id] || <MdStorefront className="h-6 w-6" />;
}
