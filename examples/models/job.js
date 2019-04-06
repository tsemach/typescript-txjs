
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Jobs = sequelize.define('Jobs', {
    jobId: {
               type: DataTypes.STRING, 
               allowNull: false, 
               primaryKey: true, 
        },
    name: DataTypes.STRING,
    data: DataTypes.JSON
  }, {});
  Jobs.associate = function(models) {
    // associations can be defined here
     };
      return Jobs;
      };
   
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Jobs', {
      jobId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Jobs');
  }
};

