module.exports = (err, req, res, next) => {
  if (typeof err === "object" && err.status) {
    const statusErrorMap = {
      400: "InvalidParams",
      401: "Unauthorized",
      500: "ServerError",
    };
    let status = err.status;
    let errType = statusErrorMap[status] || "";
    let msg = err.msg;
    res.status(status).send({ error: errType, msg });
  } else {
    res.status(500).send({ msg: JSON.stringify(err) });
  }
};
