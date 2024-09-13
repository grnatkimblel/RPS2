// models/User.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      hashed_password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      player_emoji: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
    },
    { collate: "utf8mb4_0900_as_cs" }
  );
  return User;
};
