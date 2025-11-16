import { Request, Response, NextFunction } from "express"
import * as accountServices from "./accountServices.ts"
import { nanoid } from "nanoid"

export const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.movement.createWallet) {
      res.send({
        success: false,
        message: "No tienes permiso para leer Billeteras.",
      })
      return
    }
    const account = {
      _id: nanoid(24),
      balance: req.body?.balance || 0,
    }

    const result = await accountServices.createAndAssignAccount(
      req.body.email,
      account
    )

    res.status(result.success ? 201 : 400).send(result)
  } catch (e) {
    next(e)
  }
}

export const checkBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id: string = req.params.id
    const balance = await accountServices.checkBalance(id)
    res.send(balance)
    return
  } catch (e) {
    next(e)
    return
  }
}

export const readAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.readPrixerBalance) {
      res.send({
        success: false,
        message: "No tienes permiso para leer Billeteras.",
      })
      return
    }

    const accountsRead = await accountServices.readAll()
    res.send(accountsRead)
    return
  } catch (e) {
    next(e)
    return
  }
}
