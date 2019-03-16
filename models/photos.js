
// Creating our User model
module.exports = function (sequelize, DataTypes) {
    var Photo = sequelize.define("Photo", {
        // The email cannot be null, and must be a proper email before creation
        url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        fileName: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        fileTitle: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fileDescription: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: true
        }
    });

    Photo.associate = function (models) {
        models.Photo.belongsTo(models.User, {
            foreignKey: {
                allowNull: true
            }
        });
        models.Photo.belongsTo(models.Transaction, {
            foreignKey: {
                allowNull: true
            }
        });
        models.Photo.belongsTo(models.Post, {
            foreignKey: {
                allowNull: true
            }
        });
    };

    return Photo;
};

