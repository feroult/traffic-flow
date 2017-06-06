package io.github.feroult.dataflow.maps;

import org.junit.Assert;
import org.junit.Test;

public class MapInfoTest {

    @Test
    public void testLoadRoad() {
        RoadInfo road = new RoadInfo("/data/bandeirantes.json");
        Assert.assertTrue(road.getSegments().size() > 0);
        Segment secondSegment = road.getSegments().get(1);
        Assert.assertEquals(0.0012445882853358643, secondSegment.getAccSum(), 0.0000000000000000000001);
        Assert.assertEquals(-22.99881, secondSegment.getLat(), 0.0000000000000000000001);
        Assert.assertEquals(-47.10241, secondSegment.getLng(), 0.0000000000000000000001);
    }
}
