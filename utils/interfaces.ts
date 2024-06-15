import { HTTP } from "./enums";

export interface iError {
  name: string;
  message: string;
  status: HTTP;
  success: boolean;
}

export interface iUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  code: string;
  verifyCode: string;
  avatar: string;
  avatarID: string;
  houseAddress: string;
  accountNumber: number;
  platformName: string;
  pin: string;
  verify: boolean;
  walletBalance: number;
  transactionHistory: Array<{}>;
  purchaseHistory: Array<{}>;
  history: Array<{}>;
}

export interface iWalletTransaction {
  bankAccount: string;
  bankName: string;
  transactionType: string;
  description: string;

  amount: number;

  user: {};
}
