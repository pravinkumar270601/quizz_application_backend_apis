module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define(
    "student",
    {
      student_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      student_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true, // Ensures no duplicate phone numbers
      },
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
  );
  return Student;
};
