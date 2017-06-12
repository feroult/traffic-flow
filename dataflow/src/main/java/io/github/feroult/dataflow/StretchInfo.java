package io.github.feroult.dataflow;

import com.google.api.services.bigquery.model.TableRow;
import com.google.cloud.dataflow.sdk.coders.AvroCoder;
import com.google.cloud.dataflow.sdk.coders.DefaultCoder;

import java.util.HashSet;

@DefaultCoder(AvroCoder.class)
public class StretchInfo {

    private int count = 0;

    private double speedSum = 0.0;

    private HashSet<String> vehicleIds;

    public StretchInfo() {
        this.vehicleIds = new HashSet<>();
    }

    public void add(TableRow row) {
        count++;
        speedSum += Double.parseDouble(row.get("speed").toString());
        vehicleIds.add(row.get("vehicleId").toString());
    }

    public void add(StretchInfo info) {
        count += info.count;
        speedSum += info.speedSum;
        vehicleIds.addAll(info.vehicleIds);
    }

    public TableRow format() {
        TableRow row = new TableRow();
        row.set("eventsCount", count);
        row.set("vehiclesCount", vehicleIds.size());
        row.set("avgSpeed", (speedSum / count));
        return row;
    }
}
