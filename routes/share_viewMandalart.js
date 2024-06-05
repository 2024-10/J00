const express = require('express');
const router = express.Router();
const client = require('../db');
const USER_COOKIE_KEY = 'USER';

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


module.exports = router;
