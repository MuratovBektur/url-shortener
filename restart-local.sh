git pull;

# получем имя докер композера 
# (либо docker compose либо docker-compose)
# по которому можно обращяться
source docker-compose-name.sh;

env_path="local.env"

# Загружаем и экспортируем переменные окружения
set -a  # автоматически экспортируем все переменные
source $env_path;
set +a  # отключаем автоэкспорт

echo $DB_DATABASE;
echo '1';

"${DOCKER_COMPOSE[@]}" -f docker-compose.local.yml --env-file $env_path down -v;
"${DOCKER_COMPOSE[@]}" -f docker-compose.local.yml --env-file $env_path up -d --build;
"${DOCKER_COMPOSE[@]}" -f docker-compose.local.yml logs -f --tail=100;