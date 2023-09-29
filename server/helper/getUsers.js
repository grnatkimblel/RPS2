const { authenticateToken } = require("../helper/authenticateToken");

const { User } = require("../models");
const { Op } = require("sequelize");

async function getUsersByName(searchText) {
  console.log("returning searched players");
  console.log("searchedText", searchText);
  return await User.findAll({
    where: {
      username: {
        [Op.like]: `%${searchText}%`,
      },
    },
  });
}

async function getUsersByList(listOfPlayers) {
  console.log("returning list of players");
  console.log(listOfPlayers);
  return await Promise.all(
    listOfPlayers.map(async (player_id) => {
      return await User.findByPk(player_id);
    })
  );
}

module.exports = {
  getUsersByList,
  getUsersByName,
};
