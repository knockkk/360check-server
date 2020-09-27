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

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));
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
