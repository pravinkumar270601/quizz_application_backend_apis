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
      delete_status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0, // 0 indicates active, 1 indicates deleted
      },
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
  );
  return Student;
};
