export class businessCircleTestData1559976340242 {
  async up(queryRunner) {
    queryRunner.query(
      `
      DO $$
      DECLARE 
         test int;
      BEGIN
         SELECT id INTO test  FROM cloud_user WHERE name = '测试用户';
         FOR counter IN 1..50 LOOP
         INSERT INTO cloud_business_circle (user_id, content, star_count, comment_count) 
         VALUES(test, '测试生意圈内容', 12, 12);
         END LOOP;
      END;$$;
      `,
    );
  }

  async down(queryRunnerr) {
    queryRunnerr.query(
      `
        DELETE FROM cloud_business_circle where content = '测试生意圈内容'
      `,
    );
  }
}
