export const applyAuthRoute = router => {
  router.post("/token", (ctx, next) => {
    ctx.set("Authorization", "sometoken");
  });
};
