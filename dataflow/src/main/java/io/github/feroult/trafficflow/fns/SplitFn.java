package io.github.feroult.trafficflow.fns;

import org.apache.beam.sdk.transforms.DoFn;
import org.apache.beam.sdk.values.KV;

public class SplitFn extends DoFn<String, KV<String, Integer>> {

    @ProcessElement
    public void processElement(ProcessContext c) {
        String text = c.element();

        String[] words = text.split("\\s+");

        for (String word : words) {
            c.output(KV.of(word, 1));
        }
    }

}
