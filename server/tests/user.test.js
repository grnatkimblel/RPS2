import { test, before, after, describe, it } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";

import { Op } from "sequelize";
import db from "../models/index.js";
const { User, RefreshToken } = db;

import authApp from "../servers/authServer.js";
import userApp from "../servers/menuServer.js";
import gameApp from "../servers/gameControllerServer.js";
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

  const userBadCredentials = {
    username: "grant",
    password: "1231234",
  };

  it("should get an error when trying to login to the account before it exists", async () => {
    await userApi.post("/api/auth/login").send(user).expect(404);
  });

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

  it("should get an error when incorrect account credentials are provided to login", async () => {
    await authApi.post("/api/auth/login").send(userBadCredentials).expect(401);
  });

  it("should login when correct account credentials are provided", async () => {
    await authApi.post("/api/auth/login").send(user).expect(200);
  });

  it("should get an error when trying to create an account with a username that already exists", async () => {
    await userApi.post("/api/menu/user/createUser").send(user).expect(409);
  });

  after(async () => {
    await db.sequelize.close();
  });
});
