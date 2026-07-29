import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  late SharedPreferences _prefs;

  factory StorageService() {
    return _instance;
  }

  StorageService._internal();

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // User Data
  Future<void> saveUserData(Map<String, dynamic> data) async {
    await _prefs.setString('user_data', jsonEncode(data));
  }

  Map<String, dynamic>? getUserData() {
    final json = _prefs.getString('user_data');
    if (json != null) {
      return jsonDecode(json);
    }
    return null;
  }

  // Saved Fields
  Future<void> saveFields(List<Map<String, dynamic>> fields) async {
    await _prefs.setString('saved_fields', jsonEncode(fields));
  }

  List<Map<String, dynamic>> getFields() {
    final json = _prefs.getString('saved_fields');
    if (json != null) {
      final list = jsonDecode(json) as List;
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }

  // Preferences
  Future<void> setSetting(String key, dynamic value) async {
    if (value is String) {
      await _prefs.setString(key, value);
    } else if (value is int) {
      await _prefs.setInt(key, value);
    } else if (value is double) {
      await _prefs.setDouble(key, value);
    } else if (value is bool) {
      await _prefs.setBool(key, value);
    }
  }

  dynamic getSetting(String key, {dynamic defaultValue}) {
    return _prefs.get(key) ?? defaultValue;
  }

  // Clear
  Future<void> clear() async {
    await _prefs.clear();
  }
}
