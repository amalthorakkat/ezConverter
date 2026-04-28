const express = require("express");
const router = express.Router();

const fileRoutes = require("../modules/file/file.routes");

router.use("/files", fileRoutes);    

module.exports = router;