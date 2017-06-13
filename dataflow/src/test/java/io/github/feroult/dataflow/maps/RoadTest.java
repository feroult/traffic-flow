package io.github.feroult.dataflow.maps;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class RoadTest {

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

        assertEquals(-23.51018836255811, road.getStretches().get(99).getFromLat(), 0);
        assertEquals(-46.68649644278096, road.getStretches().get(99).getFromLng(), 0);
        assertEquals(-23.51321, road.getStretches().get(99).getToLat(), 0);
        assertEquals(-46.68018, road.getStretches().get(99).getToLng(), 0);
    }

    @Test
    public void testStretchPath() {
        Road road = new Road("/data/bandeirantes.json", 100);

        Stretch stretch = road.getStretches().get(0);
        assertEquals(4, stretch.getPath().size());
        assertEquals("[{\"lat\":-22.99792,\"lng\":-47.10328},{\"lat\":-22.99881,\"lng\":-47.10241},{\"lat\":-23.00171,\"lng\":-47.09997},{\"lat\":-23.00332207196766,\"lng\":-47.09862728689276}]", stretch.getPathJson());

        assertEquals(-22.99792, stretch.getPath().get(0).getLat(), 0);
        assertEquals(-47.10328, stretch.getPath().get(0).getLng(), 0);

        assertEquals(-22.99881, stretch.getPath().get(1).getLat(), 0);
        assertEquals(-47.10241, stretch.getPath().get(1).getLng(), 0);

        assertEquals(-23.00171, stretch.getPath().get(2).getLat(), 0);
        assertEquals(-47.09997, stretch.getPath().get(2).getLng(), 0);

        assertEquals(-23.00332207196766, stretch.getPath().get(3).getLat(), 0);
        assertEquals(-47.09862728689276, stretch.getPath().get(3).getLng(), 0);
    }

    @Test
    public void testPointStretch() {
        Road road = new Road("/data/bandeirantes.json", 100);

        assertEquals(1, road.getStretchFor(-22.99792, -47.10328).getIndex());
        assertEquals(3, road.getStretchFor(-23.01046, -47.0908).getIndex());
        assertEquals(100, road.getStretchFor(-23.51321, -46.68018).getIndex());

        assertEquals(100, road.getStretchFor(-23.513407, -46.679968).getIndex());
        assertEquals(100, road.getStretchFor(-23.488927, -46.687221).getIndex());
    }

}
