const Sequelize = require("sequelize");
const db = require("../models");
const Staff = db.staffs;

const QuestionAnswersTable = db.quiz_question_answers;

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

exports.QuestionAnswerscreate = async (req, res) => {
  try {
    const data = {
      questionText: req.body.questionText,
      questionImageUrl: req.body.questionImageUrl,
      questionAudioUrl: req.body.questionAudioUrl,
      questionVideoUrl: req.body.questionVideoUrl,
      questionYoutubeUrl: req.body.questionYoutubeUrl,
      options: req.body.options, // Expecting an array of options
      AlternativeOptions: req.body.AlternativeOptions,
      optionsImageUrl: req.body.optionsImageUrl,
      correctAnswer: req.body.correctAnswer, // Store the correct option's value or index
      questionType: req.body.questionType,
      questionPoint: req.body.questionPoint,
      questionTiming: req.body.questionTiming,
      staff_id: req.body.staff_id, // Associate with a staff
      // staff_id: req.staff_id, from jwt token header
      delete_status: 0,
    };

    const response = await QuestionAnswersTable.create(data);

    RESPONSE.Success.Message = MESSAGE.SUCCESS;
    RESPONSE.Success.data = { question_id: response.question_id };
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  } catch (error) {
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Retrieve all QuestionAnswers from the database.

// exports.getAllQuestionAnswers = async (req, res) => {
//   try {
//     const response = await QuestionAnswersTable.findAll();

//     RESPONSE.Success.Message = MESSAGE.SUCCESS;
//     RESPONSE.Success.data = response;
//     res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
//   } catch (error) {
//     RESPONSE.Failure.Message = error.message;
//     res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//   }
// };

// Retrieve all questions by staff ID
exports.getAllQuestionAnswersByPublishId = async (req, res) => {
  try {
    const publish_id = req.params.publish_id;
    if (!publish_id) {
      RESPONSE.Failure.Message = "Publish ID is required";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }
    const response = await QuestionAnswersTable.findAll({
      where: {
        publish_id,
        delete_status: 0, // Exclude soft-deleted questions (0 = active)
      },
    });

    if (response.length > 0) {
      RESPONSE.Success.Message = MESSAGE.SUCCESS;
      RESPONSE.Success.data = response;
      res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    } else {
      RESPONSE.Success.Message = "No questions found for this staff";
      RESPONSE.Success.data = {};
      res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // res
      //   .status(404)
      //   .send({ message: `No questions found for staff_id=${staff_id}` });
    }
  } catch (error) {
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Retrieve all questions where publish_id is null based on staff_id
exports.getQuestionsWithoutPublishByStaffId = async (req, res) => {
  try {
    const staff_id = req.params.staff_id;
    if (!staff_id) {
      RESPONSE.Failure.Message = "staff ID is required";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).send({ message: "staff ID is required" });
    }
    const existingStaff = await Staff.findByPk(staff_id);

    if (!existingStaff) {
      RESPONSE.Failure.Message = "staff does not exist";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).send({ message: "staff does not exist" });
    }
    const response = await QuestionAnswersTable.findAll({
      where: {
        staff_id: staff_id,
        publish_id: null,
        delete_status: 0, // Exclude soft-deleted questions (0 = active)
      },
    });

    if (response.length > 0) {
      RESPONSE.Success.Message = MESSAGE.SUCCESS;
      RESPONSE.Success.data = response;
      res.status(StatusCode.OK.code).send(RESPONSE.Success);
    } else {
      RESPONSE.Success.Message = "No questions found without a publish.";
      RESPONSE.Success.data = {};
      res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }
  } catch (error) {
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Find a single QuestionAnswers with a question_id

exports.getQuestionAnswersById = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await QuestionAnswersTable.findByPk(id);

    if (response) {
      RESPONSE.Success.Message = MESSAGE.SUCCESS;
      RESPONSE.Success.data = response;
      res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    } else {
      RESPONSE.Failure.Message = `Cannot find Question with id=${id}.`;
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // res.status(404).send({ message: `Cannot find Question with id=${id}.` });
    }
  } catch (error) {
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Update a QuestionAnswers by the question_id in the request

exports.updateQuestionAnswersById = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await QuestionAnswersTable.update(req.body, {
      where: { question_id: id },
    });

    if (updated) {
      const updatedQuestion = await QuestionAnswersTable.findByPk(id);
      RESPONSE.Success.Message = MESSAGE.UPDATE;
      RESPONSE.Success.data = {};
      res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    } else {
      RESPONSE.Failure.Message = "QuestionAnswers not found";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);

      // return res.status(404).json({ error: "QuestionAnswers not found" });
    }
  } catch (error) {
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Delete a QuestionAnswers with the specified question_id in the request
exports.deleteQuestionById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      RESPONSE.Failure.Message = "Question ID is required";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }
    // const deleted = await QuestionAnswersTable.destroy({
    //   where: { question_id: id },
    // });
    const response = await QuestionAnswersTable.update(
      { delete_status: 1 }, // Soft delete by setting delete_status to 1 (1 = deleted)
      { where: { question_id: id } }
    );

    // if (deleted) {
    //   RESPONSE.Success.Message = MESSAGE.DELETE;
    //   RESPONSE.Success.data = {};
    //   res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // }

    if (response[0] > 0) {
      RESPONSE.Success.Message = "Question soft-deleted successfully.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    } else {
      RESPONSE.Failure.Message = "QuestionAnswers not found";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ error: "QuestionAnswers not found" });
    }
  } catch (error) {
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// delete all questions where publish_id is null based on staff_id
exports.deleteQuestionsWithoutPublishByStaffId = async (req, res) => {
  try {
    const staff_id = req.params.staff_id;
    if (!staff_id) {
      RESPONSE.Failure.Message = "staff ID is required";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
      // return res.status(400).send({ message: "staff ID is required" });
    }
    const existingStaff = await Staff.findByPk(staff_id);

    if (!existingStaff) {
      RESPONSE.Success.Message = "staff does not exist";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(400).send({ message: "staff does not exist" });
    }
    // const response = await QuestionAnswersTable.destroy({
    //   where: {
    //     staff_id: staff_id,
    //     publish_id: null,
    //   },
    // });

    // Perform the soft delete by updating the delete_status to 1
    const response = await QuestionAnswersTable.update(
      { delete_status: 1 },
      {
        where: {
          staff_id: staff_id,
          publish_id: null,
          delete_status: 0, // Only update records that are not already deleted
        },
      }
    );

    // if (response > 0) {
    //   RESPONSE.Success.Message = `${response} questions deleted successfully.`;
    //   RESPONSE.Success.data = {};
    //   res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // }
    if (response[0] > 0) {
      RESPONSE.Success.Message = `${response[0]} questions deleted successfully.`;
      RESPONSE.Success.data = {};
      res.status(StatusCode.OK.code).send(RESPONSE.Success);
    } 
    else {
      RESPONSE.Success.Message = "No questions found without a publish.";
      RESPONSE.Success.data = {};
      res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // res
      //   .status(StatusCode.OK.code)
      //   .send({ message: "No questions found without a publish." });
    }
  } catch (error) {
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Restore a soft-deleted question by ID (set delete_status = 0)
exports.restoreQuestionById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      RESPONSE.Failure.Message = "Question ID is required";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    const response = await QuestionAnswersTable.update(
      { delete_status: 0 }, // Restore by setting delete_status to 0 (0 = active)
      { where: { question_id: id } }
    );

    if (response[0] > 0) {
      RESPONSE.Success.Message = "Question restored successfully.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    } else {
      RESPONSE.Failure.Message = "Question not found or already active";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }
  } catch (error) {
    RESPONSE.Failure.Message =
      error.message || "An error occurred while restoring the question.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Restore multiple soft-deleted questions by an array of IDs (set delete_status = 0)
exports.restoreQuestionsByIds = async (req, res) => {
  // {
  //   "ids": [1, 2, 3, 5]
  // }
  try {
    const { ids } = req.body; // Expecting an array of question IDs in the request body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      RESPONSE.Failure.Message = "An array of question IDs is required";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    // Restore the questions by setting delete_status to 0 (active)
    const response = await QuestionAnswersTable.update(
      { delete_status: 0 }, // Restore by setting delete_status to 0
      {
        where: {
          question_id: ids, // Use an array of IDs to update all matching questions
          delete_status: 1, // Only restore if the question is currently deleted
        },
      }
    );

    if (response[0] > 0) {
      RESPONSE.Success.Message = `${response[0]} questions restored successfully.`;
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    } else {
      RESPONSE.Failure.Message = "No questions found or they are already active";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }
  } catch (error) {
    RESPONSE.Failure.Message =
      error.message || "An error occurred while restoring the questions.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
