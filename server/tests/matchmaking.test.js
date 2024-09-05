const { test, before, after, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");

const { Op } = require("sequelize");
const db = require("../models/index.js");
const { User, RefreshToken, GameHeader } = require("../models/index.js");
const {
  matchmakingEventEmitter,
  playerQueue,
} = require("../MatchmakingService");

const authApp = require("../servers/authServer.js");
const userApp = require("../servers/menuServer.js");
const gameApp = require("../servers/gameControllerServer.js");
const authApi = supertest(authApp);
const userApi = supertest(userApp);
const gameApi = supertest(gameApp);

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
  test_client1_id = 1234;
  test_client2_id = 5678;

  it("should add to the matchmaking queue", () => {
    assert.equal(playerQueue.quickplay_Quickdraw_Random.length, 0);
    matchmakingEventEmitter.emit(
      "Quickplay:Quickdraw:Random:newPlayer",
      test_client1_id
    );
    assert.equal(playerQueue.quickplay_Quickdraw_Random.length, 1);
  });

  it("should remove the client from the matchmaking queue)", () => {
    matchmakingEventEmitter.emit(
      "Quickplay:Quickdraw:Random:removePlayer",
      test_client1_id
    );
    assert.equal(playerQueue.quickplay_Quickdraw_Random.length, 0);
  });

  it("should match two random players and return a roster", async () => {
    matchmakingEventEmitter.once(
      test_client1_id + "Q:Q:R-New",
      async (roster) => {
        assert.deepStrictEqual(roster.players, {
          player_1: 5678,
          player_2: 1234,
        });
        assert.equal(playerQueue.quickplay_Quickdraw_Random.length, 0);
      }
    );

    assert.equal(playerQueue.quickplay_Quickdraw_Random.length, 0);
    matchmakingEventEmitter.emit(
      "Quickplay:Quickdraw:Random:newPlayer",
      test_client1_id
    );
    assert.equal(playerQueue.quickplay_Quickdraw_Random.length, 1);
    matchmakingEventEmitter.emit(
      "Quickplay:Quickdraw:Random:newPlayer",
      test_client2_id
    );
    assert.equal(playerQueue.quickplay_Quickdraw_Random.length, 2);
  });
});

describe("Quickplay:Quickdraw:Search Matchmaking Tests", () => {
  test_client1_id = 1234;
  test_client2_id = 5678;

  it("should add to the matchmaking queue", () => {
    assert.equal(playerQueue.quickplay_Quickdraw_Search.size, 0);
    matchmakingEventEmitter.emit(
      "Quickplay:Quickdraw:Search:newInvite",
      test_client1_id,
      test_client2_id
    );
    assert.equal(playerQueue.quickplay_Quickdraw_Search.size, 1);
  });

  it("should remove the invite from the matchmaking queue)", () => {
    matchmakingEventEmitter.emit(
      "Quickplay:Quickdraw:Search:removeInvite",
      test_client1_id
    );
    assert.equal(playerQueue.quickplay_Quickdraw_Search.size, 0);
  });

  it("should check the users invite and find it", () => {
    matchmakingEventEmitter.once(test_client1_id + "Q:Q:S:CI", (isJoinable) => {
      assert.equal(isJoinable, true);
    });

    matchmakingEventEmitter.emit(
      "Quickplay:Quickdraw:Search:newInvite",
      test_client1_id,
      test_client2_id
    );
    matchmakingEventEmitter.emit(
      "Quickplay:Quickdraw:Search:checkInvite",
      test_client2_id
    );
  });
});
