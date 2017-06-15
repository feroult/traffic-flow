package io.github.feroult.trafficflow.fns;

import io.github.feroult.trafficflow.models.Event;
import io.github.feroult.trafficflow.models.StretchAccumulator;
import org.apache.beam.sdk.transforms.Combine;

public class StretchCombineFn extends Combine.CombineFn<Event, StretchAccumulator, StretchAccumulator> {
    @Override
    public StretchAccumulator createAccumulator() {
        return new StretchAccumulator();
    }

    @Override
    public StretchAccumulator addInput(StretchAccumulator info, Event event) {
        info.add(event);
        return info;
    }

    @Override
    public StretchAccumulator mergeAccumulators(Iterable<StretchAccumulator> it) {
        StretchAccumulator merged = new StretchAccumulator();
        for (StretchAccumulator acc : it) {
            merged.add(acc);
        }
        return merged;
    }

    @Override
    public StretchAccumulator extractOutput(StretchAccumulator acc) {
        return acc;
    }
}
