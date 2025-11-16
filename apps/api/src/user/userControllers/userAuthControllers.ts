import { NextFunction, Request, Response } from "express";
import * as userServices from "../userServices/userServices.ts";
import * as authServices from "../userServices/userAuthServices.ts";
import { User } from "../userModel.ts";
import { isProduction } from "../../../server.ts";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { Login } from "../../admin/adminModel.ts";

declare global {
  namespace Express {
    interface Request {
      isPrixer?: boolean;
      userId?: string;
      prixerUsername?: string;
    }
  }
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await userServices.createUser(req.body);
    if (result.success === true) {
      const user = result.result as User;
      const token = authServices.generateToken(user);
      res.cookie("token", token, {
        secure: isProduction,
        httpOnly: true,
        sameSite: "none",
        domain: ".prixelart.com",
        path: "/",
        maxAge: 240 * 60 * 1000,
      }).send(result);
    } else {
      res.send(result);
    }
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const credentials: Login = req.body;
    const auth = await authServices.authenticate(credentials);
    if (!auth.success) {
      res.send(auth);
      return;
    }

    res.cookie("token", auth.result! as string, {
      secure: true,
      httpOnly: true,
      sameSite:"none",
      domain:  ".prixelart.com",
      path: "/",
      maxAge: 240 * 60 * 1000,
    })

    const userResp = await authServices.readUserByEmail(credentials.email);

    res.json({
      success: true,
      message: auth.message,
      result: userResp
    });

  } catch (err) {
    next(err);
  }
};

export const ensureAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      const user = await userServices.readUserById(decoded.id)
      if (user.success) {
        const validUser = user.result as User;
        req.userId = validUser._id?.toString()
        if (validUser.prixer) {
          // req.isPrixer = true; //TODO: add to every prixer and org
          req.body.prixerUsername = validUser.username;
        }
      }
    } else {
      return
      // return {
      //   success: false,
      //   message: "Inicia sesión.",
      // };
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = {
      success: true,
      message: "Logged Out Successfully",
    };
    res.clearCookie("token", {
      secure: isProduction,
      httpOnly: true,
      sameSite: "none",
      domain: ".prixelart.com",
      path: "/",
    });
    res.send(response);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await userServices.changePassword(req.body.user.username, req.body.user.password, req.body.newPassword);
    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const changePrixerPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.permissions?.area !== "Master") {
      res.send({
        success: false,
        message: "No tienes permiso para modificar administradores.",
      });
      return;
    }
    const result = await userServices.changePasswordFromAdmin(req.body.username, req.body.newPassword);
    res.send(result);
  } catch (err) {
    next(err);
  }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authServices.forgotPassword(email);
    res.send(result);
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    const verifiedToken = await authServices.checkPasswordToken(token);
    if (verifiedToken && verifiedToken.success) {
      const result = await authServices.resetPassword(token, newPassword);
      res.send(result);
    } else {
      res.send(verifiedToken);
    }
  } catch (e) {
    next(e);
  }
};

// export const resetByAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {

//     if (!req.permissions?.createConsumer) {
//       res.send({
//         success: false,
//         message: "No tienes permiso para modificar usuarios.",
//       });
//       return;
//     }

//     const { id, newPassword } = req.body;
//     const result = await authServices.resetByAdmin(id, newPassword);
//     res.send(result);
//   } catch (error) {
//     next(error);
//   }
// };

export const checkPasswordToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    const result = await authServices.checkPasswordToken(token);
    res.send(result);
  } catch (e) {
    next(e);
  }
};
