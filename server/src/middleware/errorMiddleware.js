const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode;
    if (statusCode === 200 || statusCode === 201) statusCode = 500;

    res.status(statusCode);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};
