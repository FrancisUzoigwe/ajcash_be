"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifiedEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = __importDefault(require("../model/userModel"));
dotenv_1.default.config();
const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const GOOGLE_REFRESH = process.env.GOOGLE_REFRESH;
const oAuth = new googleapis_1.google.auth.OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REDIRECT_URL);
oAuth.setCredentials({ refresh_token: GOOGLE_REFRESH });
// const url: string = "http://localhost:5173";
const url = "https://ajcash-ng.web.app";
const verifiedEmail = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transporter = nodemailer_1.default.createTransport({
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
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            const getUser = yield userModel_1.default.findById(user._id);
            if (!getUser.verify) {
                yield userModel_1.default.findByIdAndDelete(getUser._id);
            }
            clearTimeout(timer);
        }), 5 * 60 * 1000);
        let devURL = `${url}/api/v1/verify-user/${user === null || user === void 0 ? void 0 : user.id}`;
        const myPath = path_1.default.join(__dirname, "../views/index.ejs");
        const html = yield ejs_1.default.renderFile(myPath, {
            link: devURL,
            email: user === null || user === void 0 ? void 0 : user.email,
        });
        const mailerOption = {
            from: "Ajcash <kossyuzoigwe@gmail.com>",
            to: user.email,
            subject: "Account Verification",
            html,
        };
        yield transporter.sendMail(mailerOption).then(() => {
            console.log("Sent!!");
        });
    }
    catch (error) {
        console.error("This is the error: ", error === null || error === void 0 ? void 0 : error.message);
    }
});
exports.verifiedEmail = verifiedEmail;
