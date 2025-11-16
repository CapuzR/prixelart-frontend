import { Request, Response, NextFunction } from "express"
import * as artSvc from "./artServices.ts"
import { Art } from "./artModel.ts"
import { PrixResponse } from "../types/responseModel.ts"

function sendResult(res: Response, result: PrixResponse) {
  res.status(result.success ? 200 : 400).send(result)
}

export const createArt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    //  if (!req.permissions?.products.createProduct) {
    //   res.status(403).send({ success: false, message: "No tienes permiso para crear Artes." });
    //   return;
    // }

    // TUS-uploaded image stored in session.uploadResults.images
    // const imageUrl =
    //   req.session?.uploadResults?.images?.find(
    //     (i: any) => i.purpose === "ArtImage"
    //   )?.url || null

    // if (!imageUrl) {
    //   res
    //     .status(400)
    //     .send({
    //       success: false,
    //       message: "No se encontró imagen del Arte en sesión.",
    //     })
    //   return
    // }

    if (req.body.tags && typeof req.body.tags === "string") {
      req.body.tags = req.body.tags.split(",")
    }

    const artData: Art = {
      ...req.body,
      // artLocation: imageUrl,
      // imageUrl,
      smallThumbUrl: req.body.imageUrl,
      mediumThumbUrl: req.body.imageUrl,
      largeThumbUrl: req.body.imageUrl,
      squareThumbUrl: req.body.imageUrl,
      createdOn: new Date(),
    }

    const result = await artSvc.createArt(artData)
    sendResult(res, result)
  } catch (e) {
    next(e)
  }
}

export const updateArt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.art.updateArt) {
      res
        .status(403)
        .send({
          success: false,
          message: "No tienes permiso para modificar Artes.",
        })
      return
    }

    // look for a new TUS-uploaded image
    const imageUrl = req.session?.uploadResults?.images?.find(
      (i: any) => i.purpose === "ArtImage"
    )?.url

    const artData: Partial<Art> = { ...req.body }
    if (imageUrl) {
      artData.artLocation = imageUrl
      artData.imageUrl = imageUrl
      artData.smallThumbUrl = imageUrl
      artData.mediumThumbUrl = imageUrl
      artData.largeThumbUrl = imageUrl
      artData.squareThumbUrl = imageUrl
    }

    const result = await artSvc.updateArt(req.params.id, artData)
    sendResult(res, result)
  } catch (e) {
    next(e)
  }
}

export const updateArtAsPrixer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageUrl = req.session?.uploadResults?.images?.find(
      (i: any) => i.purpose === "ArtImage"
    )?.url

    const artData: Partial<Art> = { ...req.body }
    if (imageUrl) {
      artData.artLocation = imageUrl
      artData.imageUrl = imageUrl
      artData.smallThumbUrl = imageUrl
      artData.mediumThumbUrl = imageUrl
      artData.largeThumbUrl = imageUrl
      artData.squareThumbUrl = imageUrl
    }

    const result = await artSvc.updateArt(req.params.id, artData)
    sendResult(res, result)
  } catch (e) {
    next(e)
  }
}
export const readAllArts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.art.readAllArts) {
      res
        .status(403)
        .send({
          success: false,
          message: "No tienes permiso para modificar Artes.",
        })
      return
    }

    const result = await artSvc.readAllArts()
    res.send(result)
  } catch (e) {
    next(e)
  }
}

export const readGallery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await artSvc.readGallery(req.body)
    res.send(result)
  } catch (e) {
    next(e)
  }
}

export const readLatest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await artSvc.readLatest()
    res.send(result)
  } catch (e) {
    next(e)
  }
}

export const readAllByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const username = req.params.username
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 10

    const sortBy = req.query.sortBy as string | undefined
    const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined
    const category = req.query.category as string | undefined

    // Input validation
    if (page < 1) {
      res
        .status(400)
        .send({ success: false, message: "Page number must be 1 or greater." })
      return
    }
    if (limit < 1 || limit > 100) {
      // Max limit
      res
        .status(400)
        .send({ success: false, message: "Limit must be between 1 and 100." })
      return
    }

    const result = await artSvc.readAllByUsername(
      username,
      page,
      limit,
      sortBy,
      sortOrder,
      category
    )

    res
      .status(
        result.success
          ? 200
          : result.message.includes("not found") ||
            result.message.includes("no encontrado")
          ? 404
          : 400
      )
      .send(result)
  } catch (e) {
    next(e)
  }
}

export const readOneById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await artSvc.readOneById(id)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const readOneByObjId = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await artSvc.readOneByObjId(id)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const randomArts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await artSvc.randomArts()
    res.send(result)
  } catch (e) {
    next(e)
  }
}

export const readBestSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await artSvc.getBestSellers(req.body.orders || [])
    res.send(result)
  } catch (e) {
    next(e)
  }
}

export const deleteArt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.art.deleteArt) {
      res.send({
        success: false,
        message: "No tienes permiso para eliminar Artes.",
      })
      return
    }

    const result = await artSvc.deleteArt(req.params.id)
    res.send(result)
  } catch (e) {
    next(e)
  }
}

export const disableArt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.art.artBan) {
      res
        .status(403)
        .send({
          success: false,
          message: "No tienes permiso para modificar Artes.",
        })
      return
    }

    const result = await artSvc.disableArt(req.params.id)
    res.send(result)
  } catch (e) {
    next(e)
  }
}

export const rankArt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.art.updateArt) {
      res
        .status(403)
        .send({
          success: false,
          message: "No tienes permiso para modificar Artes.",
        })
      return
    }
    const result = await artSvc.rankArt(req.params.id, req.body)
    res.send(result)
  } catch (e) {
    next(e)
  }
}
