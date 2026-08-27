const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const analogRoutes = require("./routes/analog.routes");
const openApiSpec = yaml.load(
    fs.readFileSync(path.join(__dirname, "../openapi.yaml"), "utf8")
);
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/analog", analogRoutes);

app.get("/api/openapi.json", (req, res) => {
    res.json(openApiSpec);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customSiteTitle: "NE1 Analog Monitoring API"
}));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});
module.exports=app;
