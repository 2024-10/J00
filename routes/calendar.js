const express = require('express');
const router = express.Router();
const client = require('../db'); 

router.get('/', (req, res) => {
    const userCookie = req.cookies['USER'];
    const user = userCookie ? JSON.parse(userCookie) : null;

    if (user) {
        client.query("SELECT * FROM mandalart WHERE user_id = ?", [user.user_id], (err, mandalartResult) => {
            if (err) {
                console.log(err);
                res.status(500).send("Server error");
            } else {
                if (mandalartResult.length > 0) {
                    const mandalartId = mandalartResult[0].mandalart_id;
                    client.query("SELECT * FROM tedolist WHERE mandalart_id = ?", [mandalartId], (err, tedolistResult) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Server error");
                        } else {
                            const tedolistIds = tedolistResult.map(tedolist => tedolist.tedolist_number);
                            if (tedolistIds.length > 0) {
                                client.query("SELECT * FROM checklist WHERE mandalart_id = ? AND tedolist_number IN (?)", [mandalartId, tedolistIds], (err, checklistResult) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send("Server error");
                                    } else {
                                        const checklists = checklistResult.reduce((acc, checklist) => {
                                            if (!acc[checklist.tedolist_number]) {
                                                acc[checklist.tedolist_number] = [];
                                            }
                                            acc[checklist.tedolist_number].push(checklist);
                                            return acc;
                                        }, {});
                                        res.render("viewMandalart", { 
                                            mandalart: mandalartResult[0], 
                                            tedolists: tedolistResult, 
                                            checklists
                                        });
                                    }
                                });
                            } else {
                                const checklists = {};
                                res.render("viewMandalart", { 
                                    mandalart: mandalartResult[0], 
                                    tedolists: tedolistResult, 
                                    checklists
                                });
                            }
                        }
                    });
                } else {
                    res.redirect('/mandalart/create');
                }
            }
        });
    } else {
        res.redirect('/signin');
    }
});

router.get('/checklists/:mandalartId/:tedolistNumber', (req, res) => {
    const { mandalartId, tedolistNumber } = req.params;

    client.query("SELECT * FROM checklist WHERE mandalart_id = ? AND tedolist_number = ?", [mandalartId, tedolistNumber], (err, checklists) => {
        if (err) {
            console.log(err);
            res.status(500).send("Server error");
        } else {
            res.json(checklists);
        }
    });
});

module.exports = router;
