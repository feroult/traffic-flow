package io.github.feroult.trafficflow.fns;

import com.google.gson.Gson;
import org.apache.beam.sdk.transforms.DoFn;

public class FormatRoadFn extends DoFn<Long, String> {

    private static Gson gson = new Gson();

    @ProcessElement
    public void processElement(ProcessContext c) {
        Long count = c.element();
        RoadInfo info = new RoadInfo(c.element());
        c.output(gson.toJson(info));
    }

    private class RoadInfo {
        String type = "ROAD";

        Long count;

        public RoadInfo(Long count) {
            this.count = count;
        }
    }
}
