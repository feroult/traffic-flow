package io.github.feroult.dataflow.maps;

public class FakeMapService {

    private static Road bandeirantes = new Road("/data/bandeirantes.json", 200);

    public static Stretch getStretchFor(double lat, double lng) {
        return bandeirantes.getStretchFor(lat, lng);
    }

}
