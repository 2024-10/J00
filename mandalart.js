function generateMandalart(mandalart, tedolist) {
    const size = tedolist.length + 1;
    const m = Array.from({ length: 9 }, () => Array(9).fill(''));
    const positions = [
        [0, 0], [0, 4], [0, 8],
        [4, 0], [4, 4], [4, 8],
        [8, 0], [8, 4], [8, 8]
    ];

    m[4][4] = mandalart;
    positions.slice(0, size).forEach((pos, index) => {
        const [x, y] = pos;
        m[x][y] = tedolist[index] || '';
    });

    return m;
}

module.exports = { generateMandalart };
