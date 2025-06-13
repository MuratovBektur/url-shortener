git pull;

# получем имя докер композера 
# (либо docker compose либо docker-compose)
# по которому можно обращяться
source docker-compose-name.sh;

env_path="prod.env"

# билдим клиент в папку client/dist
# чтобы потом вставить её в nginx контейнер
cd client;
source ./build.sh;
cd ..;

"${DOCKER_COMPOSE[@]}" --env-file $env_path down -v;
"${DOCKER_COMPOSE[@]}" --env-file $env_path up -d --build;
"${DOCKER_COMPOSE[@]}" logs -f --tail=100;