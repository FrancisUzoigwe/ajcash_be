"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controller/userController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)().single("avatar");
router.route("/register").post(userController_1.createUser);
router.route("/sign-in").post(userController_1.signInUser);
router.route("/verify-user/:userID").patch(userController_1.verifyUser);
router.route("/view-user/:userID").get(userController_1.getUser);
router.route("/update-user/:userID").patch(upload, userController_1.updateUserDetails);
router.route("/delete-user/:userID").delete(userController_1.deleteUserAccount);
router.route("/users").get(userController_1.getAllUserAccounts);
router.route("/find-account").post(userController_1.findAccountNumber);
exports.default = router;
