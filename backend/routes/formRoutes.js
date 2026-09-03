const express = require('express');
const router = express.Router();
const FormSubmission = require('../models/FormSubmission');

router.post('/submit-form', async (req, res) => {
  try {
    const { fullName, email, services, projectDetails } = req.body;

    const newSubmission = new FormSubmission({
      fullName,
      email,
      services: services || [],        // array of selected services
      projectDetails
    });

    await newSubmission.save();

    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received.",
      data: newSubmission
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later."
    });
  }
});

module.exports = router;