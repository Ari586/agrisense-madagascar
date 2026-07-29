class ApiConstants {
  static const String baseUrl = 'http://localhost:3000';
  static const String apiPath = '/api';
  
  // Endpoints
  static const String sensorEndpoint = '$apiPath/sensors';
  static const String alertsEndpoint = '$apiPath/alerts';
  static const String weatherEndpoint = '$apiPath/weather/live';
  static const String marketEndpoint = '$apiPath/market/prices';
  static const String diagnosisEndpoint = '$apiPath/diagnose';
  static const String chatEndpoint = '$apiPath/chat';
  static const String ttsEndpoint = '$apiPath/tts';
  
  // External APIs
  static const String openMeteoUrl = 'https://api.open-meteo.com/v1/forecast';
  static const String geoJsonUrl = 'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/MDG/ADM1/geoBoundaries-MDG-ADM1_simplified.geojson';
}

class AppConstants {
  static const String appName = 'Fambolena eto Madagasikara';
  static const String appVersion = '1.0.0';
  
  // Localization
  static const String defaultLanguage = 'mg'; // Malagasy
  
  // Duration
  static const Duration sensorRefreshDuration = Duration(minutes: 1);
  static const Duration weatherRefreshDuration = Duration(hours: 1);
  
  // Sizes
  static const double borderRadius = 12.0;
  static const double padding = 16.0;
}

class RegionConstants {
  static final Map<String, RegionData> regions = {
    'Diana': RegionData(
      id: 'Diana',
      name: 'Diana',
      lat: -12.27,
      lng: 49.29,
      weatherType: 'hot_windy',
    ),
    'Sava': RegionData(
      id: 'Sava',
      name: 'Sava',
      lat: -14.26,
      lng: 50.16,
      weatherType: 'humid_rain',
    ),
    // Add more regions...
  };
}

class RegionData {
  final String id;
  final String name;
  final double lat;
  final double lng;
  final String weatherType;

  RegionData({
    required this.id,
    required this.name,
    required this.lat,
    required this.lng,
    required this.weatherType,
  });
}
