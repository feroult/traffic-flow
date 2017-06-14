package io.github.feroult.trafficflow.maps;

public class FakeMapService {

    private static Road bandeirantes = new Road("/data/bandeirantes.json", 100);

    public static Stretch getStretchFor(double lat, double lng) {
        return bandeirantes.getStretchFor(lat, lng);
    }

}
