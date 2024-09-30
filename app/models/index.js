const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  define: {
    timestamps: false, //true: createdAt & updatedAt
    freezeTableName: true, //To avoid plurals while creating table name
  },
  operatorsAliases: 0,
  logging: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.quiz_question_answers = require("./question_answer.model.js")(
  sequelize,
  Sequelize
);
db.publishs = require("./publish_user.model.js")(sequelize, Sequelize);
db.staffs = require("./staff.model.js")(sequelize, Sequelize);
db.students = require("./student.model.js")(sequelize, Sequelize);
db.student_publish_scores = require("./student_publish_score.model.js")(
  sequelize,
  Sequelize
);

// Establish relationships
db.publishs.associate = (models) => {
  db.publishs.hasMany(models.student_publish_scores, {
    foreignKey: "publish_id",
    as: "studentScores", // Alias to reference in includes
  });
};

db.student_publish_scores.associate = (models) => {
  db.student_publish_scores.belongsTo(models.publishs, {
    foreignKey: "publish_id",
    as: "publish", // Alias to reference the publish if needed
  });
  db.student_publish_scores.belongsTo(models.students, {
    foreignKey: "student_id",
    as: "student", // Alias to reference the student
  });
};

db.students.associate = (models) => {
  db.students.hasMany(models.student_publish_scores, {
    foreignKey: "student_id",
    as: "scores", // Alias to reference in includes
  });
};



// Initialize associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

// db.d_expensetracker_db= require('./subcategory.model.js')
