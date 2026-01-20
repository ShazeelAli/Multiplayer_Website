import Player from "@/utils/player";

export enum GameStates {
  START,
  TUTORIAL,
  LIE_SUBMIT,
  LIE_CHOOSE,
  LIE_CHOSEN,
  VIEW_SCORE,
  END,
}

// Add Message Typing Here
declare module "@/common" {
  export interface P2PEvents {
    TK_start_tutorial: () => void;
    TK_skip: () => void;
    TK_start_game: () => void;
    TK_lie_submit: (lie: string, ack: (status: boolean) => void) => void;
    TK_lies_submission_finished: (lieList: Map<string, Player>) => void;
    TK_lie_chose: (lie: string, ack: (status: boolean) => void) => void;
    TK_lies_chosen: () => void;
    TK_end_lie_viewing: () => void;
    TK_next_round: () => void;
    TK_end_game: () => void;
    TK_restart: () => void;
  }
}
