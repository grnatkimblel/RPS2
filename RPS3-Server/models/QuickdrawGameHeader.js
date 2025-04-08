/*
QuickdrawGameHeader : {
  game_id: 
  game_type: "Quickplay" or "Ranked"
  winner: 
  loser:
  player_1_id
  player_2_id:
}
*/

export default (sequelize, DataTypes) => {
  const QuickdrawGameHeader = sequelize.define("QuickdrawGameHeader", {
    game_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    game_type: {
      type: DataTypes.ENUM("Quickplay", "Ranked"),
      allowNull: false,
    },
    winner: DataTypes.UUID,
    loser: DataTypes.UUID,
    player_1_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    player_2_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  });

  QuickdrawGameHeader.associate = (models) => {
    QuickdrawGameHeader.belongsTo(models.User, {
      as: "Player1",
      foreignKey: { name: "player_1_id", type: DataTypes.UUID },
    });
    QuickdrawGameHeader.belongsTo(models.User, {
      as: "Player2",
      foreignKey: { name: "player_2_id", type: DataTypes.UUID },
    });
    models.User.hasMany(QuickdrawGameHeader, {
      as: "Player1",
      foreignKey: { name: "player_1_id", type: DataTypes.UUID },
    });
    models.User.hasMany(QuickdrawGameHeader, {
      as: "Player2",
      foreignKey: { name: "player_2_id", type: DataTypes.UUID },
    });
  };

  return QuickdrawGameHeader;
};
