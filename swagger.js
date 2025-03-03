const swaggerAutogen = require("swagger-autogen")();
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");

const doc = {
  info: {
    title: "API Docs"
  },
  host: process.env.SWAGGER_HOST,
  schemes: [process.env.SWAGGER_SCHEMES],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

const outputFile = "./swagger.json";
const routes = ["./routes/index.js"];

swaggerAutogen(outputFile, routes, doc).then(() => {
  let json = fs.readFileSync(outputFile, "utf8");

  json = json.replace(/\$\{process.env.(.*?)\}/g, (_, key) => process.env[key] || "");

  fs.writeFileSync(outputFile, json);
  console.log("Swagger JSON Generated with ENV Variables");
});
