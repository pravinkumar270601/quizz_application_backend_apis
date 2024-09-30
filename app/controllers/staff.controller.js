const db = require("../models");
const Staff = db.staffs;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Create and save a new staff
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.staff_name || !req.body.email || !req.body.password) {
      return res.status(400).send({
        message: "Content can not be empty!",
      });
    }

    // Check if the email already exists
    const existingStaff = await Staff.findOne({
      where: { email: req.body.email },
    });

    if (existingStaff) {
      RESPONSE.Success.Message = "Email is already in use. Please use a different email.";
      RESPONSE.Success.data = {};
      return res.status(200).send(RESPONSE.Success);
      // return res.status(200).send({
      //   message: "Email is already in use. Please use a different email.",
      // });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a staff
    const staff = {
      staff_name: req.body.staff_name,
      email: req.body.email,
      password: hashedPassword,
    };

    // Save staff in the database
    const data = await Staff.create(staff);

    RESPONSE.Success.Message = "Staff registered successfully";
    // RESPONSE.Success.data = {
    //   staff_id: data.staff_id,
    //   staff_name: data.staff_name,
    //   email: data.email,
    // };
    RESPONSE.Success.data = data

    res.status(201).send(RESPONSE.Success);
    // res.status(201).send({
    //   staff_id: data.staff_id,
    //   staff_name: data.staff_name,
    //   email: data.email,
    // });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while creating the staff.",
    });
  }
};

// Login staff
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).send({
        message: "Email and password are required!",
      });
    }

    // Find staff by email
    const staff = await Staff.findOne({ where: { email } });

    if (!staff) {
      RESPONSE.Success.Message = "staff not found!";
      RESPONSE.Success.data = {};
      return res.status(200).send(RESPONSE.Success);
      // return res.status(404).send({
      //   message: "staff not found!",
      // });
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      RESPONSE.Success.Message = "Invalid password!";
      RESPONSE.Success.data = {};
      return res.status(200).send(RESPONSE.Success);
      // return res.status(401).send({
      //   message: "Invalid password!",
      // });
    }

    const accesstoken = jwt.sign(
      {
        staff_id: staff.staff_id,
        // staff_name: staff.staff_name,
        // email: staff.email,
      },

      "pravinApi",
      { expiresIn: "5m" }
    );

    // Successful login

    RESPONSE.Success.Message = "Login successful";
    RESPONSE.Success.data = {
      accesstoken,
      staff: {
        staff_id: staff.staff_id,
        staff_name: staff.staff_name,
        email: staff.email,
      },
    };
    res.status(201).send(RESPONSE.Success);
    // res.status(200).send({
    //   message: "Login successful!",
    //   // staff_id: staff.staff_id,
    //   // staff_name: staff.staff_name,
    //   // email: staff.email,
    //   // token: { accesstoken },
    //   accesstoken,
    // });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while logging in.",
    });
  }
};
