module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        uid: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        mySystemNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        myCellNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        emergencyNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        primaryPhoto: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
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
    User.associate = function (models) {
        User.hasMany(models.Post, {
                onDelete: "cascade"
            }),
        User.hasMany(models.Photo, {
        }),
        User.hasMany(models.Transaction, {
            onDelete: "cascade"
        }),
        User.hasMany(models.Subscriber, {
            onDelete: "cascade"
        });
    };
    return User;
};