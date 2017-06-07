package io.github.feroult.dataflow.maps;

public class Stretch {

    private int index;

    private LatLng from;

    private LatLng to;

    public Stretch(int index, LatLng from, LatLng to) {
        this.index = index;
        this.from = from;
        this.to = to;
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

}
