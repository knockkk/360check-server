const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);
const errorHandler = require("./middleware/errorHandler");
const router = require("./routes");
//连接数据库
const dbConnect = require("./mongodb");
dbConnect(require("./config").dbUrl);

const app = express();
//设置允许跨域访问
app.all("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "SDCA!@#$ASDAC^*(",
    cookie: { maxAge: 60 * 60 * 1000 },
    store: new mongoStore({ url: require("./config").dbUrl }),
  })
);
//路由
router(app);
//错误处理中间件
app.use(errorHandler);

module.exports = app;
