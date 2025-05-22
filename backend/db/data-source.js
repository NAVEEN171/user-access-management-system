const { DataSource } = require("typeorm");
require("dotenv").config();
const { User, Software, Request } = require("../models/entities");

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false,
  logging: true,
  entities: [User, Software, Request],
});

module.exports = { AppDataSource };
