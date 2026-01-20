import Player from "utils/player";
import RoomState from "utils/roomState";
import { GamesEnum } from "utils/game";
import {
  DecorateAcknowledgements,
  DecorateAcknowledgementsWithMultipleResponses,
} from "socket.io/dist/typed-events";

type AddSender<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? (player: Player, webRTCID: number, ...args: Args) => Return
    : T[K];
};

export interface P2PEvents {
  testBase: (msg: string) => void;
  godotRelay: (msg: object) => void;
  testAck: (msg: string, ack: (arg: string) => void) => void;
  testAck2: (msg: string, ack: (arg: number) => void) => void;
}

export interface ServerToClientBaseEvents {
  playerDataReceived: (player: Player) => void;
  hostSuccess: (room: RoomState) => void;
  joinSuccess: (room: RoomState) => void;
  joinFail: (error: string) => void;
  updateRoomState: (room: RoomState) => void;
  godotRelayReceive: (data: object) => void;
}

export type ServerToClientEvents = AddSender<P2PEvents> &
  ServerToClientBaseEvents;

type ackKeys = keyof P2PEvents;

type RelayEvents = DecorateAcknowledgementsWithMultipleResponses<P2PEvents>;
type RelayTargetEvents = DecorateAcknowledgements<P2PEvents>;

type OverloadForEvents<T extends Record<string, (...args: any) => any>> = {
  [K in keyof T]: (eventName: K, ...args: Parameters<T[K]>) => void;
}[keyof T];

export interface ClientToServerEvents {
  sendPlayerData: (playerName: string) => void;
  host: () => void;
  join: (roomCode: string) => void;
  relay: OverloadForEvents<RelayEvents>;
  relayTarget: (
    targetID: string,
    ...args: Parameters<OverloadForEvents<RelayTargetEvents>>
  ) => void;
  updateScore: (playerToUpdate: Player, scoreToAdd: number) => void;
  setScore: (playerToUpdate: Player, score: number) => void;
  updateScoreAll: (scoreToAdd: number) => void;
  setScoreAll: (score: number) => void;
  changeGame: (nextGame: GamesEnum) => void;
}
