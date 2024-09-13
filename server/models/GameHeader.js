/*
gameHeader : {
  game_id: 
  winner: 
  loser:
  player_1_id
  player_2_id:
}
*/

export default (sequelize, DataTypes) => {
  const GameHeader = sequelize.define("GameHeader", {
    game_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      allowNull: false,
    },
    winner: {
      type: DataTypes.UUID,
    },
    loser: {
      type: DataTypes.UUID,
    },
    player_1_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    player_2_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  GameHeader.associate = (models) => {
    GameHeader.belongsTo(models.User, {
      as: "Player1",
      foreignKey: { name: "player_1_id", type: DataTypes.UUID },
    });
    GameHeader.belongsTo(models.User, {
      as: "Player2",
      foreignKey: { name: "player_2_id", type: DataTypes.UUID },
    });
    models.User.hasMany(GameHeader, {
      as: "Player1",
      foreignKey: { name: "player_1_id", type: DataTypes.UUID },
    });
    models.User.hasMany(GameHeader, {
      as: "Player2",
      foreignKey: { name: "player_2_id", type: DataTypes.UUID },
    });
  };

  return GameHeader;
};
