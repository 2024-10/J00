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
                            client.query("SELECT * FROM checklist WHERE checklist_id = ?", [//테두리스트id가져와서, 만다라트도 가져와서 렌더시키기])
                            res.render("mandalart", { 
                                title: 'Mandalart', 
                                mandalart: mandalartResult[0], // Pass only the first result assuming one mandalart per user
                                tedolists: tedolistResult // Pass the list of tedolists
                            });
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
        const mandalartId = uuidv4(); // Generate a new UUID
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
        let tedolist_counter = 1;
        const detailsArray = tedolistDetails.split('\n').map(detail => detail.trim()).filter(detail => detail.length > 0); // Split the details into an array
        const values = detailsArray.map(detail => [tedolist_counter++, mandalartId, detail]);
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
        const { mandalart_id,tedolistId, checklistDetail } = req.body;
        let checklistId = 1; // Generate a new UUID for the checklist item
        client.query("INSERT INTO checklist (checklist_id, mandalart_id, tedolist_number, checklist_detail, imogi, date, is_checked) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [checklistId++, mandalart_id, tedolistId, checklistDetail, "", date, false],
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

module.exports = router;
