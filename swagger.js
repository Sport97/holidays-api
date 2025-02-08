const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "API Docs"
  },
  host: "holidays-api-sport97.onrender.com",
  schemes: ["https"]
};

const outputFile = "./swagger.json";
const routes = ["./routes/index.js"];

swaggerAutogen(outputFile, routes, doc);
