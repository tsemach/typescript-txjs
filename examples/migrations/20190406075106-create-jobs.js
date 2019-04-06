'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Jobs', {
    	jobId: {
    		type: Sequelize.STRING, 
	      allowNull: false, 
      	primaryKey: true, 
    	},
    	name: Sequelize.STRING,
    	data: Sequelize.JSON,
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
