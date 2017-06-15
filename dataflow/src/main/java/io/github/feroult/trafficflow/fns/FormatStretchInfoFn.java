package io.github.feroult.trafficflow.fns;

import com.google.gson.Gson;
import io.github.feroult.trafficflow.models.StretchAccumulator;
import io.github.feroult.trafficflow.maps.LatLng;
import io.github.feroult.trafficflow.maps.Stretch;
import org.apache.beam.sdk.transforms.DoFn;
import org.apache.beam.sdk.values.KV;

import java.util.List;

public class FormatStretchInfoFn extends DoFn<KV<Stretch, StretchAccumulator>, String> {

    private static Gson gson = new Gson();

    @ProcessElement
    public void processElement(ProcessContext c) {
        Stretch stretch = c.element().getKey();
        StretchAccumulator acc = c.element().getValue();

        StretchInfo info = new StretchInfo();

        info.setIndex(stretch.getIndex());
        info.setFromLat(stretch.getFromLat());
        info.setFromLng(stretch.getFromLng());
        info.setToLat(stretch.getToLat());
        info.setToLng(stretch.getToLng());
        info.setPath(stretch.getPath());

        info.setEventsCount(acc.getEventsCount());
        info.setVehiclesCount(acc.getVehiclesCount());
        info.setAvgSpeed(acc.getAvgSpeed());

        c.output(gson.toJson(info));
    }

    public class StretchInfo {

        private String type = "STRETCH";

        private Integer index;

        private Double fromLat;

        private Double fromLng;

        private Double toLat;

        private Double toLng;

        private List<LatLng> path;

        private Integer eventsCount;

        private Integer vehiclesCount;

        private Double avgSpeed;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Integer getIndex() {
            return index;
        }

        public void setIndex(Integer index) {
            this.index = index;
        }

        public Double getFromLat() {
            return fromLat;
        }

        public void setFromLat(Double fromLat) {
            this.fromLat = fromLat;
        }

        public Double getFromLng() {
            return fromLng;
        }

        public void setFromLng(Double fromLng) {
            this.fromLng = fromLng;
        }

        public Double getToLat() {
            return toLat;
        }

        public void setToLat(Double toLat) {
            this.toLat = toLat;
        }

        public Double getToLng() {
            return toLng;
        }

        public void setToLng(Double toLng) {
            this.toLng = toLng;
        }

        public List<LatLng> getPath() {
            return path;
        }

        public void setPath(List<LatLng> path) {
            this.path = path;
        }

        public Integer getEventsCount() {
            return eventsCount;
        }

        public void setEventsCount(Integer eventsCount) {
            this.eventsCount = eventsCount;
        }

        public Integer getVehiclesCount() {
            return vehiclesCount;
        }

        public void setVehiclesCount(Integer vehiclesCount) {
            this.vehiclesCount = vehiclesCount;
        }

        public Double getAvgSpeed() {
            return avgSpeed;
        }

        public void setAvgSpeed(Double avgSpeed) {
            this.avgSpeed = avgSpeed;
        }
    }
}
