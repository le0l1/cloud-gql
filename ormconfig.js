module.exports =
  process.env.NODE_ENV === "development"
    ? {
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "",
        database: "cloud",
        entities: ["src/graphql/**/*.entity.js"],
        migrations: ["src/migration/*.js"],
        logging: true,
        synchronize: true,
        entityPrefix: "cloud_",
        "cli.migrationsDir": "src/migration"
      }
    : 
    // test db
    {
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "",
        database: "test",
        entities: ["src/graphql/**/*.entity.js"],
        migrations: ["src/migration/*.js"],
        synchronize: true,
        dropSchema: true,
        entityPrefix: "cloud_",
        "cli.migrationsDir": "src/migration"
    };
