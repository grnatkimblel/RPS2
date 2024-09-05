const { test, before, after, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");

const { Op } = require("sequelize");
const db = require("../models/index.js");
const { User, RefreshToken, GameHeader } = require("../models/index.js");

const authApp = require("../servers/authServer.js");
const userApp = require("../servers/menuServer.js");
const gameApp = require("../servers/gameControllerServer.js");
const authApi = supertest(authApp);
const userApi = supertest(userApp);
const gameApi = supertest(gameApp);

/* Tests to write:
 * create account
 *  - db new User entry
 * login
 *  - db new RefreshToken entry
 * refreshToken
 *  - db new RefreshToken entry
 */

describe("Create an account and login", () => {
  before(async () => {
    await db.sequelize.sync({ force: true });
  });

  const user = {
    username: "grant",
    password: "123123",
  };

  it("should create an account", async () => {
    await userApi.post("/api/menu/user/createUser").send(user).expect(201);
  });

  it("DB should have the user in the Users table", async () => {
    const dbUser = await User.findOne({
      where: {
        username: {
          [Op.like]: user.username,
        },
      },
      raw: true, //returns json instead of class instance of the model
    });
    assert.equal(dbUser.username, "grant");
  });
  it("should login to the same account", async () => {
    await authApi.post("/api/auth/login").send(user).expect(200);
  });

  after(async () => {
    await db.sequelize.close();
  });
});
