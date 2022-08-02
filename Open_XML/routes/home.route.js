const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.controller");

router.route("/").get(homeController.getFile);
router
    .route("/upload")
    .post(homeController.uploadFile, homeController.createFileJson);

module.exports = router;