import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:async';

class WeatherProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? _weatherData;
  bool _isLoading = false;
  Timer? _refreshTimer;
  String _activeRegion = 'Vakinankaratra';

  Map<String, dynamic>? get weatherData => _weatherData;
  bool get isLoading => _isLoading;
  String get activeRegion => _activeRegion;

  WeatherProvider() {
    _init();
  }

  Future<void> _init() async {
    await fetchWeather(-19.86, 47.03); // Default: Vakinankaratra
    
    // Refresh every hour
    _refreshTimer = Timer.periodic(const Duration(hours: 1), (_) => fetchWeather(-19.86, 47.03));
  }

  Future<void> fetchWeather(double lat, double lon) async {
    _isLoading = true;
    notifyListeners();

    try {
      final weatherData = await _apiService.fetchWeather(lat, lon);
      _weatherData = weatherData;
    } catch (e) {
      debugPrint('Error fetching weather: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  void setActiveRegion(String region, double lat, double lon) {
    _activeRegion = region;
    fetchWeather(lat, lon);
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }
}
