import { Router } from "express";
import {
  createUser,
  getUser,
  signInUser,
  verifyUser,
  deleteUserAccount,
  updateUserDetails,
  getAllUserAccounts,
  findAccountNumber,
} from "../controller/userController";
import multer from "multer";

const router: Router = Router();
const upload = multer().single("avatar");
router.route("/register").post(createUser);
router.route("/sign-in").post(signInUser);

router.route("/verify-user/:userID").patch(verifyUser);
router.route("/view-user/:userID").get(getUser);
router.route("/update-user/:userID").patch(upload, updateUserDetails);
router.route("/delete-user/:userID").delete(deleteUserAccount);
router.route("/users").get(getAllUserAccounts);
router.route("/find-account").post(findAccountNumber)

export default router;
