package io.github.feroult.dataflow.maps;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Road {

    private static final Logger LOG = LoggerFactory.getLogger(Road.class);

    private int totalStretches;

    private List<Segment> segments;

    private double roadLength;

    private List<Stretch> stretches;

    public Road(String filename, int totalStretches) {
        this.totalStretches = totalStretches;
        this.segments = loadSegments(filename);
        this.roadLength = this.segments.get(this.segments.size() - 1).getAccSum();
        this.stretches = createStretches();
    }

    public List<Segment> getSegments() {
        return segments;
    }

    public List<Stretch> getStretches() {
        return stretches;
    }

    private List<Segment> loadSegments(String filename) {
        List<Segment> result = new ArrayList<>();
        JsonElement jsonElement = new JsonParser().parse(readJson(filename));
        JsonArray segments = jsonElement.getAsJsonObject().get("points").getAsJsonArray();
        Segment previousSegment = null;

        for (JsonElement el : segments) {
            JsonObject object = el.getAsJsonObject();
            JsonArray point = object.get("point").getAsJsonArray();

            Segment segment = new Segment(
                    point.get(0).getAsDouble(), point.get(1).getAsDouble(), object.get("accSum").getAsDouble()
            );

            result.add(segment);
            if (previousSegment != null) {
                previousSegment.setNextSegment(segment);
            }
            previousSegment = segment;
        }

        return result;
    }

    private String readJson(String filename) {
        BufferedReader buffer = new BufferedReader(new InputStreamReader(Road.class.getResourceAsStream(filename)));
        String json = buffer.lines().collect(Collectors.joining("\n"));
        return json;
    }

    public Stretch getStretchFor(double lat, double lng) {
        double accSum = 0;

        for (Segment segment : segments) {
            if (!segment.containsPoint(lat, lng)) {
                accSum = segment.getAccSum();
            } else {
                accSum = segment.getAccSum() + segment.distanceFromStart(lat, lng);
                break;
            }
        }

        if (accSum == roadLength) {
            Segment last = segments.get(this.segments.size() - 1);
            if (last.distanceFromStart(lat, lng) > 0.00005) {
                return null;
            }
        }

        return this.stretches.get(computeStretchIndex(accSum));
    }

    private int computeStretchIndex(double accSum) {
        int stretchIndex = (int) Math.ceil(accSum / (this.roadLength / totalStretches));
        int adjustedIndex = (stretchIndex == 0 ? 1 : stretchIndex) - 1;
        return adjustedIndex >= totalStretches ? totalStretches - 1 : adjustedIndex;
    }

    private List<Stretch> createStretches() {
        List<Stretch> result = new ArrayList<>();

        double stretchLength = roadLength / totalStretches;

        int currentStretch = 1;
        List<LatLng> path = new ArrayList<>();

        for (Segment segment : segments) {
            if (currentStretch > totalStretches) {
                break;
            }

            path.add(segment.getLatLng());

            while (segment.getNextSegment().getAccSum() >= currentStretch * stretchLength) {
                LatLng to = segment.interpolate(currentStretch * stretchLength);
                path.add(to);
                result.add(new Stretch(currentStretch++, path));

                if (currentStretch > totalStretches) {
                    break;
                }

                path = new ArrayList<>(Arrays.asList(to));
            }
        }

        return result;
    }
}
