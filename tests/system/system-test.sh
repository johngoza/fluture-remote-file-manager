#/bin/bash

cd ./tests/system/
docker-compose up --build --abort-on-container-exit --exit-code-from test-server
status=$?
docker-compose down --volumes --remove-orphans --rmi all
exit status
