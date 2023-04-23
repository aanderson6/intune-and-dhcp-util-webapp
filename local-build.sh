docker compose down
docker stop build-node
docker rm build-node

#compile react code
docker run -d -t --name build-node node
docker cp ./util-frontend build-node:/node
docker exec -w /node build-node npm install
docker exec -w /node build-node npm run build
docker cp build-node:/node/build ./util-frontend/
docker stop build-node
docker rm build-node

#copy to deploy folder
rm -r docker/build-deploy
mkdir docker/build-deploy
cp -r util-backend/* docker/build-deploy
USERR=$(whoami)
cp /home/$USERR/.ssh/util-deploy-key docker/build-deploy/dhcp-ssh/key
cp /home/$USERR/.ssh/util-deploy-config /docker/build-deploy/dhcp-ssh/ssh-config
cp -r util-frontend/build/static docker/build-deploy
mkdir docker/build-deploy/templates
rsync -a util-frontend/build/* docker/build-deploy/templates --exclude static

docker compose build
