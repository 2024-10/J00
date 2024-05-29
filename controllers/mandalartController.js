const { generateMandalart } = require('../mandalart');
const client = require('../db'); 

exports.getMandalartForm = (req, res) => {
    client.query("SELECT * FROM subgoals", (err, subgoals) => {
        if (err) {
            console.error('subgoals 쿼리 오류:', err);
            return res.status(500).send("DB error: subgoals 쿼리 오류");
        }
        client.query("SELECT * FROM checksys", (err, checksys) => {  // checklists 테이블을 checksys로 수정
            if (err) {
                console.error('checksys 쿼리 오류:', err);
                return res.status(500).send("DB error: checksys 쿼리 오류");
            }
            res.render('mandalart', { mandalart: null, subgoals, checklists: checksys });
        });
    });
};

exports.createMandalart = (req, res) => {
    const { centerGoal, subGoals } = req.body;
    const subGoalsArray = subGoals.split(',').map(goal => goal.trim());

    try {
        const mandalart = generateMandalart(centerGoal, subGoalsArray);
        res.render('mandalart', { mandalart, subgoals: [], checklists: [] });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.addTask = (req, res) => {
    const { subgoal_id, content } = req.body;
    client.query(
        "INSERT INTO checksys (subgoal_id, content) VALUES (?, ?)",  // checklists 테이블을 checksys로 수정
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
