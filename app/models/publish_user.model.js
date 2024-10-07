module.exports = (sequelize, Sequelize) => {
  const Publish = sequelize.define(
    "publish",
    {
      publish_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grade: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      visibilityType: {
        // Sequelize.ENUM("public", "private"),
        type: Sequelize.STRING,
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      access_granted_to: {
        type: Sequelize.JSON, // Store an array of user IDs
        allowNull: true,
      },
      question_ids: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      staff_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "staff",
          key: "staff_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      delete_status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0, // Default to 0 (active)
        comment: "0 = active, 1 = deleted", // Add comment for clarity
      },
    },
    {
      timestamps: true, // Enable timestamps
    }
  );
  return Publish;
};
