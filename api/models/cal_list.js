const Sequelize = require('sequelize');

module.exports = class CalList extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      seq: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      important: {
        type: Sequelize.INTEGER,
        defaultValue : 0
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      latitude: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      longitude: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    },{
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'CalList',
      tableName: 'cal_list',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.CalList.belongsTo(db.Member, { foreignKey: 'mail', targetKey: 'mail' });
  }
};

