// Creating our User model
module.exports = function (sequelize, DataTypes) {
    var MessageLog = sequelize.define("MessageLog", {
      uid: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      SystemNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      CellNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      body: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sessionInfo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fromCity: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fromState: {
        type: DataTypes.STRING,
        allowNull: true
      },
      adminID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      bankerID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      balance: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      lastSignIn: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });
    return MessageLog;
  };
  