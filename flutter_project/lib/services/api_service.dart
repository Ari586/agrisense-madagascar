import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/sensor_data.dart';
import '../models/alert.dart';

class ApiService {
  final http.Client _client = http.Client();

  // Sensors
  Future<SensorData?> fetchSensorData() async {
    try {
      final response = await _client.get(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.sensorEndpoint}'),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return SensorData.fromJson(json);
      }
    } catch (e) {
      print('Error fetching sensor data: $e');
    }
    return null;
  }

  // Alerts
  Future<List<Alert>> fetchAlerts() async {
    try {
      final response = await _client.get(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.alertsEndpoint}'),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        final alerts = (json['alerts'] as List?)?.map(
          (e) => Alert.fromJson(e as Map<String, dynamic>),
        ).toList() ?? [];
        return alerts;
      }
    } catch (e) {
      print('Error fetching alerts: $e');
    }
    return [];
  }

  // Weather
  Future<Map<String, dynamic>?> fetchWeather(double lat, double lon) async {
    try {
      final response = await _client.get(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.weatherEndpoint}?lat=$lat&lon=$lon'),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Error fetching weather: $e');
    }
    return null;
  }

  // Market Prices
  Future<List<dynamic>> fetchMarketPrices() async {
    try {
      final response = await _client.get(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.marketEndpoint}'),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return json['data'] ?? [];
      }
    } catch (e) {
      print('Error fetching market prices: $e');
    }
    return [];
  }

  // AI Diagnosis
  Future<Map<String, dynamic>?> diagnoseCrop(String imagePath) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.diagnosisEndpoint}'),
      );
      request.files.add(await http.MultipartFile.fromPath('image', imagePath));

      final response = await request.send();

      if (response.statusCode == 200) {
        final json = jsonDecode(await response.stream.bytesToString());
        return json;
      }
    } catch (e) {
      print('Error diagnosing crop: $e');
    }
    return null;
  }

  // Chat with Gemini
  Future<String> chatWithAI(String message) async {
    try {
      final response = await _client.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.chatEndpoint}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': message}),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return json['response'] ?? '';
      }
    } catch (e) {
      print('Error chatting with AI: $e');
    }
    return '';
  }

  // Text-to-Speech
  Future<String?> synthesizeText(String text, String language) async {
    try {
      final response = await _client.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.ttsEndpoint}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'text': text, 'language': language}),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return json['audioUrl'];
      }
    } catch (e) {
      print('Error synthesizing text: $e');
    }
    return null;
  }
}
