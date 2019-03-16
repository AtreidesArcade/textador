
// Creating our User model
module.exports = function (sequelize, DataTypes) {
    var Subscriber = sequelize.define("Subscriber", {
        // The email cannot be null, and must be a proper email before creation
        subscriberID: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    });

    Subscriber.associate = function (models) {
        models.Subscriber.belongsTo(models.User, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Subscriber;
};


