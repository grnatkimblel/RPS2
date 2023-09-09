module.exports = (sequelize, DataTypes) => {
  const GameHeader = sequelize.define("GameHeader", {
    game_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    winner: {
      type: DataTypes.STRING,
    },
    loser: {
      type: DataTypes.STRING,
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
