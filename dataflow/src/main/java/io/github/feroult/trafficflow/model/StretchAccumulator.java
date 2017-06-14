package io.github.feroult.trafficflow.model;

import org.apache.beam.sdk.coders.AvroCoder;
import org.apache.beam.sdk.coders.DefaultCoder;

import java.util.HashSet;

@DefaultCoder(AvroCoder.class)
public class StretchAccumulator {

    private int count = 0;

    private double speedSum = 0.0;

    private HashSet<String> vehicleIds;

    public StretchAccumulator() {
        this.vehicleIds = new HashSet<>();
    }

    public void add(Event event) {
        count++;
        speedSum += event.getSpeed();
        vehicleIds.add(event.getVehicleId());
    }

    public void add(StretchAccumulator info) {
        count += info.count;
        speedSum += info.speedSum;
        vehicleIds.addAll(info.vehicleIds);
    }

    public Integer getEventsCount() {
        return count;
    }

    public Integer getVehiclesCount() {
        return vehicleIds.size();
    }

    public Double getAvgSpeed() {
        return (speedSum / count);
    }
}
