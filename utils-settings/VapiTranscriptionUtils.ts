import { MessageType } from '@/factory/vapi.model';

export interface ConversationMessage {
  role: string;
  text: string;
  timestamp: string;
  isFinal: boolean;
}

export class VapiTranscriptionUtils {
  static mapTranscriptForLiveCallTranscriber(
    message: MessageType,
    payload: any
  ): ConversationMessage | null {
    if (!message || !payload?.transcript) return null;
    const isFinalPayload = payload.transcriptType === 'final';
    const isPartialPayload = payload.transcriptType === 'partial';
    if (
      message === MessageType.TRANSCRIPT &&
      (isFinalPayload || isPartialPayload)
    ) {
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      return {
        role: payload.role || 'assistant',
        text: payload.transcript || payload.text || '',
        timestamp,
        isFinal: isFinalPayload,
      } as ConversationMessage;
    }

    return null;
  }
}
