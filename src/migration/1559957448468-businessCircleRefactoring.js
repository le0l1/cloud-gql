export class businessCircleRefactoring1559957448468  {
    async up(queryRunner) {
      queryRunner.query("SELECT setval('cloud_business_circle_id_seq', 999)");
    }

    async down(queryRunner) {
    }
}
