package io.github.feroult.dataflow.maps;

public class Segment {

    private LatLng latLng;

    private double accSum;
    private Segment nextSegment;

    public Segment(double lat, double lng, double accSum) {
        this.accSum = accSum;
        this.latLng = new LatLng(lat, lng);
    }

    public double getAccSum() {
        return accSum;
    }

    public double getLat() {
        return latLng.getLat();
    }

    public double getLng() {
        return latLng.getLng();
    }

    public void setNextSegment(Segment nextSegment) {
        this.nextSegment = nextSegment;
    }

    public Segment getNextSegment() {
        return nextSegment;
    }

    public boolean containsPoint(double lat, double lng) {
        if (this.nextSegment == null) {
            return false;
        }
        double x0 = lng;
        double y0 = lat;
        double x1 = getLng();
        double y1 = getLat();
        double x2 = this.nextSegment.getLng();
        double y2 = this.nextSegment.getLat();
        return computeDistance(x1, y1, x2, y2, x0, y0) < 0.00005; // 5 meters error
    }

    protected static double computeDistance(double x1, double y1, double x2, double y2, double x0, double y0) {
        double l2 = dist2(x1, y1, x2, y2);
        if (l2 == 0) return dist2(x0, y0, x1, y1);
        double t = ((x0 - x1) * (x2 - x1) + (y0 - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt(dist2(x0, y0, x1 + t * (x2 - x1), y1 + t * (y2 - y1)));
    }

    private static double dist2(double x1, double y1, double x2, double y2) {
        return sqr(x1 - x2) + sqr(y1 - y2);
    }

    private static double dist(double x1, double y1, double x2, double y2) {
        return Math.sqrt(dist2(x1, y1, x2, y2));
    }

    private static double sqr(double x) {
        return x * x;
    }

    public double distanceFromStart(double lat, double lng) {
        return dist(this.getLng(), this.getLat(), lng, lat);
    }

    public LatLng getLatLng() {
        return latLng;
    }

    public LatLng interpolate(double distanceInSegment) {
        double totalDist = dist(this.getLng(), this.getLat(), nextSegment.getLng(), nextSegment.getLat());
        double factor = distanceInSegment / totalDist;
        double lng = this.getLng() + factor * (nextSegment.getLng() - this.getLng());
        double lat = this.getLat() + factor * (nextSegment.getLat() - this.getLat());
        return new LatLng(lat, lng);
    }
}
