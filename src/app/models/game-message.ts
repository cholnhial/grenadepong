export enum GameMessageType {
  START = 'START',
  HOST_READY = 'HOST_READY',
  GUEST_READY = 'GUEST_READY',
  HELLO = 'HELLO',
  GRENADE_INCOMING = 'GRENADE_INCOMING'
}

export interface GameMessage {
  type: GameMessageType;
  payload: any;
}