const express = require('express');
const router = express.Router();
const client = require('../db/db_connect');
const USER_COOKIE_KEY = 'USER';

let got;
(async () => {
  got = (await import('got')).default;
})();

async function queryAsync(query, params) {
    return new Promise((resolve, reject) => {
        client.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

router.post("/confirm", async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;

  const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
  const encryptedSecretKey = "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

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

      console.log("Payment confirmation successful:", response.body);

      // 결제 성공 후 멤버십 업데이트
      const userId = JSON.parse(req.cookies[USER_COOKIE_KEY]).user_id;
      const updateQuery = 'UPDATE user SET membership = ? WHERE user_id = ?';
      const result = await queryAsync(updateQuery, [1, userId]);

      if (result.affectedRows > 0) {
          console.log("Membership updated successfully");
          res.status(response.statusCode).json({
              ...response.body,
              message: 'Membership updated successfully',
          });
      } else {
          console.log("No user found with the provided user_id");
          res.status(404).json({ 
              success: false, 
              message: '사용자를 찾을 수 없습니다.' 
          });
      }
  } catch (error) {
      if (error.response) {
          console.error("Error response received:", error.response.body);
          res.status(error.response.statusCode || 500).json({
              success: false,
              message: '결제 확인 중 오류 발생',
              error: error.response.body,
          });
      } else {
          console.error("Error without response:", error.message);
          console.error("Stack trace:", error.stack);
          res.status(500).json({
              success: false,
              message: '서버 오류',
              error: {
                  message: error.message,
                  stack: error.stack,
              }
          });
      }
  }
});

module.exports = router;
