import { Request, Response, NextFunction } from "express";
import * as adminServices from "../adminServices/adminServices.ts";
import { PrixResponse } from "../../types/responseModel.ts";

// Admin CRUD

export const createAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.admins.createAdmin) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar administradores.",
      });
      return;
    }
    const result = await adminServices.createAdmin(req.body);
    res.send(result);
  } catch (err) {
    next(err);
    return;
  }
};

export const getSellers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultAdmin = await adminServices.readSellers();
    res.send(resultAdmin);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const readAllAdmins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.admins.readAdmins) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar administradores.",
      });
      return;
    }

    const resultAdmins = await adminServices.readAllAdmins();
    res.send(resultAdmins);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const readByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const username = req.params.username;

    if (!username) {
      res.status(400).send({
        success: false,
        message: "Username parameter is required.",
      });
      return;
    }

    const adminResult = await adminServices.getAdminByUsername(username);

    res.send(adminResult);
    return;

  } catch (err) {
    next(err);
    return;
  }
};

export const updateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.admins.updateAdmin) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar administradores.",
      });
      return;
    }

    const adminData = req.body;

    const updatedAdmin = await adminServices.updateAdmin(req.params.username, adminData);
    res.send(updatedAdmin);
    return;

  } catch (err) {
    next(err);
    return;
  }
};

export const deleteAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.admins.deleteAdmin) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar administradores.",
      });
      return;
    }

    const deletedAdmin = await adminServices.deleteAdmin(req.params.username);
    res.send(deletedAdmin);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

// Admin Role CRUD

export const createPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.admins.createAdminRole) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar administradores.",
      });
      return;
    }

    const createdPermissions = await adminServices.createPermissions(req.body);
    res.send(createdPermissions);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const readPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultPermissions = await adminServices.readPermissions();
    res.send(resultPermissions);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const readPermissionsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permissionsId = req.params.id;

    if (!permissionsId) {
      res.status(400).send({
        success: false,
        message: "Permissions ID parameter is required.",
      });
      return;
    }

    const resultPermissions = await adminServices.readPermissionsById(permissionsId);

    res.send(resultPermissions);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const updatePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.admins.updateAdminRole) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar administradores.",
      });
      return;
    }

    const idToUpdate = req.params.id;
    const permissionsPayload = req.body;
    const updatedPermissions = await adminServices.updatePermissions(idToUpdate, permissionsPayload);
    res.send(updatedPermissions);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const deletePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.admins.deleteAdminRole) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar administradores.",
      });
      return;
    }

    const deletedPermissions = await adminServices.deletePermissions(req.params.id);
    res.send(deletedPermissions);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const sendAdminPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permissions = await req.permissions;
    const permissionsToSend: PrixResponse = {
      success: true,
      message: "Auth exitoso",
      result: permissions
    }
    res.send(permissionsToSend);
    return;
  } catch (err) {
    next(err);
    return;
  }
};