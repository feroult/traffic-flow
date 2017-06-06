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
        int cluster = road.getClusterFor(-23.01046, -47.0908, 100);
        assertEquals(3, cluster);
    }
}
