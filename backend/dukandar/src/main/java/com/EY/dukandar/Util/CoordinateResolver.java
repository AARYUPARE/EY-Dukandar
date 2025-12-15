package com.EY.dukandar.Util;

import java.util.Map;

public class CoordinateResolver {

    private static final Map<String, double[]> CITY_COORDINATES = Map.of(
            "pune", new double[]{18.5204, 73.8567},
            "mumbai", new double[]{19.0760, 72.8777},
            "delhi", new double[]{28.7041, 77.1025}
    );

    // Converts city name → coordinates
    public static double[] resolve(String cityName) {
        if (cityName == null) return null;
        return CITY_COORDINATES.get(cityName.toLowerCase());
    }
}
