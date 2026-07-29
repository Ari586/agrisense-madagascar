import 'package:flutter/material.dart';
import '../models/sensor_data.dart';
import '../models/alert.dart';
import '../services/api_service.dart';
import 'dart:async';

class SensorProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  SensorData? _sensorData;
  List<Alert> _alerts = [];
  bool _isLoading = false;
  Timer? _refreshTimer;

  SensorData? get sensorData => _sensorData;
  List<Alert> get alerts => _alerts;
  bool get isLoading => _isLoading;

  SensorProvider() {
    _init();
  }

  Future<void> _init() async {
    await fetchData();
    
    // Refresh every minute
    _refreshTimer = Timer.periodic(const Duration(minutes: 1), (_) => fetchData());
  }

  Future<void> fetchData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final sensorData = await _apiService.fetchSensorData();
      final alerts = await _apiService.fetchAlerts();

      _sensorData = sensorData;
      _alerts = alerts;
    } catch (e) {
      debugPrint('Error fetching sensor data: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  void updateData(SensorData? sensorData, List<Alert> alerts) {
    _sensorData = sensorData;
    _alerts = alerts;
    notifyListeners();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }
}
