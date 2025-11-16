import { Request, Response, NextFunction, RequestHandler } from "express";
import * as preferenceService from "./preferencesService.ts";

export const readAllImagesCarousel = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await preferenceService.getAllImagesCarousel();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getUploadResult: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const purpose = String(req.query.purpose);
  const results = (req.session as any).uploadResults || {};

  if (!purpose || !results[purpose]) {
    res.status(404)
      .json({ success: false, message: "Upload result not ready or expired." });
  }

  res.json({ success: true, url: results[purpose].url });
};

export const createCarouselItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.preferences.createBanner) {
      return
    }

    const { type, imageURL } = req.body as {
      type: "desktop" | "mobile";
      imageURL: string;           // e.g. "https://api.example.com/files/abc123"
    };

    const fileId = imageURL.split("/").pop();
    if (!fileId) {
      return
    }
    const spacesUrl = `${process.env.PUBLIC_BUCKET_URL}/${fileId}`;

    const result = await preferenceService.createCarouselItem({
      type,
      imageURL: imageURL,
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    console.error("Error in createCarouselItem controller:", err);
    next(err);
  }
};

export const deleteCarouselItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.preferences.deleteBanner) {
      return;
    }

    const { id } = req.params;
    const result = await preferenceService.deleteCarouselItem(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      if (result.message.includes('not found') || result.message.includes('Invalid ID')) {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (err) {
    console.error("Error in deleteCarouselItem controller:", err);
    next(err);
  }
};

export const updateCarouselOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.preferences.updateBanner) {
      return;
    }

    const { type } = req.params;
    const { orderedIds } = req.body;

    if (type !== 'desktop' && type !== 'mobile') {
      return;
    }

    const result = await preferenceService.updateCarouselOrder(type as "desktop" | "mobile", orderedIds);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (err) {
    console.error("Error in updateCarouselOrder controller:", err);
    next(err);
  }
};

export const readTermsAndConditions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await preferenceService.readTermsAndConditions();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateTermsAndConditions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.preferences.updateTermsAndCo) {
      res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar términos y condiciones.",
      });
      return;
    }

    const { termsAndConditions } = req.body;
    if (typeof termsAndConditions !== "string") {
      res.status(400).json({
        success: false,
        message: "El campo termsAndConditions es obligatorio y debe ser texto.",
      });
      return;
    }

    const result = await preferenceService.updateTermsAndConditions(
      termsAndConditions
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const readDollarValue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = await fetch("https://bcv-exchange-rates.vercel.app/get_exchange_rates");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    const dollarValue = jsonData.data.dolar.value;
    res.send({ dollarValue });
  } catch (error) {
    console.error(error);
    next(error);
  }
};