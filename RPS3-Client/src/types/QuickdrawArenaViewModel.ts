import GamePhases from "../enums/GamePhases";
  
interface QuickdrawArenaViewModel {
    titleText: string;
    gamePhase: GamePhases;
    numRoundsToWin: number;
    player1_hand: string;
    player1_score: number;
    player1_purplePoints: number;
    player2_hand: string;
    player2_score: number;
    player2_purplePoints: number;
  }

  export default QuickdrawArenaViewModel