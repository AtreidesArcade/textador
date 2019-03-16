
// Creating our User model
module.exports = function (sequelize, DataTypes) {
    var Post = sequelize.define("Post", {
        // The email cannot be null, and must be a proper email before creation
        title: {
            type: DataTypes.STRING,
            allowNull: true
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        mediaUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        dueOnReserve: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        dueOnDelivery: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        dueOnCreditDays: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        lastSignIn: {
            type: DataTypes.DATE,
            allowNull: true
        }
    });
    Post.associate = function (models) {
        Post.hasMany(models.Photo, {
          }),
        models.Post.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });
    };
    return Post;
};

