console.log(`version: "3.7"
services:
  nodejs:
    image: leezzxuan/gql:${process.env.CIRCLE_TAG}
    restart: always
    tty: true
    container_name: graphql-node
    depends_on:
      - pgsql
    links:
      - pgsql
    environment:
      - PGUSER=postgres
      - PGHOST=pgsql
      - PGDATABASE=cloud
      - PRIVATE_TOKEN_KEY=1asdqwdqwdqqw
    ports:
      - 127.0.0.1:4500:80
  pgsql:
    image: postgres:alpine
    restart: always
    container_name: pgsql
    volumes:
      - /etc/postgres:/var/lib/postgresql/data
    ports:
      - 127.0.0.1:5432:5432`);
