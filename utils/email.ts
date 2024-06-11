import nodemail from "nodemailer";
import { google } from "googleapis";
import ejs from "ejs";
import path from "path";
import jwt from "jsonwebtoken";
import env from "dotenv";
import userModel from "../model/userModel";
env.config();

const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const GOOGLE_REFRESH = process.env.GOOGLE_REFRESH;

const oAuth = new google.auth.OAuth2(
  GOOGLE_ID,
  GOOGLE_SECRET,
  GOOGLE_REDIRECT_URL
);

oAuth.setCredentials({ refresh_token: GOOGLE_REFRESH });

// const url: string = "http://localhost:5173";
const url: string = "https://ajcash-ng.web.app";

export const verifiedEmail = async (user: any) => {
  try {
    const accessToken: any = (await oAuth.getAccessToken()).token;

    const transporter = nodemail.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "kossyuzoigwe@gmail.com",
        clientSecret: GOOGLE_SECRET,
        clientId: GOOGLE_ID,
        refreshToken: GOOGLE_REFRESH,
        accessToken,
      },
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      "secretCode",
      {
        expiresIn: "5m",
      }
    );

    const timer = setTimeout(async () => {
      const getUser: any = await userModel.findById(user._id);

      if (!getUser.verify) {
        await userModel.findByIdAndDelete(getUser._id);
      }
      clearTimeout(timer);
    }, 5 * 60 * 1000);

    let devURL: string = `${url}/api/v1/verify-user/${user?.id}`;

    const myPath = path.join(__dirname, "../views/index.ejs");
    const html = await ejs.renderFile(myPath, {
      link: devURL,
      code: user?.code,
      email: user?.email,
    });

    const mailerOption = {
      from: "Ajcash <kossyuzoigwe@gmail.com>",
      to: user.email,
      subject: "Account Verification",
      html,
    };

    await transporter.sendMail(mailerOption).then(() => {
      console.log("Sent!!")
    })

  } catch (error: any) {
    console.error("This is the error: ", error?.message);
  }
};
