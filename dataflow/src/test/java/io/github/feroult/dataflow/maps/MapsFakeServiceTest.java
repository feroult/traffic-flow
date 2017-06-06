package io.github.feroult.dataflow.maps;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class MapsFakeServiceTest {

    @Test
    public void testLoadRoad() {
        Road road = new Road("/data/bandeirantes.json");

        Segment secondSegment = road.getSegments().get(1);
        assertEquals(0.0012445882853358643, secondSegment.getAccSum(), 0.0000000000000000000001);
        assertEquals(-22.99881, secondSegment.getLat(), 0.0000000000000000000001);
        assertEquals(-47.10241, secondSegment.getLng(), 0.0000000000000000000001);

        Segment thirdSegment = secondSegment.getNextSegment();
        assertEquals(0.005034522321701405, thirdSegment.getAccSum(), 0.0000000000000000000001);
    }

    @Test
    public void testPointCluster() {
        Road road = new Road("/data/bandeirantes.json");

        assertEquals(1, road.getClusterFor(-22.99792, -47.10328, 100));
        assertEquals(3, road.getClusterFor(-23.01046, -47.0908, 100));
        assertEquals(100, road.getClusterFor(-23.51321, -46.68018, 100));

        assertEquals(-1, road.getClusterFor(-23.513407, -46.679968, 100));
        assertEquals(-1, road.getClusterFor(-23.488927, -46.687221, 100));
    }

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
