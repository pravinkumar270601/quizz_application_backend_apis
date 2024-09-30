module.exports = (sequelize, Sequelize) => {
  const Staff = sequelize.define(
    "staff",
    {
      staff_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      staff_name: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true, // Enable timestamps (createdAt, updatedAt)
    }
  );
  Staff.hasMany(sequelize.models.quiz_question_answer, {
    foreignKey: "staff_id",
  });
  Staff.hasMany(sequelize.models.publish, { foreignKey: "staff_id" });
  return Staff;
};
