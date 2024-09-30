module.exports = (sequelize, Sequelize) => {
    const StudentPublishScore = sequelize.define("student_publish_score", {
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "student",
          key: "student_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      publish_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "publish",
          key: "publish_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',  // Default status
      },
    });
  
    return StudentPublishScore;
  };
  