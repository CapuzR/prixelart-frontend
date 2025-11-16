import { Request, Response, NextFunction } from "express"
import * as prixerServices from "./prixerServices.ts"
import { Prixer } from "./prixerModel.ts"
import { ObjectId } from "mongodb"

export const promoteToPrixer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.promoteToPrixer) {
      res.status(403).send({
        success: false,
        message: "You do not have permission to promote users to Prixers.",
      });
      return;
    }

    const { userId } = req.body;
    if (!userId) {
      res.status(400).send({
        success: false,
        message: "userId is required in the request body.",
      });
      return;
    }

    const result = await prixerServices.promoteUserToPrixer(userId);
    res.send(result);

  } catch (e) {
    next(e);
  }
};

export const createPrixer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // CAN'T use adminAuth permissions cause this process is users only !

    const userId = req.params.userId
    if (!userId) {
      res.status(400).send({
        success: false,
        message: "User ID is required to create a Prixer profile.",
      })
      return
    }

    try {
      new ObjectId(userId)
    } catch (error) {
      res
        .status(400)
        .send({ success: false, message: "Invalid User ID format." })
      return
    }

    const avatarUploads = (req.session?.uploadResults as any)?.avatar as
      | { purpose: string; url: string }[]
      | undefined
    const avatarUrl =
      avatarUploads?.find((u) => u.purpose === "PrixerAvatar")?.url || null

    if (!avatarUrl) {
      throw new Error("No avatar image found in session for Prixer.")
    }

    const specialty = req.body.specialty
      ? Array.isArray(req.body.specialty)
        ? req.body.specialty
        : (req.body.specialty as string)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : undefined

    const {
      description,
      instagram,
      twitter,
      facebook,
      phone,
      status,
      termsAgree,
    } = req.body

    if (termsAgree === undefined) {
      res.status(400).send({
        success: false,
        message: "Missing required field: termsAgree.",
      })
      return
    }

    const prixerData: Prixer = {
      specialty,
      description,
      instagram,
      twitter,
      facebook,
      phone,
      avatar: avatarUrl,
      status: status === "true" || status === true,
      termsAgree: termsAgree === "true" || termsAgree === true,
    }

    const result = await prixerServices.createPrixer({
      userId: userId,
      ...prixerData,
    })

    res.send(result)
  } catch (e: any) {
    console.error("Error in createPrixer controller:", e)
    if (req.session?.uploadResults?.avatar) {
      delete req.session.uploadResults.avatar
    }
    next(e)
  } finally {
    if (req.session?.uploadResults?.avatar) {
      delete req.session.uploadResults.avatar
    }
  }
}

export const getPrixerByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await prixerServices.readByUsername(req.params.username)
    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const readAllPrixers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.readAllUsers) {
      res.send({
        success: false,
        message: "No tienes permiso para editar un Prixer.",
      })
      return
    }

    const result = await prixerServices.readAllPrixers()

    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const readAllPrixersActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await prixerServices.readAllPrixersActive()
    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const updatePrixer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const idToUpdate = (req.body.id as string) || req.params.id;

    if (!idToUpdate) {
      res.status(400).send({
        success: false,
        message: "Prixer ID is required for update.",
      });
      return;
    }

    const isOwner = req.userId && req.userId === idToUpdate;
    const isAdminWithPermission = req.permissions?.users.updateUser;

    if (!isOwner && !isAdminWithPermission) {
      res.status(403).send({
        success: false,
        message: "You do not have permission to edit this Prixer profile.",
      });
      return;
    }

    const updateData: Partial<Prixer> = {};

    if (req.body.avatar !== undefined) {
      updateData.avatar = req.body.avatar;
    }

    if (req.body.specialty !== undefined) {
      updateData.specialty = Array.isArray(req.body.specialty)
        ? req.body.specialty
        : (req.body.specialty as string).split(",");
    }
    if (req.body.description !== undefined)
      updateData.description = req.body.description;
    if (req.body.instagram !== undefined)
      updateData.instagram = req.body.instagram;
    if (req.body.twitter !== undefined) updateData.twitter = req.body.twitter;
    if (req.body.facebook !== undefined) updateData.facebook = req.body.facebook;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;

    if (isAdminWithPermission && req.body.status !== undefined) {
      updateData.status = req.body.status === "true" || req.body.status === true;
    }
    if (req.body.termsAgree !== undefined)
      updateData.termsAgree = req.body.termsAgree === "true" || req.body.termsAgree === true;

    const result = await prixerServices.updatePrixer(idToUpdate, updateData);
    res.send(result);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const updateVisibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.prixerBan) {
      res.send({
        success: false,
        message: "No tienes permiso para cambiar visibilidad.",
      })
      return
    }
    const status = req.body.status === "true" || req.body.status === true
    const result = await prixerServices.updateVisibility(req.params.id, status)
    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const updateTermsAgreeGeneral = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.preferences.updateTermsAndCo) {
      res.send({
        success: false,
        message: "No tienes permiso para perfiles globales.",
      })
      return
    }
    const termsAgree =
      req.body.termsAgree === "true" || req.body.termsAgree === true
    const result = await prixerServices.updateTermsAgreeGeneral(termsAgree)
    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const updateTermsAgree = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const termsAgree =
      req.body.termsAgree === "true" || req.body.termsAgree === true
    const result = await prixerServices.updateTermsAgree(
      req.params.id,
      termsAgree
    )
    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const destroyPrixer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.deleteUser) {
      res.send({
        success: false,
        message: "No tienes permiso para eliminar un Prixer.",
      })
      return
    }
    const id = req.body.prixerId as string
    const result = await prixerServices.deletePrixer(id)
    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}
