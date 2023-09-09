module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      refresh_token: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
    },
    { collate: "utf8mb4_0900_as_cs" }
  );
  return RefreshToken;
};
