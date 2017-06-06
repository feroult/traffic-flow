package io.github.feroult.dataflow.maps;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class Road {

    private List<Segment> segments;

    private final double roadLength;

    public Road(String filename) {
        this.segments = loadSegments(filename);
        this.roadLength = this.segments.get(this.segments.size() - 1).getAccSum();
    }

    public List<Segment> getSegments() {
        return segments;
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
        try {
            return new String(Files.readAllBytes(Paths.get(Road.class.getResource(filename).toURI())));
        } catch (IOException | URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    public int getClusterFor(double lat, double lng, int totalClusters) {
        double accSum = 0;

        for (Segment segment : segments) {
            if (!segment.containsPoint(lat, lng)) {
                accSum = segment.getAccSum();
            } else {
                accSum = segment.getAccSum() + segment.distanceFromStart(lat, lng);
                break;
            }
        }

        if (accSum == this.roadLength) {
            Segment last = this.segments.get(this.segments.size() - 1);
            if (last.distanceFromStart(lat, lng) > 0.00005) {
                return -1;
            }
        }

        int cluster = (int) Math.ceil(accSum / (this.roadLength / totalClusters));
        return cluster == 0 ? 1 : cluster;
    }
}
