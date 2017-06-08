package io.github.feroult.dataflow.maps;

import org.junit.Test;

import static org.junit.Assert.assertNull;

public class FakeMapServiceTest {

    @Test
    public void testLoad() {
        assertNull(FakeMapService.getStretchFor(0, 0));
    }
}
