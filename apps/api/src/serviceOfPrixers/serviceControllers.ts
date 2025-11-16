import { NextFunction, Request, Response } from "express"
import * as serviceServices from "./serviceServices.ts"
import { Service } from "./serviceModel.ts"

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // const sessionImgs = req.session?.uploadResults?.serviceImages || [];
  // const imageUrls = sessionImgs
  //   .filter((f: any) => f.purpose === "ServiceImage")
  //   .map((f: any) => f.url);

  // if (imageUrls.length === 0) {
  //   res.status(400).send({
  //     success: false,
  //     message: "Se requieren al menos una imagen subida.",
  //   });
  //   return;
  // }

  try {
    const {
      title,
      description,
      prixer,
      serviceArea,
      productionTime,
      location,
      publicPrice,
      active,
      visible,
      isLocal,
      isRemote,
      sources,
      userid,
    } = req.body

    if (!title || !description || !prixer || !serviceArea) {
      res.status(400).send({
        success: false,
        message:
          "Faltan campos obligatorios: title, description, prixer, serviceArea, priceFrom.",
      })
      return
    }

    const serviceData: Service = {
      title,
      description,
      prixer,
      serviceArea,
      productionTime,
      location,
      active,
      visible,
      isLocal,
      isRemote,
      sources,
      publicPrice,
      userid,
    }

    const result = await serviceServices.createService(serviceData)
    res.send(result)
  } catch (err) {
    next(err)
  }
}

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await serviceServices.getAll()
    res.send(result)
  } catch (error) {
    next(error)
  }
}

export const getAllActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await serviceServices.getAllActive()
    res.send(result)
  } catch (error) {
    next(error)
  }
}

export const readService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await serviceServices.readService(req.params.id)
    res.send(result)
  } catch (err) {
    next(err)
  }
}

export const readMyServices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await serviceServices.readMyServices(req.body.prixer)
    res.send(result)
  } catch (error) {
    next(error)
  }
}

export const getServicesByPrixer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await serviceServices.readByPrixer(req.params.prixer)
    res.send(result)
  } catch (error) {
    next(error)
  }
}

export const getServicesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await serviceServices.readByUserId(req.params.userid)
    res.send(result)
  } catch (error) {
    next(error)
  }
}

export const updateMyService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionImgs = req.session?.uploadResults?.serviceImages || []
    const newImageUrls = sessionImgs
      .filter((f: any) => f.purpose === "ServiceImage")
      .map((f: any) => f.url)

    const existingImages: string[] = []
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        existingImages.push(...req.body.existingImages)
      } else {
        existingImages.push(req.body.existingImages)
      }
    }

    const updates: Partial<Service> = {}

    if (req.body.title != null) updates.title = req.body.title
    if (req.body.description != null) updates.description = req.body.description
    if (req.body.prixer != null) updates.prixer = req.body.prixer
    if (req.body.serviceArea != null) updates.serviceArea = req.body.serviceArea
    if (req.body.productionTime != null)
      updates.productionTime = req.body.productionTime
    if (req.body.location != null) updates.location = req.body.location
    if (req.body.active != null) updates.active = req.body.active
    if (req.body.visible != null) updates.visible = req.body.visible
    if (req.body.isLocal != null) updates.isLocal = req.body.isLocal
    if (req.body.isRemote != null) updates.isRemote = req.body.isRemote

    if (req.body.priceFrom != null) {
      updates.publicPrice = {
        from: Number(req.body.priceFrom),
        ...(req.body.priceTo != null && { to: Number(req.body.priceTo) }),
      }
    }

    if (existingImages.length || newImageUrls.length) {
      updates.sources = {
        images: [
          ...existingImages.map((url) => ({ url })),
          ...newImageUrls.map((url: string) => ({ url })),
        ],
      }
    }

    if (req.body.video != null) {
      updates.sources = {
        ...(updates.sources || { images: [] }),
        video: req.body.video,
      }
    }

    const result = await serviceServices.updateMyService(req.params.id, updates)
    res.send(result)
  } catch (err) {
    next(err)
  }
}

export const disableService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.permissions?.art.artBan) {
    res.status(403).send({
      success: false,
      message: "No tienes permiso para actualizar servicios.",
    })
    return
  }

  try {
    const active = req.body.active
    const result = await serviceServices.disableService(req.params.id, active)
    res.send(result)
  } catch (err) {
    next(err)
  }
}

export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const serviceToDelete = await serviceServices.deleteService(req.params.id)
    res.send(serviceToDelete)
  } catch (error) {
    console.error(error)
    next(error)
  }
}
