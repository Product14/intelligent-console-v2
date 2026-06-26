declare module 'livekit-client' {
  export enum ConnectionState {
    Disconnected = 'disconnected',
    Connecting = 'connecting',
    Connected = 'connected',
    Reconnecting = 'reconnecting',
    SignalReconnecting = 'signal_reconnecting',
  }

  export const RoomEvent: {
    Connected: 'connected';
    Disconnected: 'disconnected';
    Reconnecting: 'reconnecting';
    Reconnected: 'reconnected';
    SignalReconnecting: 'signalReconnecting';
    ConnectionStateChanged: 'connectionStateChanged';
    ParticipantConnected: 'participantConnected';
    ParticipantDisconnected: 'participantDisconnected';
    TrackPublished: 'trackPublished';
    TrackSubscribed: 'trackSubscribed';
    TrackUnsubscribed: 'trackUnsubscribed';
    TrackMuted: 'trackMuted';
    TrackUnmuted: 'trackUnmuted';
    DataReceived: 'dataReceived';
    TranscriptionReceived: 'transcriptionReceived';
    ActiveSpeakersChanged: 'activeSpeakersChanged';
  };

  export type TranscriptionSegment = {
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    final: boolean;
    language?: string;
  };

  export type Participant = {
    identity: string;
  };

  export class LocalParticipant {
    identity: string;
    setMicrophoneEnabled(enabled: boolean): Promise<void>;
  }

  export class Room {
    name: string;
    localParticipant: LocalParticipant;
    state: ConnectionState;
    connect(serverUrl: string, token: string, options?: unknown): Promise<void>;
    disconnect(): void;
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    once(event: string, handler: (...args: any[]) => void): void;
  }
}
