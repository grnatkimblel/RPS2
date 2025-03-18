import { test, before, after, describe, it } from "node:test";
import assert from "node:assert/strict";

import { matchmakingEventEmitter, matchmakingQueues } from "../MatchmakingService.js";
import { GAMEMODES, GAMEMODE_TYPES, MATCHMAKING_TYPES } from "../shared/enums/gameEnums.js"; //This file name is set in docker compose;

/* Tests to write:
 * Quickdraw
 *  - Quickplay
 *  - - random
 *  - - - addPlayer
 *  - - - removePlayer
 *  - - search
 *  - - - addPlayer
 *  - - - removePlayer
 */

describe("Quickplay:Quickdraw:Random Matchmaking Tests", () => {
  let test_client1_id = 1234;
  let test_client2_id = 5678;

  let queue = matchmakingQueues[GAMEMODE_TYPES.QUICKPLAY][GAMEMODES.QUICKDRAW][MATCHMAKING_TYPES.RANDOM];

  it("should add a client to the Q:Q:R matchmaking queue", () => {
    assert.equal(queue.getNumPlayers(), 0);
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.RANDOM}-AddPlayer`,
      test_client1_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    assert.equal(queue.getNumPlayers(), 1);
  });

  it("should remove the client from the Q:Q:R matchmaking queue and respond 'false' to the pending AddPlayer request", () => {
    matchmakingEventEmitter.once(test_client1_id + ">Quickplay:Quickdraw:Random-AddPlayerResponse", (roster) => {
      assert.equal(roster, false);
    });
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.RANDOM}-RemovePlayer`,
      test_client1_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    assert.equal(queue.getNumPlayers(), 0);
  });

  it("should match two random players, return a roster, and empty the matchmaking queue", async () => {
    //set up the callback to check the roster
    matchmakingEventEmitter.once(test_client1_id + ">Quickplay:Quickdraw:Random-AddPlayerResponse", async (roster) => {
      assert.deepStrictEqual(roster.players, [1234, 5678]);
    });
    matchmakingEventEmitter.once(test_client2_id + ">Quickplay:Quickdraw:Random-AddPlayerResponse", async (roster) => {
      assert.deepStrictEqual(roster.players, [1234, 5678]);
    });

    assert.equal(queue.getNumPlayers(), 0);
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.RANDOM}-AddPlayer`,
      test_client1_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    assert.equal(queue.getNumPlayers(), 1);
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.RANDOM}-AddPlayer`,
      test_client2_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    assert.equal(queue.getNumPlayers(), 0); //since the roster will complete and empty the queue
  });
});

describe("Quickplay:Quickdraw:Search Matchmaking Tests", () => {
  let test_client1_id = 1234;
  let test_client2_id = 5678;

  let queue = matchmakingQueues[GAMEMODE_TYPES.QUICKPLAY][GAMEMODES.QUICKDRAW][MATCHMAKING_TYPES.SEARCH];
  it("should add to the matchmaking queue", () => {
    assert.equal(queue.getNumPlayers(), 0);
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.SEARCH}-AddPlayer`,
      test_client1_id,
      test_client2_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    assert.equal(queue.getNumPlayers(), 1);
  });

  it("should remove the invite from the Q:Q:S matchmaking queue and respond 'false' to the pending AddPlayer request", () => {
    matchmakingEventEmitter.once(test_client1_id + ">Quickplay:Quickdraw:Search-AddPlayerResponse", (roster) => {
      assert.equal(roster, false);
    });
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.SEARCH}-RemovePlayer`,
      test_client1_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    assert.equal(queue.getNumPlayers(), 0);
  });

  it("should check the users invite and find it", () => {
    matchmakingEventEmitter.once(test_client2_id + ">Quickplay:Quickdraw:Search-CheckInviteResponse", (isJoinable) => {
      assert.equal(isJoinable, true);
    });

    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.SEARCH}-AddPlayer`,
      test_client1_id,
      test_client2_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    matchmakingEventEmitter.emit(
      "Search-CheckInviteToClient",
      test_client2_id,
      test_client1_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
  });

  it("should check the users invite and not find it", () => {
    matchmakingEventEmitter.once(test_client1_id + ">Quickplay:Quickdraw:Search-CheckInviteResponse", (isJoinable) => {
      assert.equal(isJoinable, false);
    });
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.SEARCH}-AddPlayer`,
      test_client1_id,
      test_client2_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    matchmakingEventEmitter.emit(
      "Search-CheckInviteToClient",
      test_client1_id,
      test_client2_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
  });

  it("should match two players, return a roster, and empty the matchmaking queue", async () => {
    let queue = matchmakingQueues[GAMEMODE_TYPES.QUICKPLAY][GAMEMODES.QUICKDRAW][MATCHMAKING_TYPES.SEARCH];

    //set up the callback to check the roster
    matchmakingEventEmitter.once(test_client1_id + ">Quickplay:Quickdraw:Search-AddPlayerResponse", async (roster) => {
      assert.deepStrictEqual(roster.players, [1234, 5678]);
    });
    matchmakingEventEmitter.once(test_client2_id + ">Quickplay:Quickdraw:Search-AddPlayerResponse", async (roster) => {
      assert.deepStrictEqual(roster.players, [1234, 5678]);
    });

    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.SEARCH}-AddPlayer`,
      test_client1_id,
      test_client2_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.SEARCH}-AddPlayer`,
      test_client2_id,
      test_client1_id,
      GAMEMODE_TYPES.QUICKPLAY,
      GAMEMODES.QUICKDRAW
    );
    assert.equal(queue.getNumPlayers(), 0);
  });
});
