#!/bin/sh

read -d '' CMD << EOF
    java -jar build/libs/dataflow-all-1.0.jar
         --project=traffic-flow-app
         --sinkProject=traffic-flow-app
         --bigQueryTable=traffic-flow-app:demo.events
         --zone=us-east1-c
         --streaming
         --stagingLocation=gs://traffic-flow-app/staging
         --runner=DataflowRunner
         --numWorkers=1 --maxNumWorkers=3
EOF

if [ -z "$1" ]; then
    echo "Deploying new pipeline..."
    eval $CMD
else
    echo "Updating existing pipeline: $1..."
    eval $CMD --update --jobName=$1
fi


