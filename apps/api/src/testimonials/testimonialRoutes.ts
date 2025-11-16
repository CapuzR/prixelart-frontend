import express from "express"
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts"
import {
  createTestimonial,
  readAllTestimonials,
  readById,
  updateTestimonial,
  deleteTestimonial,
  updateTestimonialOrderController,
} from "./testimonialController.ts"

const testimonialRoutes = express.Router()

testimonialRoutes
  .get("/testimonial", readAllTestimonials)
  .get("/testimonial/:id", readById)
testimonialRoutes.post(
  "/testimonial/create",
  adminControllers.ensureAuthenticated,
  createTestimonial
)
testimonialRoutes.put(
  "/testimonial/update/:id",
  adminControllers.ensureAuthenticated,
  updateTestimonial
)
testimonialRoutes.put(
  "/testimonial/order",
  adminControllers.ensureAuthenticated,
  updateTestimonialOrderController
)
testimonialRoutes.delete(
  "/testimonial/delete/:id",
  adminControllers.ensureAuthenticated,
  deleteTestimonial
)

export default testimonialRoutes
