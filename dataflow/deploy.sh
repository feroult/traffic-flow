#!/bin/sh
java -jar build/libs/dataflow-all-1.0.jar \
 --project=traffic-flow-app \
 --sinkProject=traffic-flow-app \
 --bigQueryTable=traffic-flow-app:demo.events \
 --zone=us-east1-c \
 --streaming \
 --stagingLocation=gs://traffic-flow-app/staging \
 --runner=DataflowRunner \
 --numWorkers=1 --maxNumWorkers=3
