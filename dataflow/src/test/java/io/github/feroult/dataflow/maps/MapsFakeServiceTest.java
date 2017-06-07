package io.github.feroult.dataflow.maps;

import org.junit.Ignore;
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
    @Ignore
    public void testStretches() {
        Road road = new Road("/data/bandeirantes.json", 100);

        assertEquals(100, road.getStretches().size());
    }

}
