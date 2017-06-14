package io.github.feroult.trafficflow.maps;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class SegmentTest {

    @Test
    public void testDistance() {
        double x0 = -47.0908;
        double y0 = -23.01046;
        double x1 = -47.09337;
        double y1 = -23.00865;
        double x2 = -47.09216;
        double y2 = -23.00951;

        double distance = Segment.computeDistance(x1, y1, x2, y2, x0, y0);
        assertEquals(0.00165894544816712, distance, 0.00000000000000001);
    }

    @Test
    public void testDistancePointInSegment() {
        double x0 = -46.68018;
        double y0 = -23.51321;
        double x1 = -46.6806;
        double y1 = -23.51289;
        double x2 = -46.68018;
        double y2 = -23.51321;

        double distance = Segment.computeDistance(x1, y1, x2, y2, x0, y0);
        assertEquals(0.0, distance, 0.00000000000000001);
    }

}
