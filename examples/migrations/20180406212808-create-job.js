
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
//   };
//     return Jobs;
};

