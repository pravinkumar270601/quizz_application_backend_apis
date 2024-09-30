const questionAnswersController = require("../controllers/question_answer.controller.js");
const publishController = require("../controllers/publish.controller.js");
const imageController = require("../controllers/upload_image.controller.js");
const videoController = require("../controllers/upload_video.controller.js");
const audioController = require("../controllers/upload_audio.controller.js");
const staffController = require("../controllers/staff.controller.js");
const studentController = require("../controllers/student.controllers.js");
const studentDasbordController = require("../controllers/studentPublishScore.controller.js") 
const router = require("express").Router();
const isAuthenticated = require("../middleware/auth_middleware.js");

// questionAnswers rouer api
router.post(
  "/questionAnswersCreate",
  questionAnswersController.QuestionAnswerscreate
);
router.get(
  "/getAllQuestionAnswersByPublishId/:publish_id",
  questionAnswersController.getAllQuestionAnswersByPublishId
);
router.get(
  "/getQuestionAnswersById/:id",
  questionAnswersController.getQuestionAnswersById
);
router.put(
  "/updateQuestionAnswersById/:id",
  questionAnswersController.updateQuestionAnswersById
);
router.delete(
  "/deleteQuestionById/:id",
  questionAnswersController.deleteQuestionById
);

router.get(
  "/getQuestionsWithoutPublishByStaffId/staff/:staff_id",
  questionAnswersController.getQuestionsWithoutPublishByStaffId
);

router.delete(
  "/deleteQuestionsWithoutPublishBystaffId/staff/:staff_id",
  questionAnswersController.deleteQuestionsWithoutPublishByStaffId
);

// publish router api

router.post("/publishCreate", publishController.PublishTableCreate);
router.get("/getAllPublish", publishController.getAllPublish);
router.get("/getPublishById/:publish_id", publishController.getPublishById);
router.get(
  "/getPublishByStaffId/staff/:staff_id",
  publishController.getPublishByStaffId
);
router.put("/updatePublishById/:id", publishController.updatepublishById);
router.delete("/deletePublishId/:id", publishController.deletepublishById);
router.delete("/deletePublishId/:id", publishController.deletepublishById);
router.post("/grantAccessToStudent", publishController.grantAccessToStudent);
router.post("/revokeAccessToStudent", publishController.revokeAccessToStudent);
router.get("/getPublishByStudentId/student/:student_id", publishController.getPublishByStudentId);

router.post("/grantAccessToMultiStudent", publishController.grantAccessToMultiStudent);
router.post("/revokeAccessToMultiStudent", publishController.revokeAccessToMultiStudent);



// image uploadImage

router.post("/uploadImage", imageController.uploadImage);
router.post("/uploadVideo", videoController.uploadVideo);
router.post("/uploadAudio", audioController.uploadAudio);

// staff login
router.post("/staffSignup", staffController.create);
router.post("/staffLogin", staffController.login);

// student login

// Route for student signup and login
router.post("/studentSignup", studentController.studentSignup);
router.post("/studentLogin", studentController.studentLogin);
router.get('/getAllStudents',studentController.getAllStudents);
router.get('/getStudentsWithAccessByPublishId/publish/:publish_id',studentController.getStudentsWithAccessByPublishId);
router.get('/getAccessGrantedStudentsInfoBypublishId/publish/:publish_id',studentController.getAccessGrantedStudentsInfo);


// student dasbord 

router.post("/studentScorePost", studentDasbordController.submitStudentScore);
router.get('/getAllPublishesWithStudentScore/student/:student_id',studentDasbordController.getAllPublishesWithStudentScore);
router.get('/getStudentReportsForStaff/student/:student_id/staff/:staff_id',studentDasbordController.getStudentReportsForStaff);



module.exports = router;
