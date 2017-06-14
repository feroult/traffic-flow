package io.github.feroult.trafficflow.maps;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class FakeMapServiceTest {

    @Test
    public void testLoad() {
        assertEquals(1, FakeMapService.getStretchFor(-22.99792, -47.10328).getIndex());
    }
}
