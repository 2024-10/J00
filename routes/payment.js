const express = require('express');
const router = express.Router();
const  client  = require('../db/db_connect'); // MySQL 클라이언트 사용
const USER_COOKIE_KEY = 'USER';

let got;
(async () => {
  got = (await import('got')).default;
})();

router.post("/confirm", async function (req, res) {
  const { paymentKey, orderId, amount } = req.body;

  const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
  const encryptedSecretKey =
    "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

  try {
    const response = await got.post("https://api.tosspayments.com/v1/payments/confirm", {
      headers: {
        Authorization: encryptedSecretKey,
        "Content-Type": "application/json",
      },
      json: {
        orderId: orderId,
        amount: amount,
        paymentKey: paymentKey,
      },
      responseType: "json",
    });
    console.log(response.body);
    res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.log(error.response.body);
    res.status(error.response.statusCode).json(error.response.body);
  }
});

module.exports = router;