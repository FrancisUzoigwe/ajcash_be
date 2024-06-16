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
exports.findAccountNumber = exports.getAllUserAccounts = exports.deleteUserAccount = exports.updateUserDetails = exports.verifyUser = exports.getUser = exports.createTransferPin = exports.signInUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const streamifier_1 = require("../config/streamifier");
const userModel_1 = __importDefault(require("../model/userModel"));
const email_1 = require("../utils/email");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, accountNumber, password } = req.body;
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(password, salt);
        const code = crypto_1.default.randomBytes(2).toString("hex");
        const verify = crypto_1.default.randomBytes(7).toString("hex");
        const hashVerifyCode = yield bcrypt_1.default.hash(verify, salt);
        if (accountNumber) {
            const user = yield userModel_1.default.create({
                accountNumber,
                email,
                password: hash,
                code,
                verifyCode: hashVerifyCode,
            });
            (0, email_1.verifiedEmail)(user);
            return res.status(201).json({
                status: 201,
                message: "Account created successfully",
                data: user,
            });
        }
        else {
            return res.status(404).json({
                status: 404,
                message: "Please Provide your Phone Number",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error creating",
            error: error.message,
        });
    }
});
exports.createUser = createUser;
const signInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield userModel_1.default.findOne({ email });
        if (user) {
            const check = yield bcrypt_1.default.compare(password, user.password);
            if (check) {
                if (user.verify && user.verifyCode === "") {
                    const token = jsonwebtoken_1.default.sign({
                        id: user._id,
                    }, "openSECRET", { expiresIn: "1h" });
                    return res.status(201).json({
                        status: 201,
                        message: "Signed in successfully",
                        data: token,
                    });
                }
                else {
                    return res.status(404).json({
                        status: 404,
                        message: "You should go and verify your account",
                    });
                }
            }
            else {
                return res.status(404).json({
                    status: 404,
                    message: "error with password",
                });
            }
        }
        else {
            return res.status(404).json({
                status: 404,
                message: "error with Email ",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error sign in ",
            error: error.message,
        });
    }
});
exports.signInUser = signInUser;
const createTransferPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const { pin } = req.body;
        console.log(`Received userID: ${userID}`);
        const user = yield userModel_1.default.findById(userID);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({
                message: "User not found",
            });
        }
        console.log(`Received pin: ${pin}`);
        const pinned = yield userModel_1.default.findByIdAndUpdate(userID, { pin }, { new: true });
        return res.status(200).json({
            message: "Transaction pin created successfully",
            data: pinned,
        });
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        return res.status(400).json({
            message: "Error occurred",
            data: error.message,
        });
    }
});
exports.createTransferPin = createTransferPin;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        return res.status(200).json({
            status: 200,
            message: "user details",
            data: user,
        });
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error reading user details",
            error: error.message,
        });
    }
});
exports.getUser = getUser;
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }
        if (user) {
            yield userModel_1.default.findByIdAndUpdate(userID, {
                verify: true,
                verifyCode: "",
            }, { new: true });
            return res.status(200).json({
                status: 200,
                message: "User's account verified successfully",
            });
        }
        else {
            return res.status(400).json({
                status: 400,
                message: "Verification code is incorrect",
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: "An error occurred",
            error: error.message,
        });
    }
});
exports.verifyUser = verifyUser;
const updateUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const { public_id, secure_url } = yield (0, streamifier_1.streamUpload)(req);
        const { firstName, lastName, houseAddress } = req.body;
        const user = yield userModel_1.default.findByIdAndUpdate(userID, {
            firstName,
            lastName,
            houseAddress,
            avatar: secure_url,
            avatarID: public_id,
        }, { new: true });
        return res.status(201).json({
            message: "User updated successfully",
            data: user,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Error updating details",
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.updateUserDetails = updateUserDetails;
const deleteUserAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const user = yield userModel_1.default.findByIdAndDelete(userID);
        return res.status(201).json({
            message: "Account deleted successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Error occurred",
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.deleteUserAccount = deleteUserAccount;
const getAllUserAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find().sort({
            createdAt: -1,
        });
        return res.status(200).json({
            message: `viewing ${users.length} accounts`,
            data: users,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Error occured",
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.getAllUserAccounts = getAllUserAccounts;
const findAccountNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountNumber } = req.body;
        const account = yield userModel_1.default.findOne({ accountNumber });
        if (!account) {
            return res.status(404).json({
                message: "Account not found",
            });
        }
        const user = yield userModel_1.default.findOne({ accountNumber });
        return res.status(200).json({
            message: "Account found successfully",
            data: user,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Error occured",
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.findAccountNumber = findAccountNumber;
