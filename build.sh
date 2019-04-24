env=$1
docker build . -t gql_${env}:$(git describe --abbrev=0 --tags)
