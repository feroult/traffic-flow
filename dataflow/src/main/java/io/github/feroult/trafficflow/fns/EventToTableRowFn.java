package io.github.feroult.trafficflow.fns;

import com.google.api.services.bigquery.model.TableRow;
import io.github.feroult.trafficflow.models.Event;
import org.apache.beam.sdk.transforms.DoFn;

public class EventToTableRowFn extends DoFn<Event, TableRow> {

    private String topic;

    @ProcessElement
    public void processElement(ProcessContext c) throws Exception {
        Event event = c.element();

        TableRow row = new TableRow();
        row.set("simulationId", event.getSimulationId());
        row.set("vehicleId", event.getVehicleId());
        row.set("timestamp", event.getTimestamp() / 1000);
        row.set("speed", event.getSpeed());
        row.set("lat", event.getLat());
        row.set("lng", event.getLng());

        c.output(row);
    }

}
