const Sequelize = require('sequelize');

module.exports = class Member extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      mail: {
        type: Sequelize.STRING(100),
        allowNull: false,
        primaryKey: true
      },
      seq: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      join_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      empty1: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      empty2: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      empty3: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    },{
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Member',
      tableName: 'cal_member',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Member.hasMany(db.CalList, { foreignKey: 'mail', sourceKey: 'mail' });
  }
};
