# Traffic Flow Demo

Traffic Flow Cloud Dataflow/Apache Beam demo.

### Config

Create a Google Cloud project. Enable PubSub, BigQuery and Cloud Dataflow APIs.

__Simulator__

1) Grab your __keyfile.json__ with PubSub publish permissions and put it in: __simulator/src__
2) Copy the file __simulator/src/config/config-template.js__ to __simulator/src/config/config.js__ and change the settings for your project.
3) Run the simulator server inside the __src__ folder: `./sim-server.js`

__Dataflow Pipeline__

1) Build: `./gradlew fatJar`
2) Publish the pipeline: customize and run `./deploy.sh`

__Visualizer__

1) Serve the folder `visualizer` using any webserver.
2) Open it in your browser.

### Contents

 * Simulator
 * Dataflow Pipeline
 * Map visualizer

### Credits

 * [Luan Nico](https://github.com/luanpotter)
 * [Matheus Martins](https://github.com/matheusmr13)
