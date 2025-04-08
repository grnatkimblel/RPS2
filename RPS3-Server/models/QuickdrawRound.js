/*
QuickdrawRound : {
game_id:
round_id:
winner:
round_start_time:
round_draw_time:
round_end_time:
}
*/

export default (sequelize, DataTypes) => {
  const QuickdrawRound = sequelize.define(
    "QuickdrawRound",
    {
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
        allowNull: false,
      },
      winner: {
        type: DataTypes.UUID,
        references: {
          model: "Users",
          key: "id",
        },
      },
      player_1_final_hand: {
        type: DataTypes.ENUM("Rock", "Paper", "Scissors"),
        allowNull: true,
      },
      player_2_final_hand: {
        type: DataTypes.ENUM("Rock", "Paper", "Scissors"),
        allowNull: true,
      },
      round_start_time: DataTypes.BIGINT,
      round_draw_time: DataTypes.BIGINT,
      round_end_time: DataTypes.BIGINT,
    },
    {
      indexes: [
        {
          fields: ["round_id"], // Add index on round_id
        },
      ],
    }
  );

  QuickdrawRound.associate = (models) => {
    QuickdrawRound.belongsTo(models.QuickdrawGameHeader, {
      foreignKey: { name: "game_id", type: DataTypes.UUID },
    });
    models.QuickdrawGameHeader.hasMany(QuickdrawRound, {
      foreignKey: { name: "game_id", type: DataTypes.UUID },
    });
    // Associate with User model for winner
    QuickdrawRound.belongsTo(models.User, {
      foreignKey: { name: "winner", type: DataTypes.UUID },
    });
    models.User.hasMany(QuickdrawRound, {
      as: "WonRounds",
      foreignKey: { name: "winner", type: DataTypes.UUID },
    });
  };

  return QuickdrawRound;
};
