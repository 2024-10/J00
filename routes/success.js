const express = require('express');
const router = express.Router();
const client = require('../db'); 
const USER_COOKIE_KEY = 'USER';

router.post('/update-membership', async (req, res) => {
    const userCookie = req.cookies[USER_COOKIE_KEY];
    
    if (!userCookie) {
        return res.status(401).json({ success: false, message: 'User not logged in.' });
    }

    const user = JSON.parse(userCookie);
    const userId = user.user_id;

    try {
        await client.query('UPDATE user SET membership = ? WHERE user_id = ?', [1, userId]);
        res.json({ success: true, message: '멤버십 업데이트 완료' });
    } catch (error) {
        console.error('Error updating membership:', error);
        res.status(500).json({ success: false, message: '멤버십 업데이트 실패' });
    }
});

module.exports = router;