imageName="vue-nest_build-client"
containerName="VueNestBuildClient"

source $1;

# clean dist folder
rm -rf dist
# build new container for build vue app
docker build  -f Dockerfile -t $imageName .  || true;
# run container
docker run --name $containerName -itd $imageName -v .:/app/dist ;
# copy from container's dist folder to local dist foler
docker cp $containerName:/app/dist .
# remove container after using;
docker container rm -f $containerName;
# remove image after using;
docker rmi -f $imageName;