ssh -i $HOME/.ssh/id_drone -o StrictHostKeyChecking=no my_user@10.0.0.1 "cd /usr/local/bin/util-docker/$1 ; docker compose down"
ssh -i $HOME/.ssh/id_drone -o StrictHostKeyChecking=no my_user@10.0.0.1 "rm -rf /usr/local/bin/util-docker/$1/docker"
rsync -a -e "ssh -i $HOME/.ssh/id_drone -o StrictHostKeyChecking=no" docker my_user@10.0.0.1:/usr/local/bin/util-docker/$1/
rsync -a -e "ssh -i $HOME/.ssh/id_drone -o StrictHostKeyChecking=no" docker-compose.yml my_user@10.0.0.1:/usr/local/bin/util-docker/$1/
ssh -i $HOME/.ssh/id_drone -o StrictHostKeyChecking=no my_user@10.0.0.1 "cd /usr/local/bin/util-docker/$1 ; docker compose build"
ssh -i $HOME/.ssh/id_drone -o StrictHostKeyChecking=no my_user@10.0.0.1 "cd /usr/local/bin/util-docker/$1 ; docker compose up -d"
