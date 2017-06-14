package io.github.feroult.trafficflow.maps;

import org.apache.beam.sdk.coders.AvroCoder;
import org.apache.beam.sdk.coders.DefaultCoder;

import java.util.List;

@DefaultCoder(AvroCoder.class)
public class Stretch implements Comparable<Stretch> {

    private int index;

    private LatLng from;

    private LatLng to;

    private List<LatLng> path;

    public Stretch() {
    }

    public Stretch(int index, List<LatLng> path) {
        this.index = index;
        this.from = path.get(0);
        this.to = path.get(path.size() - 1);
        this.path = path;
    }

    public double getFromLat() {
        return from.getLat();
    }

    public double getFromLng() {
        return from.getLng();
    }

    public double getToLat() {
        return to.getLat();
    }

    public double getToLng() {
        return to.getLng();
    }

    public int getIndex() {
        return index;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Stretch stretch = (Stretch) o;
        return index == stretch.index;
    }

    @Override
    public int hashCode() {
        return index;
    }

    @Override
    public int compareTo(Stretch o) {
        return index - o.index;
    }

    public List<LatLng> getPath() {
        return path;
    }

    public String getPathJson() {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        sb.append("[");
        for (LatLng latLng : path) {
            if (!first) sb.append(",");
            else first = false;

            sb.append("{");
            sb.append("\"lat\":" + latLng.getLat() + ",");
            sb.append("\"lng\":" + latLng.getLng());
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }
}
