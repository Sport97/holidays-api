const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "API Docs"
  },
  host: "localhost:3000",
  schemes: ["http"]
};

const outputFile = "./swagger.json";
const routes = ["./routes/index.js"];

swaggerAutogen(outputFile, routes, doc);
