module.exports = (err, req, res, next) => {
  const statusErrorMap = {
    400: "InvalidParams",
    401: "Unauthorized",
    500: "ServerError",
  };
  let status = err.status;
  let errType = statusErrorMap[status] || "";
  let msg = err.msg;
  res.status(status).send({ error: errType, msg });
};
