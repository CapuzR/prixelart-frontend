import { Request, Response, NextFunction } from "express";
import * as orderArchiveServices from "./orderArchiveServices.ts";
import { OrderArchive, PayStatus, Status } from "./orderArchiveModel.ts";

export const readOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    if (!req.permissions?.orders.readAllOrders) {
        res.send({ success: false, message: "No tienes permiso para modificar órdenes." });
        return;
    }

    try {
        if (req.params.id) {
            const result = await orderArchiveServices.readOrderById(req.params.id);
            res.send(result);
            return;
        }

        const result = await orderArchiveServices.readOrder(req.body || {});
        res.send(result);
    } catch (err) {
        next(err);
    }
};

export const readAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    if (!req.permissions?.orders.readAllOrders) {
        res.send({ success: false, message: "No tienes permiso para modificar órdenes." });
        return;
    }

    try {
        // --- Parse Query Parameters ---
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const sortBy = (req.query.sortBy as string) || 'createdOn';
        const sortOrderQuery = req.query.sortOrder as string;
        const sortOrder = (sortOrderQuery === 'asc' ? 1 : -1) as 1 | -1;
        const rawFilterStatus = req.query.status as string | undefined;
        const rawFilterPayStatus = req.query.payStatus as string | undefined;
        const search = req.query.search as string | undefined;
        const startDateString = req.query.startDate as string | undefined;
        const endDateString = req.query.endDate as string | undefined;
        const excludeStatusString = req.query.excludeStatus as string | undefined;

        // --- Validate Filters ---
        const validStatuses: Status[] = ["Anulado", "Concretado", "En producción", "Por entregar", "Entregado", "En impresión", "Por producir"];
        const validatedFilterStatus = validStatuses.includes(rawFilterStatus as Status)
            ? rawFilterStatus as Status
            : undefined;

        const validPayStatuses: PayStatus[] = ["Pagado", "Anulado", "Obsequio", "Abonado", "Pendiente"];
        const validatedFilterPayStatus = validPayStatuses.includes(rawFilterPayStatus as PayStatus)
            ? rawFilterPayStatus as PayStatus
            : undefined;

        let validatedStartDate: Date | undefined = undefined;
        if (startDateString) {
            const date = new Date(startDateString);
            if (!isNaN(date.getTime())) {
                validatedStartDate = date;
                validatedStartDate.setHours(0, 0, 0, 0);
            } else {
                console.warn(`Invalid start date received: ${startDateString}`);
            }
        }

        let validatedEndDate: Date | undefined = undefined;
        if (endDateString) {
            const date = new Date(endDateString);
            if (!isNaN(date.getTime())) {
                validatedEndDate = date;
                validatedEndDate.setHours(23, 59, 59, 999);
            } else {
                console.warn(`Invalid end date received: ${endDateString}`);
            }
        }

        // --- Prepare Service Options ---
        const options: orderArchiveServices.OrderArchiveQueryOptions = {
            page,
            limit,
            sortBy,
            sortOrder,
            filterStatus: validatedFilterStatus,
            filterPayStatus: validatedFilterPayStatus,
            search: search,
            filterStartDate: validatedStartDate,
            filterEndDate: validatedEndDate,
            filterExcludeStatus: validStatuses.includes(excludeStatusString as Status) ? excludeStatusString as Status : undefined,
        };

        const result = await orderArchiveServices.readAllOrders(options);

        res.send(result);

    } catch (error) {
        console.error("Error in readAllOrders controller:", error);
        next(error);
    }
};

export const addVoucher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.permissions?.orders.updatePayDetails) {
            res.send({ success: false, message: "No tienes permiso para modificar órdenes." });
            return;
        }

        const voucherUrl =
            req.session?.uploadResults?.paymentVoucher?.find(
                (v: { purpose: string; url: string }) => v.purpose === "OrderPaymentVoucher"
            )?.url || null;

        if (!voucherUrl) {
            res.status(400).send({ success: false, message: "No se encontró voucher en la sesión." });
            return;
        }

        const result = await orderArchiveServices.addVoucher(req.params.id, voucherUrl);
        res.send(result);
    } catch (err) {
        next(err);
    }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.permissions?.orders.updateDetails) {
            res.send({ success: false, message: "No tienes permiso para modificar órdenes." });
            return;
        }

        const partial: Partial<OrderArchive> = req.body || {};
        const result = await orderArchiveServices.updateOrder(req.params.id, partial, req.adminUsername);
        res.send(result);
    } catch (err) {
        next(err);
    }
};

export const updateItemStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.permissions?.orders.updateItemStatus) {
            res.send({ success: false, message: "No tienes permiso para modificar órdenes." });
            return;
        }

        const { orderId, itemIndex, status } = req.body;
        const result = await orderArchiveServices.updateItemStatus(orderId, itemIndex, status);
        res.send(result);
    } catch (err) {
        next(err);
    }
};
