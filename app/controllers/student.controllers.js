const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const Student = db.students;
const PublishTable = db.publishs;
const StudentPublishScoreTable = db.student_publish_scores;
const Sequelize = require("sequelize");

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

exports.studentSignup = async (req, res) => {
  try {
    const { student_name, email, password, phone_number } = req.body;

    // Check if email or phone number already exists
    const existingStudent = await Student.findOne({
      where: { [Sequelize.Op.or]: [{ email }, { phone_number }] },
    });

    if (existingStudent) {
      RESPONSE.Success.Message = "Email and phone number already in use";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(200)
      //   .send({ message: "Email and phone number already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await Student.create({
      student_name,
      email,
      phone_number,
      password: hashedPassword,
    });

    RESPONSE.Success.Message = "Student registered successfully";
    RESPONSE.Success.data = student;

    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error in studentSignup:", error);
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).send({ message: error.message });
  }
};

exports.studentLogin = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Find student by email or phone number
    const student = await Student.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email: emailOrPhone },
          { phone_number: emailOrPhone },
        ],
      },
    });

    if (!student) {
      RESPONSE.Success.Message = "Invalid email/phone or password";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(400)
      //   .send({ message: "Invalid email/phone or password" });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      RESPONSE.Success.Message = "Invalid password";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res
      //   .status(400)
      //   .send({ message: "Invalid email/phone or password" });
    }

    // Generate JWT
    const token = jwt.sign({ student_id: student.student_id }, "secretKey", {
      expiresIn: "1h",
    });

    RESPONSE.Success.Message = "Login successful";
    RESPONSE.Success.data = {
      token,
      student: {
        student_id: student.student_id,
        student_name: student.student_name,
        email: student.email,
        phone_number: student.phone_number,
      },
    };

    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);

    // res.status(200).send({
    //   message: "Login successful",
    //   token,
    //   student: {
    //     id: student.student_id,
    //     student_name: student.student_name,
    //     email: student.email,
    //     phone_number: student.phone_number,
    //   },
    // });
  } catch (error) {
    console.error("Error in studentLogin:", error);
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).send({ message: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    // Fetch students with only specific fields
    const students = await Student.findAll({
      attributes: ["student_id", "student_name", "email","phone_number"],
    });

    if (students.length === 0) {
      RESPONSE.Success.Message = "No students found";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(StatusCode.OK.code).json({ message: "No students found" });
    }

    RESPONSE.Success.Message = MESSAGE.SUCCESS;
    RESPONSE.Success.data = students;

    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: 'Server error' });
  }
};

// In your student controller file
// exports.getStudentsWithAccessByPublishId = async (req, res) => {
//   const { publish_id } = req.params;

//   try {
//     // Fetch the publish record by publish_id
//     const publish = await PublishTable.findOne({
//       where: { publish_id },
//       attributes: ['access_granted_to'], // Only fetch access_granted_to
//     });

//     if (!publish) {
//       return res.status(404).json({ message: "Publish not found." });
//     }

//     // Fetch all students
//     const students = await Student.findAll({
//       attributes: ['student_id', 'student_name', 'email'], // Select the required fields
//     });

//     // Convert access_granted_to to an array for easy lookup
//     const accessGrantedTo = publish.access_granted_to || [];

//     // Map over the students and add access info
//     const studentsWithAccess = students.map((student) => {
//       const accessGranted = accessGrantedTo.includes(student.student_id);
//       return {
//         student_id: student.student_id,
//         student_name: student.student_name,
//         email: student.email,
//         access_granted: accessGranted,
//       };
//     });

//     // Return the result
//     res.status(200).json(studentsWithAccess);
//   } catch (error) {
//     console.error('Error in getStudentsWithAccessByPublishId:', error);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getStudentsWithAccessByPublishId = async (req, res) => {
  const { publish_id } = req.params;

  try {
    // Fetch the publish record by publish_id
    const publish = await PublishTable.findOne({
      where: { publish_id },
      attributes: ["access_granted_to"], // Only fetch access_granted_to
    });

    if (!publish) {
      RESPONSE.Failure.Message = "Publish not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Publish not found." });
    }

    // Ensure access_granted_to is an array, parse it if necessary
    let accessGrantedTo = publish.access_granted_to || [];
    if (typeof accessGrantedTo === "string") {
      accessGrantedTo = JSON.parse(accessGrantedTo); // If stored as a JSON string, parse it
    }

    // Fetch all students
    const students = await Student.findAll({
      attributes: ["student_id", "student_name", "email"], // Select the required fields
    });

    // Map over the students and add access info
    const studentsWithAccess = students.map((student) => {
      const accessGranted = accessGrantedTo.includes(student.student_id);
      return {
        student_id: student.student_id,
        student_name: student.student_name,
        email: student.email,
        access_granted: accessGranted,
        publish_id: publish_id,
      };
    });

    // Return the result
    RESPONSE.Success.Message = MESSAGE.SUCCESS;
    RESPONSE.Success.data = studentsWithAccess;

    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(studentsWithAccess);
  } catch (error) {
    console.error("Error in getStudentsWithAccessByPublishId:", error);
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: error.message });
  }
};

exports.getAccessGrantedStudentsInfo = async (req, res) => {
  const { publish_id } = req.params;

  try {
    // Fetch the publish record by publish_id
    const publish = await PublishTable.findOne({
      where: { publish_id },
      attributes: ["access_granted_to"], // Only fetch access_granted_to
    });

    if (!publish) {
      RESPONSE.Failure.Message = "Publish not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Publish not found." });
    }

    // Ensure access_granted_to is an array, parse it if necessary
    let accessGrantedTo = publish.access_granted_to || [];
    if (typeof accessGrantedTo === "string") {
      accessGrantedTo = JSON.parse(accessGrantedTo); // If stored as a JSON string, parse it
    }

    // Fetch students with access granted and their scores
    const studentsWithScores = await Student.findAll({
      where: {
        student_id: accessGrantedTo, // Only get students with granted access
      },
      include: [
        {
          model: db.student_publish_scores,
          as: "scores",
          attributes: ["score", "status"], // Include score and status
          where: { publish_id }, // Only include scores for the specific publish
        },
      ],
      attributes: ["student_id", "student_name", "email"], // Select the required fields
    });

    // Return the result
    RESPONSE.Success.Message = MESSAGE.SUCCESS;
    RESPONSE.Success.data = studentsWithScores;

    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(studentsWithScores);
  } catch (error) {
    console.error("Error in getAccessGrantedStudentsInfo:", error);
    RESPONSE.Failure.Message = error.message;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(StatusCode.SERVER_ERROR.code).json({ message: error.message });
  }
};
