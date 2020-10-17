const https = require("https");
const querystring = require("querystring");
module.exports = {
  requestyxAuth(username, password) {
    return new Promise((resolve, reject) => {
      const params = querystring.stringify({
        yxid: username,
        passwd: Buffer.from(password).toString("base64"),
      });
      const option = {
        host: "yx_auth.dian.org.cn",
        path: "/validate",
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      };
      const req = https.request(option, (response) => {
        let resStr = "";
        response.on("data", (data) => {
          resStr += data;
        });
        response.on("end", () => {
          let resObj = {};
          try {
            resObj = JSON.parse(resStr);
          } catch (err) {}
          resolve(resObj);
        });
      });
      req.on("error", (err) => {
        reject(err);
      });
      req.write(params);
      req.end();
    });
  },
};
