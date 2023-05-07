const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "API Agendamentos",
  },
  host: "localhost:3001",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/routes/index.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
