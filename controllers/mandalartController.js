const { generateMandalart } = require('../mandalart');
const client = require('../db');

exports.getMandalartForm = (req, res) => {
    const user = JSON.parse(req.cookies['USER']);

    const sql = "SELECT * FROM mandalart WHERE user_id = ?";
    console.log('Executing SQL for mandalart:', sql, [user.user_id]);
    client.query(sql, [user.user_id], (err, mandalartResults) => {
        if (err) {
            console.error('mandalart 쿼리 오류:', err);
            return res.status(500).send("DB error: mandalart 쿼리 오류");
        }
        console.log('mandalartResults:', mandalartResults);

        if (mandalartResults.length === 0) {
            res.render('mandalart', { mandalart: null, tedolist: [], checklists: [] });
        } else {
            const mandalart = mandalartResults[0];
            const tedolistSql = "SELECT * FROM tedolist WHERE mandalart_id = ?";
            console.log('Executing SQL for tedolist:', tedolistSql, [mandalart.mandalart_id]);
            client.query(tedolistSql, [mandalart.mandalart_id], (err, tedolistResults) => {
                if (err) {
                    console.error('tedolist 쿼리 오류:', err);
                    return res.status(500).send("DB error: tedolist 쿼리 오류");
                }
                console.log('tedolistResults:', tedolistResults);

                const checklistSql = "SELECT * FROM checklist WHERE mandalart_id = ?";
                console.log('Executing SQL for checklist:', checklistSql, [mandalart.mandalart_id]);
                client.query(checklistSql, [mandalart.mandalart_id], (err, checklistResults) => {
                    if (err) {
                        console.error('checklist 쿼리 오류:', err);
                        return res.status(500).send("DB error: checklist 쿼리 오류");
                    }
                    console.log('checklistResults:', checklistResults);

                    res.render('mandalart', { mandalart, tedolist: tedolistResults, checklists: checklistResults });
                });
            });
        }
    });
};

exports.createMandalart = (req, res) => {
    const { centerGoal, tedolist } = req.body;
    if (!centerGoal || !tedolist) {
        return res.status(400).send("Center goal and tedolist are required");
    }
    const tedolistArray = tedolist.split(',').map(goal => goal.trim());
    const user = JSON.parse(req.cookies['USER']);

    const mandalartId = generateUniqueId();
    const sql = "INSERT INTO mandalart (mandalart_id, tedolist_count, user_id, centerGoal) VALUES (?, ?, ?, ?)";
    console.log('Executing SQL for create mandalart:', sql, [mandalartId, tedolistArray.length, user.user_id, centerGoal]);

    client.query(sql, [mandalartId, tedolistArray.length, user.user_id, centerGoal], (err, result) => {
        if (err) {
            console.error('mandalart 저장 오류:', err);
            return res.status(500).send("DB error: mandalart 저장 오류");
        }
        console.log('mandalart 저장 결과:', result);

        const tedolistSql = "INSERT INTO tedolist (mandalart_id, tedolist_detail) VALUES ?";
        const tedolistValues = tedolistArray.map(detail => [mandalartId, detail]);
        console.log('Executing SQL for tedolist:', tedolistSql, tedolistValues);
        client.query(tedolistSql, [tedolistValues], (err, result) => {
            if (err) {
                console.error('tedolist 저장 오류:', err);
                return res.status(500).send("DB error: tedolist 저장 오류");
            }
            console.log('tedolist 저장 결과:', result);

            res.json({ success: true, message: "Mandalart created successfully" });
        });
    });
};

exports.addTask = (req, res) => {
    const { tedolist_number, content } = req.body;
    const user = JSON.parse(req.cookies['USER']);

    const sqlGetMandalartId = "SELECT mandalart_id FROM mandalart WHERE user_id = ?";
    client.query(sqlGetMandalartId, [user.user_id], (err, results) => {
        if (err) {
            console.error('getMandalartId 쿼리 오류:', err);
            return res.status(500).send("DB error: getMandalartId 쿼리 오류");
        }

        if (results.length === 0) {
            return res.status(400).send("No mandalart found for user");
        }

        const mandalartId = results[0].mandalart_id;
        console.log('Executing SQL for addTask:', [mandalartId, tedolist_number, content]);
        const sql = "INSERT INTO checklist (mandalart_id, tedolist_number, checklist_detail) VALUES (?, ?, ?)";
        client.query(sql, [mandalartId, tedolist_number, content], (err, result) => {
            if (err) {
                console.error('addTask 쿼리 오류:', err);
                return res.status(500).send("DB error: addTask 쿼리 오류");
            }
            console.log('addTask 저장 결과:', result);
            res.redirect('/mandalart');
        });
    });
};

function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

function getPositions(numCells) {
    switch (numCells) {
        case 2:
            return ["left", "right"];
        case 3:
            return ["left", "right", "down"];
        case 4:
            return ["up", "left", "right", "down"];
        case 5:
            return ["up", "left", "right", "down-left", "down-right"];
        case 6:
            return ["up", "up-left", "up-right", "down", "down-left", "down-right"];
        case 7:
            return ["up-left", "up-right", "left", "right", "down", "down-left", "down-right"];
        case 8:
            return ["up-left", "up", "up-right", "left", "right", "down-left", "down", "down-right"];
        default:
            return [];
    }
}
