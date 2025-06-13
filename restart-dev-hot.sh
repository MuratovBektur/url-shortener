git pull;

# получем имя докер композера 
# (либо docker compose либо docker-compose)
# по которому можно обращяться
source docker-compose-name.sh;

env_path="dev-hot.env"

"${DOCKER_COMPOSE[@]}" -f docker-compose.dev-hot.yml --env-file $env_path down -v;
"${DOCKER_COMPOSE[@]}" -f docker-compose.dev-hot.yml --env-file $env_path up -d --build;
"${DOCKER_COMPOSE[@]}" -f docker-compose.dev-hot.yml logs -f --tail=100;