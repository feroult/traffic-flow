# Traffic Flow Demo

~~~ bash

mvn exec:java -Dexec.mainClass="io.github.feroult.dataflow.TrafficFlow" \
     -e -Dexec.args="--project=traffic-flow-app --sinkProject=traffic-flow-app  \
                     --stagingLocation=gs://traffic-flow-app --runner=DataflowPipelineRunner \
                     --streaming=true --numWorkers=3 --zone=us-east1-c"
~~~

### Misc

Event format:

~~~ javascript
{
    carId: 'xxx',
    routeId: 'yyy',
    timestamp: 000,
    position: (lat,lon),
    speed: 999
}
~~~
