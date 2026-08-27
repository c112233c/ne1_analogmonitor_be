const express = require("express");
const controller = require("../controllers/analog.controller");

const router = express.Router();

router.get("/stations", controller.getStations);
router.get("/stations/:sub/bays", controller.getBays);
router.get("/stations/:sub/bays/:bay/points", controller.getPoints);
router.get("/history", controller.getHistory);
router.get("/detail", controller.getDetail);

module.exports = router;
