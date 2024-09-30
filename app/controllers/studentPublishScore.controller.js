const Sequelize = require("sequelize");
const db = require("../models");
const StudentPublishScoreTable = db.student_publish_scores;
const PublishTable = db.publishs;
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// In your student controller file
exports.submitStudentScore = async (req, res) => {
  const { student_id, publish_id, score, status } = req.body;

  try {
    // Find the StudentPublishScore entry
    const studentScore = await StudentPublishScoreTable.findOne({
      where: { student_id, publish_id },
    });

    if (!studentScore) {
      RESPONSE.Failure.Message = "StudentPublishScore entry not found";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      //   return res
      //     .status(404)
      //     .json({ message: "StudentPublishScore entry not found" });
    }

    // Update the score and status using Sequelize's update method
    await StudentPublishScoreTable.update(
      { score, status }, // Fields to update
      { where: { student_id, publish_id } } // Where condition
    );

    RESPONSE.Success.Message = '"Score and status updated successfully"';
    RESPONSE.Success.data = {};
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json({ message: "Score and status updated successfully" });
  } catch (error) {
    console.error("Error in submitStudentScore:", error); // Log the error for debugging
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: error.message });
  }
};

// In your student controller file
// exports.getAllPublishesWithStudentScore = async (req, res) => {
//     const { student_id } = req.params;

//     try {
//       // Fetch all publishes with corresponding student scores for the provided student_id
//       const publishes = await PublishTable.findAll({
//         include: [
//           {
//             model: StudentPublishScoreTable,
//             as: 'studentScores',  // Alias for the association
//             where: { student_id }, // Filter by student_id
//             required: false,  // Allow publishes without a score entry
//           },
//         ],
//       });

//       if (!publishes || publishes.length === 0) {
//         return res.status(404).json({ message: "No publishes found for this student." });
//       }

//       res.status(200).json(publishes);
//     } catch (error) {
//       console.error('Error in getAllPublishesWithStudentScore:', error);
//       res.status(500).json({ message: error.message });
//     }
//   };

exports.getAllPublishesWithStudentScore = async (req, res) => {
  const { student_id } = req.params;

  try {
    // Fetch all publishes that grant access to the specified student_id,
    // and include the corresponding student scores
    const publishes = await PublishTable.findAll({
      where: Sequelize.where(
        Sequelize.fn(
          "JSON_CONTAINS",
          Sequelize.col("access_granted_to"),
          student_id // Ensure the student_id is stringified for JSON comparison
        ),
        1
      ),
      include: [
        {
          model: StudentPublishScoreTable,
          as: "studentScores", // Alias for the association
          where: { student_id }, // This will still filter by student_id in the scores table
          required: false, // Allow publishes without a score entry
        },
      ],
    });

    if (!publishes || publishes.length === 0) {
      RESPONSE.Success.Message = "No publishes found for this student.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(200)
      //   .json({ message: "No publishes found for this student." });
    }

    RESPONSE.Success.Message = MESSAGE.SUCCESS;
    RESPONSE.Success.data = publishes;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);

    // res.status(200).json(publishes);
  } catch (error) {
    console.error("Error in getAllPublishesWithStudentScore:", error);
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: error.message });
  }
};

exports.getStudentReportsForStaff = async (req, res) => {
  const { student_id, staff_id } = req.params; // Assuming both are passed in params

  try {
    // Fetch all publishes that grant access to the specified student_id and match the staff_id
    const publishes = await PublishTable.findAll({
      where: {
        staff_id, // Ensure it matches the specified staff_id
        [Sequelize.Op.and]: Sequelize.where(
          Sequelize.fn(
            "JSON_CONTAINS",
            Sequelize.col("access_granted_to"),
            student_id // Ensure the student_id is stringified for JSON comparison
          ),
          1
        ),
      },
      include: [
        {
          model: StudentPublishScoreTable,
          as: "studentScores", // Alias for the association
          where: { student_id }, // Filter by student_id in the scores table
          required: false, // Allow publishes without a score entry
        },
      ],
    });

    if (!publishes || publishes.length === 0) {
      RESPONSE.Success.Message =
        "No publishes found for this student and staff.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(200)
      //   .json({ message: "No publishes found for this student and staff." });
    }

    RESPONSE.Success.Message = MESSAGE.SUCCESS;
    RESPONSE.Success.data = publishes;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error in getStudentReportsForStaff:", error);
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: error.message });
  }
};
