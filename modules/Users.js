/*
// 사용자 정보
const db = new Map()
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: { //id
    type: String,
    required: true,
    unique: true
  },
  email: { // e-mail
    type: String,
    required: true,
    unique: true
  },
  password: { // password
    type: String,
    required: true
  },
  birth: { //birth day
    type: Date,
    required: true
  },
  nickname: { // nickname
    type: String,
    required: true
  },
  date: { // creation date
    type: Date,
    default: Date.now
  }
});

module.exports = db.model('users', UserSchema); // db에 저장
*/