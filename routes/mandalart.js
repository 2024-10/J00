const express = require('express');
const router = express.Router();
const client = require('../db'); // Assuming db.js is in the root directory
const { v4: uuidv4 } = require('uuid'); // Import uuid package

// Mandalart routes
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
                                        res.render("mandalart", { 
                                            title: 'Mandalart', 
                                            mandalart: mandalartResult[0], // 만다라트 사용자별로 일단 하나씩 렌더링하게
                                            tedolists: tedolistResult, // 테두리스트 목록 넘겨주고
                                            checklists // 체크리스트도 넘겨주깅
                                        });
                                    }
                                });
                            } else {
                                const checklists = {};
                                res.render("mandalart", { 
                                    title: 'Mandalart', 
                                    mandalart: mandalartResult[0], // 만다라트 사용자별로 일단 하나씩 렌더링하게
                                    tedolists: tedolistResult, // 테두리스트 목록 넘겨주고
                                    checklists // 빈 체크리스트 객체를 넘겨주기
                                });
                            }
                        }
                    });
                } else {
                    res.render("createMandalart", { title: 'Create Mandalart', user });
                }
            }
        });
    } else {
        res.redirect('/signin');
    }
});

router.post('/create', (req, res) => {  
    const userCookie = req.cookies['USER'];
    const user = userCookie ? JSON.parse(userCookie) : null;

    if (user) {
        const { centergoal, tedolistCount } = req.body;
        const mandalartId = uuidv4(); 
        client.query("INSERT INTO mandalart (mandalart_id, user_id, centergoal, tedolist_count) VALUES (?, ?, ?, ?)", 
            [mandalartId, user.user_id, centergoal, tedolistCount],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Server error");
                } else {
                    res.redirect(`/mandalart`);
                }
            }
        );
    } else {
        res.redirect('/signin');
    }
});

router.post('/addTedolist', (req, res) => {
    const userCookie = req.cookies['USER'];
    const user = userCookie ? JSON.parse(userCookie) : null;

    if (user) {
        const { mandalartId, tedolistDetails } = req.body;
        client.query("SELECT COALESCE(MAX(tedolist_number), 0) + 1 AS new_tedolist_number FROM tedolist WHERE mandalart_id = ?", [mandalartId], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Server error");
            } else {
                let tedolist_number = result[0].new_tedolist_number; //배열로 만들어버리기
                const detailsArray = tedolistDetails.split(',').map(detail => detail.trim()).filter(detail => detail.length > 0); //테두리스트 one per line으로 받아서 나눔
                const values = detailsArray.map(detail => [tedolist_number++, mandalartId, detail]);
                client.query("INSERT INTO tedolist (tedolist_number, mandalart_id, tedolist_detail) VALUES ?", 
                    [values],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Server error");
                        } else {
                            res.redirect(`/mandalart`);
                        }
                    }
                );
            }
        });
    } else {
        res.redirect('/signin');
    }
});

router.post('/addChecklist', (req, res) => {
    const userCookie = req.cookies['USER'];
    const user = userCookie ? JSON.parse(userCookie) : null;
    const today = new Date();
    const date = today.toISOString().split('T')[0];

    if (user) {
        const { mandalart_id, tedolistNumber, checklistDetail } = req.body;
        client.query("SELECT COALESCE(MAX(checklist_id), 0) + 1 AS new_id FROM checklist WHERE tedolist_number = ?", [tedolistNumber], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Server error");
            } else {
                const checklistId = result[0].new_id;
                client.query("INSERT INTO checklist (checklist_id, mandalart_id, tedolist_number, checklist_detail, imogi, date, is_checked) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                    [checklistId, mandalart_id, tedolistNumber, checklistDetail, "", date, false],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Server error");
                        } else {
                            res.redirect(`/mandalart`);
                        }
                    }
                );
            }
        });
    } else {
        res.redirect('/signin');
    }
});

module.exports = router;
