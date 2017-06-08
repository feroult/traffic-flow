package io.github.feroult.dataflow.maps;

import com.google.cloud.dataflow.sdk.coders.AvroCoder;
import com.google.cloud.dataflow.sdk.coders.DefaultCoder;

@DefaultCoder(AvroCoder.class)
public class Stretch implements Comparable<Stretch> {

    private int index;

    private LatLng from;

    private LatLng to;

    public Stretch() {
    }

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

}
