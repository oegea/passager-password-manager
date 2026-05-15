#!/bin/bash

_term() { 
  echo "Caught SIGTERM signal!" 
  pkill node
}

trap _term SIGTERM

# Start the first process
pnpm --dir ./authentication-service run start:dist &

# Start the second process
pnpm --dir ./documents-service run start:dist &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?