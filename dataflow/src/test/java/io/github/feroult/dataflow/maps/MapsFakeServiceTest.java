package io.github.feroult.dataflow.maps;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class MapsFakeServiceTest {

    @Test
    public void testLoadRoad() {
        Road road = new Road("/data/bandeirantes.json", 100);

        Segment secondSegment = road.getSegments().get(1);
        assertEquals(0.0012445882853358643, secondSegment.getAccSum(), 0.0000000000000000000001);
        assertEquals(-22.99881, secondSegment.getLat(), 0.0000000000000000000001);
        assertEquals(-47.10241, secondSegment.getLng(), 0.0000000000000000000001);

        Segment thirdSegment = secondSegment.getNextSegment();
        assertEquals(0.005034522321701405, thirdSegment.getAccSum(), 0.0000000000000000000001);
    }

    @Test
    public void testPointCluster() {
        Road road = new Road("/data/bandeirantes.json", 100);

        assertEquals(1, road.getClusterFor(-22.99792, -47.10328));
        assertEquals(3, road.getClusterFor(-23.01046, -47.0908));
        assertEquals(100, road.getClusterFor(-23.51321, -46.68018));

        assertEquals(-1, road.getClusterFor(-23.513407, -46.679968));
        assertEquals(-1, road.getClusterFor(-23.488927, -46.687221));
    }

    @Test
    public void testStretches() {
        Road road = new Road("/data/bandeirantes.json", 100);
        assertEquals(100, road.getStretches().size());

        assertEquals(-22.99792, road.getStretches().get(0).getFromLat(), 0);
        assertEquals(-47.10328, road.getStretches().get(0).getFromLng(), 0);
        assertEquals(-23.00332207196766, road.getStretches().get(0).getToLat(), 0);
        assertEquals(-47.09862728689276, road.getStretches().get(0).getToLng(), 0);

        assertEquals(-23.04395398077555, road.getStretches().get(9).getFromLat(), 0);
        assertEquals(-47.06040581076131, road.getStretches().get(9).getFromLng(), 0);
        assertEquals(-23.048448961107116, road.getStretches().get(9).getToLat(), 0);
        assertEquals(-47.05486813052743, road.getStretches().get(9).getToLng(), 0);

    }

}
