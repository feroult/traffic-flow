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

public class TrafficFlowPipeline {
    private static final Logger LOG = LoggerFactory.getLogger(TrafficFlowPipeline.class);

    public static void main(String[] args) {
        CustomPipelineOptions options =
                PipelineOptionsFactory.fromArgs(args).withValidation().as(CustomPipelineOptions.class);

        Pipeline p = Pipeline.create(options);

        PCollection<TableRow> input = createInput(p, options);

        createVehicleFeed(input, options);
        createRoadFeed(input, options);
        createStretchFeed(input, options);

        p.run();
    }

    private static PCollection<TableRow> createInput(Pipeline p, CustomPipelineOptions options) {
        return p.apply(PubsubIO.Read.named("from PubSub")
                .topic(String.format("projects/%s/topics/%s", options.getSourceProject(), options.getSourceTopic()))
                .timestampLabel("ts")
                .withCoder(TableRowJsonCoder.of()));
    }

    private static void createVehicleFeed(PCollection<TableRow> input, CustomPipelineOptions options) {
        input.apply("format vehicles info", MapElements.via(new FormatVehiclesInfo()))
                .apply(PubsubIO.Write.named("vehicles info to PubSub")
                        .topic(String.format("projects/%s/topics/%s", options.getSinkProject(), options.getSinkTopic()))
                        .withCoder(TableRowJsonCoder.of()));
    }

    private static void createRoadFeed(PCollection<TableRow> input, CustomPipelineOptions options) {
        input
                .apply("window (road)", Window.into(FixedWindows.of(Duration.standardDays(365))))
                .apply("trigger (road)", Window.<TableRow>triggering(
                        AfterWatermark.pastEndOfWindow()
                                .withEarlyFirings(AfterProcessingTime.pastFirstElementInPane()
                                        .plusDelayOf(Duration.standardSeconds(10)))
                                .withLateFirings(AfterPane.elementCountAtLeast(1)))
                        .accumulatingFiredPanes()
                        .withAllowedLateness(Duration.ZERO))

                .apply("vehicle id", MapElements.via(new ExtractVehicleId()))
                .apply("remove duplicates", RemoveDuplicates.create())
                .apply("count vehicles", Count.<String>globally().withoutDefaults())

                .apply("format road", MapElements.via(new FormatRoadInfo()))
                .apply(PubsubIO.Write.named("road to PubSub")
                        .topic(String.format("projects/%s/topics/%s", options.getSinkProject(), options.getSinkTopic()))
                        .withCoder(TableRowJsonCoder.of()));
    }

    private static void createStretchFeed(PCollection<TableRow> input, CustomPipelineOptions options) {
        input
                .apply("mark stretches", MapElements.via(new MarkStretches()))

                .apply("window (stretch)", Window.into(FixedWindows.of(Duration.standardMinutes(1))))
                .apply("trigger (stretch)", Window.<KV<Stretch, TableRow>>triggering(
                        AfterWatermark.pastEndOfWindow()
                                .withEarlyFirings(AfterProcessingTime.pastFirstElementInPane()
                                        .plusDelayOf(Duration.standardSeconds(2)))
                                .withLateFirings(AfterPane.elementCountAtLeast(1)))
                        .accumulatingFiredPanes()
                        .withAllowedLateness(Duration.standardSeconds(30)))

                .apply("combine", Combine.perKey(new StretchCombine()))
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

    private static class StretchCombine extends Combine.CombineFn<TableRow, StretchInfo, TableRow> {
        @Override
        public StretchInfo createAccumulator() {
            return new StretchInfo();
        }

        @Override
        public StretchInfo addInput(StretchInfo info, TableRow row) {
            info.add(row);
            return info;
        }

        @Override
        public StretchInfo mergeAccumulators(Iterable<StretchInfo> it) {
            StretchInfo merged = new StretchInfo();
            for (StretchInfo info : it) {
                merged.add(info);
            }
            return merged;
        }

        @Override
        public TableRow extractOutput(StretchInfo info) {
            return info.format();
        }
    }

}
