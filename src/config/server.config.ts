import { config } from "dotenv";

config();

export const { PORT, DB_URI, NODE_ENV,JWT_SECRET } = process.env;
