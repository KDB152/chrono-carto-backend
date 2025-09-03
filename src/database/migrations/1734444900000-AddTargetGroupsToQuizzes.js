'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('quizzes', 'target_groups', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Groupes cibles qui peuvent tenter le quiz (format JSON array)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('quizzes', 'target_groups');
  }
};
