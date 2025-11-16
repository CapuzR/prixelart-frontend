import { Request, Response, NextFunction, CookieOptions } from "express";
import * as adminAuthServices from "../adminServices/adminAuthServices.ts";
import * as adminServices from "../adminServices/adminServices.ts";
import { Admin, Login } from "../adminModel.ts";
import { PermissionsV2 } from "../permissionsModel.ts";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

const parseBooleanEnv = (value?: string | null) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

type SameSiteOption = "lax" | "strict" | "none";

const parseSameSiteEnv = (value?: string | null): SameSiteOption | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "lax" || normalized === "strict" || normalized === "none") {
    return normalized;
  }
  return undefined;
};

const adminCookieSecure =
  parseBooleanEnv(process.env.ADMIN_COOKIE_SECURE) ??
  parseBooleanEnv(process.env.SESSION_SECURE) ??
  isProduction;

const adminCookieSameSite =
  parseSameSiteEnv(process.env.ADMIN_COOKIE_SAMESITE) ??
  parseSameSiteEnv(process.env.SESSION_SAMESITE) ??
  (isProduction ? "none" : "lax");

const adminCookieDomain =
  process.env.ADMIN_COOKIE_DOMAIN?.trim() ||
  process.env.SESSION_DOMAIN?.trim() ||
  (isProduction ? ".prixelart.com" : undefined);

const baseAdminCookieOptions: CookieOptions = {
  secure: adminCookieSecure,
  httpOnly: true,
  sameSite: adminCookieSameSite,
  domain: adminCookieDomain || undefined,
  path: "/",
};

const getAdminCookieOptions = (
  overrides?: Partial<CookieOptions>
): CookieOptions => ({
  ...baseAdminCookieOptions,
  ...overrides,
});

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string };
      permissions?: any;
      adminUsername: string;
      adminFullname?: string
    }
  }
}

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminCredentials: Login = req.body;
    const auth = await adminAuthServices.authenticate(adminCredentials);
    if (!auth.success) {
      res.send(auth);
      return;
    }

    res.cookie(
      "adminToken",
      auth.result! as string,
      getAdminCookieOptions({ maxAge: 240 * 60 * 1000 })
    );

    const adminResp = await adminServices.readAdminByEmail(adminCredentials.email);

    if (!adminResp.success || !adminResp.result) {
      res.json({
        success: true,
        message: auth.message,
        result: [],
      });
      return;
    }

    const adminId = (adminResp.result as Admin)._id!.toString();

    const permsResp = await adminAuthServices.getPermissions(adminId);
    const permissions = permsResp.success
      ? permsResp.result
      : [];

    res.json({
      success: true,
      message: auth.message,
      result: permissions,
    });
    return;

  } catch (err) {
    next(err);
    return;
  }
};

export const ensureAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminToken = req.cookies.adminToken;
    if (!adminToken) {
      res.status(401).send({
        success: false,
        message: "No has iniciado sesión. Por favor inicia sesión para continuar.",
      });
      return;
    }

    const decoded = jwt.verify(adminToken, process.env.ADMIN_JWT_SECRET!) as { id: string };

    const permissionsResponse = await adminAuthServices.getPermissions(decoded.id);
    if (!permissionsResponse.success) {
      res.status(403).send(permissionsResponse);
      return;
    }

    const adminUser = await adminServices.readAdminById(decoded.id);

    const adminObject = adminUser.result as Admin;

    req.admin = decoded;
    req.permissions = permissionsResponse.result;
    req.adminUsername = adminObject.username;
    req.adminFullname = `${adminObject.firstname} ${adminObject.lastname}`
    next();
  } catch (err) {
    next(err);
  }
};

export const adminLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = {
      success: true,
      message: "Logged Out Successfully",
    };
  res.clearCookie("adminToken", getAdminCookieOptions());
    res.send(response);
  } catch (err) {
    next(err);
  }
};
