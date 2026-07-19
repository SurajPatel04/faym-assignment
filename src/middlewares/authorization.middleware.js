import { ApiError } from "../utils/apiError.utils.js";

export const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError(403, `Forbidden. Requires one of roles: ${roles.join(", ")}`));
        }
        next();
    };
};
