import { Admin, Login } from "../../admin/adminModel.ts";
import bcrypt from "bcryptjs";
import ms from "ms";
import jwt from "jsonwebtoken";
import * as userServices from "./userServices.ts";
import * as emailSender from "../../utils/emailSender.ts";
import { User } from "../userModel.ts";
import { PrixResponse } from "../../types/responseModel.ts";
import { Collection, ObjectId } from "mongodb";
import { getDb } from "../../mongo.ts";

function usersCollection(): Collection<User> {
  return getDb().collection<User>("users");
}

function adminCollection(): Collection<Admin> {
  return getDb().collection<Admin>("admin");
}

export const authenticate = async (userData: Login): Promise<PrixResponse> => {
  const user = await readUserByEmail(userData.email);
  if (user) {
    if (userData.password && user.password && !bcrypt.compareSync(userData.password, user.password)) {
      return {
        success: false,
        message: "Inténtalo de nuevo, contraseña incorrecta.",
      };
    } else {
      const payload = {
        id: user._id!.toString(),
      };

      const secret = process.env.JWT_SECRET!;
      const tokenExpireTimeString = process.env.TOKEN_EXPIRE_TIME!;
      const tokenExpireTimeInSeconds = ms(tokenExpireTimeString as ms.StringValue) / 1000;

      const token = jwt.sign(payload, secret, { expiresIn: tokenExpireTimeInSeconds });

      return {
        success: true,
        result: token,
        message: "Login exitoso.",
      };
    }
  } else {
    return {
      success: false,
      message:
        "No se encuentra el email, por favor regístrate para formar parte de la #ExperienciaPrixelart",
    };
  }
};

export const readUserByEmail = async (email: string): Promise<User | null> => {
  const users = usersCollection();
  const user = await users.findOne({ email: email });
  return user;
};

export const generateToken = (user: User): string => {
  try {
    const payload = {
      id: user._id!.toString(),
    };

    const secret = process.env.JWT_SECRET!;
    const tokenExpireTimeString = process.env.TOKEN_EXPIRE_TIME!;
    const tokenExpireTimeInSeconds = ms(tokenExpireTimeString as ms.StringValue) / 1000;

    const token = jwt.sign(payload, secret, { expiresIn: tokenExpireTimeInSeconds });

    return token;
  } catch (err) {
    throw new Error(String(err));
  }
};

export const forgotPassword = async (email: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const user = await users.findOne({ email: email });
    if (!user) {
      return {
        success: false,
        message: "Este usuario no existe, inténtalo de nuevo.",
      };
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY as string, {
      expiresIn: "15m",
    });

    // const templates: { [key: string]: string } = {
    //   "forgot-password": "d-319b1f51b2424604b5e4951473205496",
    // };

    // const message = {
    //   to: user.email,
    //   from: {
    //     email: "prixers@prixelart.com",
    //     name: "Prixelart",
    //   },
    //   templateId: templates["forgot-password"],
    //   dynamic_template_data: {
    //     recoveryUrl: process.env.FRONT_END_URL + "/recuperar/" + token,
    //   },
    // };

    const updateResult = await users.updateOne(
      { _id: user._id },
      { $set: { token: token } }
    );

    if (updateResult.modifiedCount === 0) {
      return {
        success: false,
        message: "No se pudo enviar el correo de recuperación, por favor refresca e inténtalo de nuevo.",
      };
    }

    const mail = await emailSender.forgotPassword(email, process.env.FRONT_END_URL + "/recuperar/" + token);
    if (mail.success === false) {
      // await emailSender.forgotPassword(message);
      return {
        success: false,
        message: "No se pudo enviar el correo de recuperación, por favor refresca e reinténtalo de nuevo.",
      }
    } else {
      return {
        success: true,
        message: "Envío de correo exitoso.",
      }
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const user = await users.findOne({ token: token });
    if (!user) {
      return {
        success: false,
        message: "Token inválido, por favor cambia tu contraseña en prixelart.com/forgot-password",
      };
    }

    const result = await userServices.resetPassword(newPassword, user);
    return {
      success: result.success,
      message: result.message,
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// export const resetByAdmin = async (id: string, newPassword: string): Promise<PrixResponse> => {
//   try {
//     const admins = adminCollection();
//     const salt = await bcrypt.genSalt(2);
//     const hash = await bcrypt.hash(newPassword, salt);
//     const admin = await admins.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { password: hash } }, { returnDocument: 'after' });
//     if (!admin) {
//       throw new Error("Admin not found");
//     }

//     if (admin) {
//       return {
//         success: true,
//         message: "Contraseña modificada correctamente.",
//       };
//     } else {
//       return {
//         success: false,
//         message: "No pudimos actualizar tu contraseña, por favor inténtalo de nuevo.",
//       };
//     }
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

export const checkPasswordToken = async (token: string): Promise<PrixResponse> => {
  try {
    jwt.verify(token, process.env.RESET_PASSWORD_KEY as string);
    return {
      success: true,
      message: "Token válido.",
    };
  } catch (err) {
    return {
      success: false,
      message: "Token inválido o caducado, por favor vuelve a prixelart.com/olvido-contraseña y repite el proceso para cambiar tu contraseña.",
    };
  }
};

