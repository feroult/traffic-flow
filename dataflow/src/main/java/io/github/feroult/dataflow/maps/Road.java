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

    public Road(String filename) {
        this.segments = loadPoints(filename);
    }

    public List<Segment> getSegments() {
        return segments;
    }

    private List<Segment> loadPoints(String filename) {
        List<Segment> result = new ArrayList<>();

        JsonElement jsonElement = new JsonParser().parse(readJson(filename));
        JsonArray segments = jsonElement.getAsJsonObject().get("points").getAsJsonArray();

        for (JsonElement el : segments) {
            JsonObject object = el.getAsJsonObject();
            JsonArray point = object.get("point").getAsJsonArray();

            Segment segment = new Segment(
                    point.get(0).getAsDouble(), point.get(1).getAsDouble(), object.get("accSum").getAsDouble()
            );

            result.add(segment);
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

}
