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
import com.google.cloud.dataflow.sdk.transforms.*;
import com.google.cloud.dataflow.sdk.transforms.DoFn.RequiresWindowAccess;
import com.google.cloud.dataflow.sdk.transforms.windowing.*;
import com.google.cloud.dataflow.sdk.values.KV;
import com.google.cloud.dataflow.sdk.values.PCollection;
import io.github.feroult.dataflow.maps.FakeMapService;
import io.github.feroult.dataflow.maps.Stretch;
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
//        PCollection<TableRow> window24hours = create24hoursWindow(input);
//        PCollection<TableRow> window5minutes = create5minutesWindow(input);
//        createVehicleFeed(input, options);
//        createRoadCounter(window24hours, "24_HOURS", options);
//        createRoadCounter(window5minutes, "5_MINUTES", options);
        createStretchFeed(input, options);

        p.run();
    }

    private static PCollection<TableRow> createInput(Pipeline p, CustomPipelineOptions options) {
        return p.apply(PubsubIO.Read.named("from PubSub")
                .topic(String.format("projects/%s/topics/%s", options.getSourceProject(), options.getSourceTopic()))
                .timestampLabel("ts")
                .withCoder(TableRowJsonCoder.of()));
    }

    private static PCollection<TableRow> create24hoursWindow(PCollection<TableRow> input) {
        return input
                .apply("24 hours window", Window.<TableRow>into(FixedWindows.of(Duration.standardHours(24)))
                        .triggering(AfterPane.elementCountAtLeast(1))
                        .withAllowedLateness(Duration.ZERO)
                        .accumulatingFiredPanes());
    }

    private static PCollection<TableRow> create5minutesWindow(PCollection<TableRow> input) {
        return input
                .apply("5 minutes window", Window.<TableRow>into(FixedWindows.of(Duration.standardMinutes(5)))
                        .withAllowedLateness(Duration.ZERO));
//                        .triggering(AfterPane.elementCountAtLeast(1))
//                        .withAllowedLateness(Duration.ZERO)
//                        .accumulatingFiredPanes());
    }

    private static void createVehicleFeed(PCollection<TableRow> input, CustomPipelineOptions options) {
        input.apply("format vehicles info", MapElements.via(new FormatVehiclesInfo()))
                .apply(PubsubIO.Write.named("vehicles info to PubSub")
                        .topic(String.format("projects/%s/topics/%s", options.getSinkProject(), options.getSinkTopic()))
                        .withCoder(TableRowJsonCoder.of()));
    }

    private static void createRoadCounter(PCollection<TableRow> window, String type, CustomPipelineOptions options) {
        PCollection<Long> result = window
                .apply(String.format("vehicle id (%s)", type), MapElements.via(new ExtractVehicleId()))
                .apply(String.format("remove duplicates (%s)", type), RemoveDuplicates.create())
                .apply(String.format("repeat trigger (%s)", type), Window
                        .<String>triggering(Repeatedly.forever(AfterProcessingTime.pastFirstElementInPane()
                                .plusDelayOf(Duration.standardSeconds(2))))
                        .accumulatingFiredPanes())
                .apply(String.format("count vehicles (%s)", type), Count.<String>globally().withoutDefaults());

        result
                .apply(String.format("format road (%s)", type), MapElements.via(new FormatRoadInfo(type)))
                .apply(PubsubIO.Write.named(String.format("road to PubSub (%s)", type))
                        .topic(String.format("projects/%s/topics/%s", options.getSinkProject(), options.getSinkTopic()))
                        .withCoder(TableRowJsonCoder.of()));
    }

    private static void createStretchFeed(PCollection<TableRow> input, CustomPipelineOptions options) {
        input
                .apply("mark stretches", MapElements.via(new MarkStretches()))

                .apply("window", Window.into(FixedWindows.of(Duration.standardMinutes(5))))
                .apply("trigger", Window.<KV<Stretch, TableRow>>triggering(
                        AfterWatermark.pastEndOfWindow()
                                .withEarlyFirings(AfterProcessingTime.pastFirstElementInPane()
                                        .plusDelayOf(Duration.standardSeconds(5)))
                                .withLateFirings(AfterPane.elementCountAtLeast(1)))
                        .accumulatingFiredPanes()
                        .withAllowedLateness(Duration.standardSeconds(30)))

                .apply("statistics", Combine.perKey(new StretchCombine()))
                .apply("format stretch", ParDo.of(new FormatStretchInfoFn()))

                .apply(PubsubIO.Write.named(String.format("stretch to PubSub"))
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
        private String type;

        public FormatRoadInfo(String type) {
            this.type = type;
        }

        @Override
        public TableRow apply(Long count) {
            TableRow result = new TableRow();
            result.set("type", "ROAD_" + type);
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

    private static class MarkStretches extends SimpleFunction<TableRow, KV<Stretch, TableRow>> {
        @Override
        public KV<Stretch, TableRow> apply(TableRow row) {
            double lat = Double.parseDouble(row.get("lat").toString());
            double lng = Double.parseDouble(row.get("lng").toString());
            Stretch stretch = FakeMapService.getStretchFor(lat, lng);
            return KV.of(stretch, row);
        }
    }

    private static class FormatStretchInfoFn extends DoFn<KV<Stretch, TableRow>, TableRow> implements RequiresWindowAccess {
        @Override
        public void processElement(ProcessContext c) throws Exception {
            KV<Stretch, TableRow> stretchInfo = c.element();

            Stretch stretch = stretchInfo.getKey();
            TableRow row = stretchInfo.getValue();

            TableRow result = new TableRow();
            result.set("type", "STRETCH");
            result.set("maxTimestamp", c.window().maxTimestamp().toString());
            result.set("index", stretch.getIndex());
            result.set("fromLat", stretch.getFromLat());
            result.set("fromLng", stretch.getFromLng());
            result.set("toLat", stretch.getToLat());
            result.set("toLng", stretch.getToLng());
            result.set("path", stretch.getPathJson());

            result.set("eventsCount", row.get("eventsCount"));
            result.set("vehiclesCount", row.get("vehiclesCount"));
            result.set("avgSpeed", row.get("avgSpeed"));

            c.output(result);
        }
    }

    private static class StretchCombine extends Combine.CombineFn<TableRow, StretchStatistics, TableRow> {
        @Override
        public StretchStatistics createAccumulator() {
            return new StretchStatistics();
        }

        @Override
        public StretchStatistics addInput(StretchStatistics statistics, TableRow row) {
            statistics.add(row);
            return statistics;
        }

        @Override
        public StretchStatistics mergeAccumulators(Iterable<StretchStatistics> it) {
            StretchStatistics merged = new StretchStatistics();
            for (StretchStatistics statistics : it) {
                merged.add(statistics);
            }
            return merged;
        }

        @Override
        public TableRow extractOutput(StretchStatistics statistics) {
            return statistics.format();
        }
    }
}
