// Creating our User model
module.exports = function (sequelize, DataTypes) {
  var Transaction = sequelize.define("Transaction", {
    // The email cannot be null, and must be a proper email before creation
    sellerID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    buyerID: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    dateReserved: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dateDelivered: {
      type: DataTypes.DATE,
      allowNull: true
    },
    datePaid: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dateReturned: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });
  Transaction.associate = function (models) {
    Transaction.hasMany(models.Photo, {
      }),
      models.Transaction.belongsTo(models.User, {
        foreignKey: {
          allowNull: true
        }
      });
  };
  return Transaction;
};