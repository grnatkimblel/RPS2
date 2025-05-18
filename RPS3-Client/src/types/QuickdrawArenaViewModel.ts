import GamePhases from "../enums/GamePhases";

interface QuickdrawArenaViewModel {
  titleText: string;
  gamePhase: GamePhases;
  numRoundsToWin: number;
  player1_hand: string;
  player1_score: number;
  player1_purplePoints: number;
  player1_hasFreeze: boolean;
  player1_hasGamble: boolean;
  player1_hasRunItBack: boolean;
  player1_winCount: number;
  player2_hand: string;
  player2_score: number;
  player2_purplePoints: number;
  player2_hasFreeze: boolean;
  player2_hasGamble: boolean;
  player2_hasRunItBack: boolean;
  player2_winCount: number;
  player1WonLastGame: boolean | null;
}

export default QuickdrawArenaViewModel;
