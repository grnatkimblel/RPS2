import {
  GAMEMODES,
  GAMEMODE_TYPES,
  MATCHMAKING_TYPES,
} from "./shared/enums/gameEnums.js"; //This file name is set in docker compose;
import logger from "./utils/logger.js";

/*
The MatchmakingQueue represents the list of players waiting to play a game
Each Queue will be responsible for its own gametype/gamemode
A Queue knows, based on its gamemode and gametype, when enough players have joined
to create a roster and eventually start a new game session

Interface:
 - addPlayer()
 - removePlayer()
 - checkInviteToClient()
 - getNumPlayers()
*/

class MatchmakingQueue {
  gameType;
  gameMode;
  validRosterSizeMin;
  validRosterSizeMax;
  matchmakingType;
  playerQueue;

  constructor(gameType, gameMode, matchmakingType) {
    this.gameMode = gameMode;
    this.gameType = gameType;
    this.matchmakingType = matchmakingType;

    if (this.gameMode == GAMEMODES.QUICKDRAW) {
      this.validRosterSizeMin = 2; //1v1
      this.validRosterSizeMax = 2; //1v1
    } else if (this.gameMode == GAMEMODES.TDM) {
      if (this.gameType == GAMEMODE_TYPES.QUICKPLAY) {
        //allows 2v2 games
        this.validRosterSizeMin = 4; //2v2
        this.validRosterSizeMax = 10; //5v5
      } else if (this.gameType == GAMEMODE_TYPES.RANKED) {
        //only 5v5 games
        this.validRosterSizeMin = 10; //5v5
        this.validRosterSizeMax = 10; //5v5
      }
    }
    if (this.matchmakingType == MATCHMAKING_TYPES.RANDOM) {
      this.playerQueue = [];
    } else {
      this.playerQueue = new Map();
    }
  }

  addPlayer(client_id, chosenOne_id) {
    logger.info("MatchMakingQueue    AddPlayer called");
    logger.info(
      "MatchMakingQueue    ",
      client_id,
      this.gameType,
      this.gameMode
    );
    if (this.matchmakingType == MATCHMAKING_TYPES.RANDOM) {
      if (this.playerQueue.includes(client_id)) return false;
      this.playerQueue.push(client_id);
    } else if (this.matchmakingType == MATCHMAKING_TYPES.SEARCH) {
      if (this.playerQueue.has(client_id)) return false;
      this.playerQueue.set(client_id, chosenOne_id);
    }
  }

  removePlayer(client_id) {
    logger.info("MatchMakingQueue    RemovePlayer called");
    logger.info(
      "MatchMakingQueue    ",
      client_id,
      this.gameType,
      this.gameMode
    );
    if (this.matchmakingType == MATCHMAKING_TYPES.RANDOM) {
      this.playerQueue.splice(this.playerQueue.indexOf(client_id), 1);
      logger.info(this.gameType, this.gameMode, "Random Queue after removal");
      logger.info(this.playerQueue);
    } else if (this.matchmakingType == MATCHMAKING_TYPES.SEARCH) {
      this.playerQueue.delete(client_id);
      logger.info(this.gameType, this.gameMode, "Random Queue after removal");
      logger.info(this.playerQueue);
    }
  }

  checkInviteToClient(client_id, chosenOne_id) {
    logger.info("MatchMakingQueue    checkInviteToClient called");
    logger.info("MatchMakingQueue    ", this.gameType, this.gameMode);
    logger.info(
      "MatchMakingQueue   client: ",
      client_id,
      "chosenOne: ",
      chosenOne_id
    );
    if (client_id === chosenOne_id) return false;
    if (this.playerQueue.has(chosenOne_id)) {
      const chosenOnesInvitee = this.playerQueue.get(chosenOne_id);
      if (chosenOnesInvitee == client_id) {
        //if other player has an invite to the client
        return true;
      }
    }
    return false;
  }

  hasPlayer(player_id) {
    if (this.matchmakingType == MATCHMAKING_TYPES.RANDOM) {
      return this.playerQueue.includes(player_id);
    } else if (this.matchmakingType == MATCHMAKING_TYPES.SEARCH) {
      return this.playerQueue.has(player_id);
    }
  }

  getInvitee(player_id) {
    return this.playerQueue.get(player_id);
  }

  getQueue() {
    return this.playerQueue;
  }

  getNumPlayers() {
    if (this.matchmakingType == MATCHMAKING_TYPES.RANDOM) {
      return this.playerQueue.length;
    } else if (this.matchmakingType == MATCHMAKING_TYPES.SEARCH) {
      return this.playerQueue.size;
    }
  }
}

export default MatchmakingQueue;
