module.exports = (req, res, next) => {
  if (!req.session.username) {
    res.send({ error: "NotLogin", msg: "未登陆" });
    return;
  }
  next();
};
