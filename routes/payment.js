const express = require('express');
const router = express.Router();
const client = require('../db/db_connect'); // MySQL 클라이언트 사용
const USER_COOKIE_KEY = 'USER';

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

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
    if (error.response) {
      // HTML 포함
      console.log("Error response body:", error.response.body);
      res.status(error.response.statusCode || 500).send(error.response.body);
    } else {
      // response 포함 x
      console.log("Error without response:", error);
      res.status(500).json({
        message: "서버 오류",
        error: {
          message: error.message,
          stack: error.stack,
        }
      });
    }
  }
});

module.exports = router;
