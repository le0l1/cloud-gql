// 测试生意圈评论
export class businessCircleCommentTestData1560041103543 {
  async up(queryRunner) {
    queryRunner.query(
      `
        DO $$
        DECLARE
          test int;
          businessCircle int;
        BEGIN
          SELECT id into test FROM cloud_user WHERE name = '测试用户';
          

          FOR businessCircle IN
          SELECT id FROM cloud_business_circle WHERE content = '测试生意圈内容'
          LOOP
            INSERT INTO cloud_comment ("belongtoId", comment, comment_type, comment_type_id)
            VALUES(test, '测试生意圈评论', 'businessCircle', businessCircle);
          END LOOP;

        END;
        $$;
        `
    );
  }

  async down(queryRunner) {}
}
