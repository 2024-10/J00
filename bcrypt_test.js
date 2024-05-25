//로그인 단계 오류 발생으로 bcrypt가 올바르게 작동되는지 확인하려고 잠시 파일 생성 -> 올바르게 작동함

const bcrypt = require('bcrypt');

async function testBcrypt() {
    const plainPassword = 'password987';

    // 평문 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('Hashed password:', hashedPassword);

    // 해시된 비밀번호와 평문 비밀번호 비교
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Passwords match:', isMatch); // true 또는 false 출력
}

testBcrypt().catch(err => console.error(err));
