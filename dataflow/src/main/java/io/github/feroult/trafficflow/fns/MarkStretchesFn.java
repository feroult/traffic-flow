package io.github.feroult.trafficflow.fns;

import com.google.gson.Gson;
import io.github.feroult.trafficflow.models.Event;
import io.github.feroult.trafficflow.maps.FakeMapService;
import io.github.feroult.trafficflow.maps.Stretch;
import org.apache.beam.sdk.transforms.DoFn;
import org.apache.beam.sdk.values.KV;

public class MarkStretchesFn extends DoFn<Event, KV<Stretch, Event>> {

    private static Gson gson = new Gson();

    @ProcessElement
    public void processElement(ProcessContext c) {
        Event event = c.element();
        Stretch stretch = FakeMapService.getStretchFor(event.getLat(), event.getLng());
        c.output(KV.of(stretch, event));
    }

}
