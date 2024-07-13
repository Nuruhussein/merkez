import dotenv from "dotenv";
dotenv.config();

export const environment = {
  mongoURI: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
};
