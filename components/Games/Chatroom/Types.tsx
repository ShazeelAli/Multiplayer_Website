import Player from "@/utils/player";

// Add Message Typing Here
declare module "@/common" {
  export interface P2PEvents {
    CH_message: (msg: string) => void;
  }
}
