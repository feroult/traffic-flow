/*
 * Copyright (C) 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

package io.github.feroult.dataflow;

import com.google.api.services.bigquery.model.TableRow;
import com.google.cloud.dataflow.sdk.Pipeline;
import com.google.cloud.dataflow.sdk.coders.TableRowJsonCoder;
import com.google.cloud.dataflow.sdk.io.PubsubIO;
import com.google.cloud.dataflow.sdk.options.PipelineOptionsFactory;
import com.google.cloud.dataflow.sdk.transforms.Count;
import com.google.cloud.dataflow.sdk.transforms.MapElements;
import com.google.cloud.dataflow.sdk.transforms.RemoveDuplicates;
import com.google.cloud.dataflow.sdk.transforms.SimpleFunction;
import com.google.cloud.dataflow.sdk.transforms.windowing.*;
import com.google.cloud.dataflow.sdk.values.KV;
import com.google.cloud.dataflow.sdk.values.PCollection;
import io.github.feroult.dataflow.utils.CustomPipelineOptions;
import org.joda.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Dataflow command-line options must be specified:
//   --project=<your project ID>
//   --sinkProject=<your project ID>
//   --stagingLocation=gs://<your staging bucket>
//   --runner=DataflowPipelineRunner
//   --streaming=true
//   --numWorkers=3
//   --zone=<your compute zone>
// You can launch the pipeline from the command line using:
// mvn exec:java -Dexec.mainClass="io.github.feroult.dataflow.TrafficFlow" -e -Dexec.args="<your arguments>"

@SuppressWarnings("serial")
public class TrafficFlow {
    private static final Logger LOG = LoggerFactory.getLogger(TrafficFlow.class);

    public static void main(String[] args) {
        CustomPipelineOptions options =
                PipelineOptionsFactory.fromArgs(args).withValidation().as(CustomPipelineOptions.class);

        Pipeline p = Pipeline.create(options);

        PCollection<TableRow> input = createInput(p, options);
        PCollection<TableRow> window24hours = createWindow24hours(input);

        createVehicleBranch(input, options);
        createSimulatuionBranch(window24hours, options);

        p.run();
    }

    private static PCollection<TableRow> createInput(Pipeline p, CustomPipelineOptions options) {
        return p.apply(PubsubIO.Read.named("from PubSub")
                .topic(String.format("projects/%s/topics/%s", options.getSourceProject(), options.getSourceTopic()))
                .timestampLabel("ts")
                .withCoder(TableRowJsonCoder.of()));
    }

    private static PCollection<TableRow> createWindow24hours(PCollection<TableRow> input) {
        return input
                .apply("24 hours window", Window.<TableRow>into(FixedWindows.of(Duration.standardHours(24)))
                        .triggering(AfterPane.elementCountAtLeast(1))
                        .withAllowedLateness(Duration.ZERO)
                        .accumulatingFiredPanes());
    }

    private static void createVehicleBranch(PCollection<TableRow> input, CustomPipelineOptions options) {
        input.apply("format vehicles info", MapElements.via(new FormatVehiclesInfo()))
                .apply(PubsubIO.Write.named("vehicles info to PubSub")
                        .topic(String.format("projects/%s/topics/%s", options.getSinkProject(), options.getSinkTopic()))
                        .withCoder(TableRowJsonCoder.of()));
    }

    private static void createSimulatuionBranch(PCollection<TableRow> window, CustomPipelineOptions options) {
        PCollection<Long> result = window
                .apply("extract vehicle id", MapElements.via(new ExtractVehicleId()))
                .apply("remove duplicates", RemoveDuplicates.create())
                .apply("trigger", Window
                        .<String>triggering(Repeatedly.forever(AfterProcessingTime.pastFirstElementInPane()
                                .plusDelayOf(Duration.standardSeconds(2))))
                        .accumulatingFiredPanes())
                .apply("count distinct vehicles", Count.<String>globally().withoutDefaults());

        result
                .apply("format road info", MapElements.via(new FormatRoadInfo()))
                .apply(PubsubIO.Write.named("road info to PubSub")
                        .topic(String.format("projects/%s/topics/%s", options.getSinkProject(), options.getSinkTopic()))
                        .withCoder(TableRowJsonCoder.of()));
    }

    private static class MarkEvents extends SimpleFunction<TableRow, KV<String, TableRow>> {
        @Override
        public KV<String, TableRow> apply(TableRow row) {
            String vehicleId = row.get("vehicleId").toString();
            return KV.of(vehicleId, row);
        }
    }

    private static class FormatVehiclesInfo extends SimpleFunction<TableRow, TableRow> {
        @Override
        public TableRow apply(TableRow event) {
            event.set("type", "VEHICLE");
            return event;
        }
    }

    private static class FormatRoadInfo extends SimpleFunction<Long, TableRow> {
        @Override
        public TableRow apply(Long count) {
            TableRow result = new TableRow();
            result.set("type", "ROAD");
            result.set("count", count);
            return result;
        }
    }

    private static class ExtractVehicleId extends SimpleFunction<TableRow, String> {
        @Override
        public String apply(TableRow event) {
            return event.get("vehicleId").toString();
        }
    }
}
