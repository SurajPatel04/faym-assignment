import { ApiError } from "../utils/apiError.utils.js";

export const validate = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            return next(
                new ApiError(422, "Validation failed", errors)
            );
        }

        req.body = result.data;
        next();
    };
};