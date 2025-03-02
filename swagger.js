const swaggerAutogen = require("swagger-autogen")();
const dotenv = require("dotenv");
dotenv.config();

const doc = {
  info: {
    title: "API Docs"
  },
  host: process.env.SWAGGER_HOST,
  schemes: [process.env.SWAGGER_SCHEMES]
};

const outputFile = "./swagger.json";
const routes = ["./routes/holidays.js"];

swaggerAutogen(outputFile, routes, doc);
