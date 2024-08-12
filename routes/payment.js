const express = require('express');
const router = express.Router();
const client = require('../db/db_connect');

router.post("/confirm", async function (req, res) {
    const { paymentKey, orderId, amount } = req.body;

    const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
    const encryptedSecretKey =
      "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    try {
        // got 모듈을 동적으로 가져오기
        const { default: got } = await import('got');

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

        // 결제 성공 후 membership 상태 업데이트
        await client.query("UPDATE user SET membership = 1 WHERE user_id = ?", [req.cookies.USER.user_id]);
        console.log("Membership updated successfully");

    } catch (error) {
        console.log(error.response ? error.response.body : error.message);
        res.status(error.response ? error.response.statusCode : 500).send(error.response ? error.response.body : "Server Error");
    }
});

module.exports = router;
