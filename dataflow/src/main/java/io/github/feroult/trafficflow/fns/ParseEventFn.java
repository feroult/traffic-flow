package io.github.feroult.trafficflow.fns;

import com.google.gson.Gson;
import io.github.feroult.trafficflow.model.Event;
import io.github.feroult.trafficflow.TrafficFlowPipeline;
import org.apache.beam.sdk.transforms.DoFn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ParseEventFn extends DoFn<String, Event> {

    private static final Logger LOG = LoggerFactory.getLogger(TrafficFlowPipeline.class);

    private static Gson gson = new Gson();

    @ProcessElement
    public void processElement(ProcessContext c) {
        String json = c.element();
        Event output = gson.fromJson(json, Event.class);
        LOG.info("parse" + json + output);
        c.output(output);
    }

}
