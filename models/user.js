module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define("users", {
        email: DataTypes.STRING,

        password: DataTypes.STRING,
		script: DataTypes.STRING
        


    }, {
        timestamps: false
    });

    return user;
};