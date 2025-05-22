const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "user",
  tableName: "user",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    username: { type: "varchar", unique: true },
    password: { type: "varchar" },
    role: {
      type: "enum",
      enum: ["Employee", "Manager", "Admin"],
      default: "Employee",
    },
  },
});

const Software = new EntitySchema({
  name: "software",
  tableName: "software",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    name: { type: "varchar" },
    description: { type: "text" },
    accessLevels: { type: "simple-array" },
  },
});

const Request = new EntitySchema({
  name: "request",
  tableName: "request",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    userId: { type: "uuid" },
    softwareId: { type: "uuid" },
    accessType: {
      type: "enum",
      enum: ["Read", "Write", "Admin"],
    },
    reason: { type: "text" },
    status: {
      type: "enum",
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "user",
      joinColumn: { name: "userId" },
    },
    software: {
      type: "many-to-one",
      target: "software",
      joinColumn: { name: "softwareId" },
    },
  },
});

module.exports = {
  User,
  Software,
  Request,
};
