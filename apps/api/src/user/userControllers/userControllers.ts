import { NextFunction, Request, Response } from "express"
import * as userService from "../userServices/userServices.ts"
import { PrixResponse } from "../../types/responseModel.ts"

// CRUD Controllers

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.createConsumer) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar usuarios.",
      })
      return
    }
    const result = await userService.createUser(req.body)
    res.send(result)
  } catch (err) {
    next(err)
    return
  }
}

export const readMyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(400).send(null)
    } else {
      const resultUser = await userService.readUserById(req.userId)
      res.send(resultUser)
    }
  } catch (err) {
    next(err)
  }
}

export const readUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.readAllUsers) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar usuarios.",
      })
      return
    }

    const resultUser = await userService.readUserById(req.params.id)
    res.send(resultUser)
  } catch (err) {
    next(err)
  }
}

export const readAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.permissions?.users.readAllUsers) {
    res.send({
      success: false,
      message: "No tienes permiso para modificar usuarios.",
    })
    return
  }

  try {
    const resultUsers = await userService.readAllUsers()
    res.send(resultUsers)
  } catch (err) {
    next(err)
  }
}

export const readUserByAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.permissions?.users.readPrixerBalance) {
    res.send({
      success: false,
      message: "No tienes permiso para modificar usuarios.",
    })
    return
  }

  try {
    const account: string = req.body.account
    const getUser = await userService.readUserByAccount(account)
    res.send(getUser)
  } catch (error) {
    next(error)
  }
}

export const getUsersByIds = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.permissions?.users.readAllUsers) {
    res.send({
      success: false,
      message: "No tienes permiso para modificar usuarios.",
    })
    return
  }

  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({
        success: false,
        message: "Request body must contain an 'ids' array.",
        result: null,
      })
      return
    }

    if (!ids.every((id) => typeof id === "string")) {
      res.status(400).json({
        success: false,
        message: "All elements in the 'ids' array must be strings.",
        result: null,
      })
      return
    }

    const serviceResponse: PrixResponse = await userService.getUsersByIds(ids)

    if (serviceResponse.success) {
      res.status(200).json(serviceResponse)
    } else {
      let statusCode = 400
      if (serviceResponse.message?.startsWith("An error occurred")) {
        statusCode = 500
      }
      res.status(statusCode).json(serviceResponse)
    }
  } catch (err) {
    next(err)
  }
}

export const readStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {
    const prixer: string = req.params.username
    const data = await userService.getMyStats(prixer)
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.updateUser) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar usuarios.",
      })
      return
    }

    const userData = req.body

    const updatedUser = await userService.updateUser(req.params.id, userData)
    res.send(updatedUser)
    return
  } catch (err) {
    next(err)
    return
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.deleteUser) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar usuarios.",
      })
      return
    }

    const deletedUser = await userService.deleteUser(req.params.username)
    res.send(deletedUser)
    return
  } catch (err) {
    next(err)
    return
  }
}
