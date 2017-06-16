package io.github.feroult.trafficflow;

import com.google.api.services.bigquery.model.TableRow;
import io.github.feroult.trafficflow.fns.*;
import io.github.feroult.trafficflow.maps.Stretch;
import io.github.feroult.trafficflow.models.Event;
import io.github.feroult.trafficflow.models.SchemaFor;
import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.coders.AvroCoder;
import org.apache.beam.sdk.coders.CoderRegistry;
import org.apache.beam.sdk.coders.SerializableCoder;
import org.apache.beam.sdk.io.gcp.bigquery.BigQueryIO;
import org.apache.beam.sdk.io.gcp.bigquery.TableDestination;
import org.apache.beam.sdk.io.gcp.bigquery.TableRowJsonCoder;
import org.apache.beam.sdk.io.gcp.pubsub.PubsubIO;
import org.apache.beam.sdk.options.PipelineOptionsFactory;
import org.apache.beam.sdk.transforms.Combine;
import org.apache.beam.sdk.transforms.Count;
import org.apache.beam.sdk.transforms.Distinct;
import org.apache.beam.sdk.transforms.ParDo;
import org.apache.beam.sdk.transforms.windowing.*;
import org.apache.beam.sdk.values.KV;
import org.apache.beam.sdk.values.PCollection;
import org.joda.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TrafficFlowPipeline {
    private static final Logger LOG = LoggerFactory.getLogger(TrafficFlowPipeline.class);

    public static void main(String[] args) {
        CustomPipelineOptions options =
                PipelineOptionsFactory.fromArgs(args).withValidation().as(CustomPipelineOptions.class);

        Pipeline pipeline = createPipeline(options);

        PCollection<Event> events = createInput(pipeline, options);

        createVehicleFeed(events, options);
        createRoadFeed(events, options);
        createStretchFeed(events, options);
        createBackupFeed(events, options);

        pipeline.run();
    }

    private static Pipeline createPipeline(CustomPipelineOptions options) {
        Pipeline p = Pipeline.create(options);
        CoderRegistry registry = p.getCoderRegistry();
        registry.registerCoderProvider(AvroCoder.getCoderProvider());
        registry.registerCoderForClass(TableDestination.class, SerializableCoder.of(TableDestination.class));
        registry.registerCoderForClass(TableRow.class, TableRowJsonCoder.of());
        return p;
    }

    private static void createBackupFeed(PCollection<Event> events, CustomPipelineOptions options) {
        events
                .apply("window (BigQuery)",
                        Window.into(FixedWindows.of(Duration.standardMinutes(1))))

                .apply("create table row", ParDo.of(new EventToTableRowFn()))
                .apply("write to BigQuery", BigQueryIO.writeTableRows()
                        .to(options.getBigQueryTable())
                        .withSchema(SchemaFor.event())
                        .withWriteDisposition(BigQueryIO.Write.WriteDisposition.WRITE_APPEND)
                        .withCreateDisposition(BigQueryIO.Write.CreateDisposition.CREATE_IF_NEEDED));

    }

    private static PCollection<Event> createInput(Pipeline pipeline, CustomPipelineOptions options) {
        return pipeline
                .apply("from PubSub", PubsubIO.readStrings().fromTopic(sourceTopic(options)))
                .apply("parse event", ParDo.of(new ParseEventFn()));
    }

    private static void createVehicleFeed(PCollection<Event> events, CustomPipelineOptions options) {
        events
                .apply("format vehicles", ParDo.of(new FormatVehiclesFn()))
                .apply("vehicles to PubSub", PubsubIO.writeStrings().to(sinkTopic(options)));
    }

    private static void createRoadFeed(PCollection<Event> events, CustomPipelineOptions options) {
        events
                .apply("vehicle id", ParDo.of(new ExtractVehicleIdFn()))

                .apply("window (road)", Window.<String>into(FixedWindows.of(Duration.standardDays(365)))
                        .triggering(AfterPane.elementCountAtLeast(1))
                        .withAllowedLateness(Duration.ZERO)
                        .accumulatingFiredPanes())

                .apply("remove duplicates", Distinct.create())
                .apply("trigger (road)", Window.<String>configure()
                        .triggering(Repeatedly.forever(AfterPane.elementCountAtLeast(1))))
                .apply("count vehicles", count())

                .apply("format road", ParDo.of(new FormatRoadFn()))
                .apply("road to PubSub", PubsubIO.writeStrings().to(sinkTopic(options)));
    }

    private static void createStretchFeed(PCollection<Event> events, CustomPipelineOptions options) {
        events
                .apply("mark stretches", ParDo.of(new MarkStretchesFn()))

                .apply("window (stretch)", Window.into(FixedWindows.of(Duration.standardMinutes(1))))
                .apply("trigger (stretch)", Window.<KV<Stretch, Event>>configure().triggering(
                        AfterWatermark.pastEndOfWindow()
                                .withEarlyFirings(AfterProcessingTime.pastFirstElementInPane()
                                        .plusDelayOf(Duration.standardSeconds(2)))
                                .withLateFirings(AfterPane.elementCountAtLeast(1)))
                        .accumulatingFiredPanes()
                        .withAllowedLateness(Duration.standardSeconds(30)))

                .apply("combine", Combine.perKey(new StretchCombineFn()))

                .apply("format stretches", ParDo.of(new FormatStretchInfoFn()))
                .apply("stretches to PubSub", PubsubIO.writeStrings().to(sinkTopic(options)));
    }

    private static String sourceTopic(CustomPipelineOptions options) {
        return String.format("projects/%s/topics/%s", options.getSourceProject(), options.getSourceTopic());
    }

    private static String sinkTopic(CustomPipelineOptions options) {
        return String.format("projects/%s/topics/%s", options.getSinkProject(), options.getSinkTopic());
    }

    private static Combine.Globally<String, Long> count() {
        return ((Combine.Globally<String, Long>) Count.<String>globally()).withoutDefaults();
    }

}
