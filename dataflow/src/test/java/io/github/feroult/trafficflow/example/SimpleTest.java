package io.github.feroult.trafficflow.example;

import org.apache.beam.sdk.coders.StringUtf8Coder;
import org.apache.beam.sdk.testing.PAssert;
import org.apache.beam.sdk.testing.TestPipeline;
import org.apache.beam.sdk.transforms.Count;
import org.apache.beam.sdk.transforms.Create;
import org.apache.beam.sdk.values.KV;
import org.apache.beam.sdk.values.PCollection;
import org.junit.Rule;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;

public class SimpleTest {
    static final String[] WORDS_ARRAY = new String[]{
            "hi", "there", "hi", "hi", "sue", "bob",
            "hi", "sue", "", "", "ZOW", "bob", ""};

    static final List<String> WORDS = Arrays.asList(WORDS_ARRAY);

    @Rule
    public final TestPipeline p = TestPipeline.create();

    @Test
    public void testCount() {
        PCollection<String> input = p.apply(Create.of(WORDS)).setCoder(StringUtf8Coder.of());

        PCollection<KV<String, Long>> output = input.apply(Count.perElement());

        PAssert.that(output)
                .containsInAnyOrder(
                        KV.of("hi", 4L),
                        KV.of("there", 1L),
                        KV.of("sue", 2L),
                        KV.of("bob", 2L),
                        KV.of("", 3L),
                        KV.of("ZOW", 1L));

        p.run();
    }
}
