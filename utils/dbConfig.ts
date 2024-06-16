import { connect } from "mongoose";
import env from "dotenv";
env.config()
// const url: string = "mongodb://127.0.0.1:27017/dbConfig"
const url: string = "mongodb+srv://kossyuzoigwe:kossyuzoigwe@francisuzoigwe.3irljsp.mongodb.net/Ajcash"
export const dbConfig = async () => {
  try {
    await connect(url).then(() => {
      console.log("DB connection established");
    });
  } catch (error: any) {
    console.log(error?.message);
  }
};
