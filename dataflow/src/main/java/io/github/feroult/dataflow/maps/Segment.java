package io.github.feroult.dataflow.maps;

public class Segment {

    private double lat;
    private double lng;

    private double accSum;

    public Segment(double lat, double lng, double accSum) {
        this.accSum = accSum;
        this.lat = lat;
        this.lng = lng;
    }

    public double getAccSum() {
        return accSum;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }
}
