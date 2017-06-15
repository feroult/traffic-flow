package io.github.feroult.trafficflow.fns;

import com.google.gson.Gson;
import io.github.feroult.trafficflow.models.Event;
import org.apache.beam.sdk.transforms.DoFn;

public class ExtractVehicleIdFn extends DoFn<Event, String> {

    private static Gson gson = new Gson();

    @ProcessElement
    public void processElement(ProcessContext c) {
        Event event = c.element();
        c.output(event.getVehicleId());
    }

}
