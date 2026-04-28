const express = require("express");
const router = express.Router();

const { convertFile } = require("../file/file.controller");
const upload = require("../../middleware/upload.middleware");

router.post("/convert", upload.single("file"), convertFile);

module.exports = router;