const { generateMandalart } = require('../mandalart');
const client = require('../db'); 

exports.getMandalartForm = (req, res) => {
    client.query("SELECT * FROM tedolist", (err, tedolist) => {
        if (err) {
            console.error('tedolist 쿼리 오류:', err);
            return res.status(500).send("DB error: tedolist 쿼리 오류");
        }
        client.query("SELECT * FROM checklist", (err, checklist) => {  // checklists 테이블을 checklist로 수정
            if (err) {
                console.error('checklist 쿼리 오류:', err);
                return res.status(500).send("DB error: checklist 쿼리 오류");
            }
            res.render('mandalart', { mandalart: null, tedolist, checklists: checklist });
        });
    });
};

exports.createMandalart = (req, res) => {
    const { centerGoal, tedolist } = req.body;
    const tedolistArray = tedolist.split(',').map(goal => goal.trim());

    try {
        const mandalart = generateMandalart(centerGoal, tedolistArray);
        res.render('mandalart', { mandalart, tedolist: [], checklists: [] });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.addTask = (req, res) => {
    const { subgoal_id, content } = req.body;
    client.query(
        "INSERT INTO checklist (subgoal_id, content) VALUES (?, ?)",  // checklists 테이블을 checklist로 수정
        [subgoal_id, content],
        (err, result) => {
            if (err) {
                console.error('addTask 쿼리 오류:', err);
                return res.status(500).send("DB error: addTask 쿼리 오류");
            }
            res.redirect('/mandalart');
        }
    );
};
