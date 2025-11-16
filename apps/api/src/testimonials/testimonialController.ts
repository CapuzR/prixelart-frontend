import { NextFunction, Request, Response } from "express";
import * as testimonialServices from "./testimonialServices.ts";
import { Testimonial } from "./testimonialModel.ts";

export const createTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.testimonials.createTestimonial) {
      res.send({
        success: false,
        message: "No tienes permiso para cargar Testimonials.",
      });
      return;
    }

    const imageAvatar =
      req.session && req.session.uploadResults?.avatar
        ? req.session.uploadResults.avatar.find((avatar: { purpose: string; url: string }) => avatar.purpose === "TestimonialAvatar")?.url || null
        : null;

    if (!imageAvatar) {
      throw new Error("No avatar image found in session.");
    }

    const { type, name, value, status } = req.body;

    if (!type || !name || !value || status === undefined) {
      res.status(400).send({
        success: false,
        message: "Missing required fields: type, name, value, and status are required.",
      });
      return;
    }

    const testimonialData: Testimonial = {
      type,
      name,
      value,
      avatar: imageAvatar,
      status,
      footer: req.body.footer,
      position: req.body.position,
    };

    const result = await testimonialServices.createTestimonial(testimonialData);
    res.send(result);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const readAllTestimonials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultTestimonials = await testimonialServices.readAllTestimonials();
    res.send(resultTestimonials);
  } catch (err) {
    next(err);
  }
};

export const readById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultTestimonial = await testimonialServices.readById(req.params.id);
    res.send(resultTestimonial);
  } catch (err) {
    next(err);
  }
};

export const updateTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.testimonials.updateTestimonial) {
      res.send({
        success: false,
        message: "No tienes permiso para cargar Testimonials.",
      });
      return;
    }

    const imageAvatar =
      req.session && req.session.uploadResults?.avatar
        ? req.session.uploadResults.avatar.find((avatar: { purpose: string; url: string }) => avatar.purpose === "TestimonialAvatar")?.url || null
        : null;

    const testimonialData: Partial<Testimonial> = {};

    if (req.body.type !== undefined) testimonialData.type = req.body.type;
    if (req.body.name !== undefined) testimonialData.name = req.body.name;
    if (req.body.value !== undefined) testimonialData.value = req.body.value;
    if (imageAvatar !== undefined) testimonialData.avatar = imageAvatar;
    if (req.body.footer !== undefined) testimonialData.footer = req.body.footer;
    if (req.body.status !== undefined) testimonialData.status = req.body.status;
    if (req.body.position !== undefined) testimonialData.position = req.body.position;

    const updates = await testimonialServices.updateTestimonial(req.params.id, testimonialData);
    res.send(updates);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateTestimonialOrderController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.testimonials.updateTestimonial) {
      res.status(403).send({
        success: false,
        message: "No tienes permiso para reordenar Testimonials.",
      });
      return;
    }

    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      res.status(400).send({
        success: false,
        message: "Invalid input: 'orderedIds' must be provided as an array in the request body.",
      });
      return;
    }

    const result = await testimonialServices.updateTestimonialOrder(orderedIds);

    res.status(result.success ? 200 : 400).send(result);

  } catch (error) {
    console.error("Error in updateTestimonialOrder controller:", error);
    next(error);
  }
};

export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.testimonials.deleteTestimonial) {
      res.send({
        success: false,
        message: "No tienes permiso para eliminar Testimonials.",
      });
      return;
    }
    const testimonialResult = await testimonialServices.deleteTestimonial(req.params.id);
    res.send(testimonialResult);

  } catch (err) {
    console.error(err);
    next(err);
  }
};