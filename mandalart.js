function generateMandalart(centerGoal, subGoals) {
    const size = subGoals.length + 1;
    const mandalart = Array.from({ length: 9 }, () => Array(9).fill(''));
    const positions = [
        [0, 0], [0, 4], [0, 8],
        [4, 0], [4, 4], [4, 8],
        [8, 0], [8, 4], [8, 8]
    ];

    mandalart[4][4] = centerGoal;
    positions.slice(0, size).forEach((pos, index) => {
        const [x, y] = pos;
        mandalart[x][y] = subGoals[index] || '';
    });

    return mandalart;
}

module.exports = { generateMandalart };
