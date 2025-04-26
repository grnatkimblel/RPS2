import GameType from "./GameType";
import PlayerModel from "./PlayerModel";

interface QuickdrawSessionData {
  sessionId: string;
  gameStartTime: number;
  gameType: GameType;
  player1: PlayerModel;
  player2: PlayerModel;
}

export default QuickdrawSessionData;
