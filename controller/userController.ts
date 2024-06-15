import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { streamUpload } from "../config/streamifier";
import userModel from "../model/userModel";
import { verifiedEmail } from "../utils/email";

export const createUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, accountNumber, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const code = crypto.randomBytes(2).toString("hex");
    const verify = crypto.randomBytes(7).toString("hex");

    const hashVerifyCode = await bcrypt.hash(verify, salt);

    if (accountNumber) {
      const user = await userModel.create({
        accountNumber,
        email,
        password: hash,
        code,
        verifyCode: hashVerifyCode,
      });

      verifiedEmail(user);

      return res.status(201).json({
        status: 201,
        message: "creating",
        data: user,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Please Provide your Phone Number",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error creating",
      error: error.message,
    });
  }
};

export const signInUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (user) {
      const check = await bcrypt.compare(password, user.password);

      if (check) {
        if (user.verify && user.verifyCode === "") {
          const token = jwt.sign(
            {
              id: user._id,
            },
            "openSECRET",
            { expiresIn: "1h" }
          );
          return res.status(201).json({
            status: 201,
            message: "sign in successfully",
            data: token,
          });
        } else {
          return res.status(404).json({
            status: 404,
            message: "You should go and verify your account",
          });
        }
      } else {
        return res.status(404).json({
          status: 404,
          message: "error with password",
        });
      }
    } else {
      return res.status(404).json({
        status: 404,
        message: "error with Email ",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error sign in ",
      error: error.message,
    });
  }
};

export const createTransferPin = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { pin } = req.body;

    console.log(`Received userID: ${userID}`);
    console.log(`Received pin: ${pin}`);

    const user = await userModel.findById(userID);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        message: "User not found",
      });
    }
    const pinned = await userModel.findByIdAndUpdate(
      userID,
      { pin },
      { new: true }
    );

    console.log(`Pinned user: ${pinned}`);

    return res.status(200).json({
      message: "Transaction pin created successfully",
      data: pinned,
    });
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
    return res.status(400).json({
      message: "Error occurred",
      data: error.message,
    });
  }
};



export const getUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userID } = req.params;

    const user = await userModel.findById(userID);

    return res.status(200).json({
      status: 200,
      message: "user details",
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error reading user details",
      error: error.message,
    });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userID } = req.params;

    const user = await userModel.findById(userID);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    if (user) {
      await userModel.findByIdAndUpdate(
        userID,
        {
          verify: true,
          verifyCode: "",
        },
        { new: true }
      );

      return res.status(200).json({
        status: 200,
        message: "User's account verified successfully",
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Verification code is incorrect",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      message: "An error occurred",
      error: error.message,
    });
  }
};

export const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { public_id, secure_url }: any = await streamUpload(req);
    const { firstName, lastName, houseAddress } = req.body;
    const user = await userModel.findByIdAndUpdate(
      userID,
      {
        firstName,
        lastName,
        houseAddress,
        avatar: secure_url,
        avatarID: public_id,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "User updated successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Error updating details",
      data: error?.message,
    });
  }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await userModel.findByIdAndDelete(userID);
    return res.status(201).json({
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Error occurred",
      data: error?.message,
    });
  }
};

export const getAllUserAccounts = async (req: Request, res: Response) => {
  try {
    const users = await userModel.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: `viewing ${users.length} accounts`,
      data: users,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Error occured",
      data: error?.message,
    });
  }
};

export const findAccountNumber = async (req: Request, res: Response) => {
  try {
    const { accountNumber } = req.body;
    const account = await userModel.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }
    const user = await userModel.findOne({ accountNumber });
    return res.status(200).json({
      message: "Account found successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Error occured",
      data: error?.message,
    });
  }
};
