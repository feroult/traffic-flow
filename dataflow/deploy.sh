!/bin/sh

mvn exec:java -Dexec.mainClass="io.github.feroult.dataflow.TrafficFlow"    \  
                     -e -Dexec.args="--project=traffic-flow-app --sinkProject=traffic-flow-app  \
                     --stagingLocation=gs://traffic-flow-app --runner=DataflowPipelineRunner \
                     --streaming=true --numWorkers=1 --zone=us-east1-c"
