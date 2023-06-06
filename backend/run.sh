#!/bin/bash

_term() { 
  echo "Caught SIGTERM signal!" 
  pkill node
}

trap _term SIGTERM

# Start the first process
npm run --prefix ./authentication-service start:dist &

# Start the second process
npm run --prefix ./documents-service start:dist &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?