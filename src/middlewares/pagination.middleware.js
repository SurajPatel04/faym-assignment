export const paginate = (req, res, next) => {
    const { page, limit } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    req.pagination = {
        page: isNaN(parsedPage) ? 1 : Math.max(1, parsedPage),
        limit: isNaN(parsedLimit) ? 20 : Math.max(1, Math.min(100, parsedLimit)),
    };

    next();
};
