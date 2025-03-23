/*
QuickdrawAction : {
    game_id: 
    round_id:
    player: "1" or "2"
    action_type: "Play Hand" or "Buy Ability" or "Use Ability"
    action_value: "Rock" or "Paper" or "Scissors" or the Ability Name
    timestamp: 
*/

export default (sequelize, DataTypes) => {
  const QuickdrawAction = sequelize.define("QuickdrawAction", {
    game_id: {
      primaryKey: true,
      type: DataTypes.UUID,
      references: {
        model: "QuickdrawGameHeaders",
        key: "game_id",
      },
      allowNull: false,
    },
    round_id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      references: {
        model: "QuickdrawRounds",
        key: "round_id",
      },
      allowNull: false,
    },
    player_id: {
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "id",
      },
      allowNull: false,
    },
    action_type: {
      type: DataTypes.ENUM("Play Hand", "Buy Ability", "Use Ability"),
      allowNull: false,
    },
    action_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  QuickdrawAction.associate = (models) => {
    // Associate with QuickdrawGameHeader model
    QuickdrawAction.belongsTo(models.QuickdrawGameHeader, {
      foreignKey: { name: "game_id", type: DataTypes.UUID },
    });
    models.QuickdrawGameHeader.hasMany(QuickdrawAction, {
      foreignKey: { name: "game_id", type: DataTypes.UUID },
    });
    // Associate with QuickdrawRound model
    QuickdrawAction.belongsTo(models.QuickdrawRound, {
      foreignKey: { name: "round_id", type: DataTypes.INTEGER },
    });
    models.QuickdrawRound.hasMany(QuickdrawAction, {
      foreignKey: { name: "round_id", type: DataTypes.INTEGER },
    });
    // Associate with User model
    QuickdrawAction.belongsTo(models.User, {
      foreignKey: { name: "player", type: DataTypes.UUID },
    });
    models.User.hasMany(QuickdrawAction, {
      foreignKey: { name: "player", type: DataTypes.UUID },
    });
  };
  return QuickdrawAction;
};
