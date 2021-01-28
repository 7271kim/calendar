const Sequelize = require('sequelize');
const Member = require('./member');
const CalList = require('./cal_list');
const dotenv = require('dotenv');
dotenv.config();


const env = process.env.PRODUCTION || 'dev';
const config = require(`../config/${env}`);
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Member = Member;
db.CalList = CalList;

Member.init(sequelize);
CalList.init(sequelize);

Member.associate(db);
CalList.associate(db);

module.exports = db;
