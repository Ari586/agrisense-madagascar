import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/field.dart';

/// Provider that manages the user's saved fields (saha).
/// Persists data in SharedPreferences under key 'agrisense_myfields'.
class FieldProvider extends ChangeNotifier {
  static const _storageKey = 'agrisense_myfields';

  List<Field> _fields = [];
  bool _isLoaded = false;

  List<Field> get fields => List.unmodifiable(_fields);
  bool get isLoaded => _isLoaded;

  /// Load fields from local storage.
  Future<void> loadFields() async {
    final prefs = await SharedPreferences.getInstance();
    final json = prefs.getString(_storageKey);
    if (json != null) {
      try {
        final list = jsonDecode(json) as List;
        _fields = list
            .map((e) => Field.fromJson(e as Map<String, dynamic>))
            .toList();
      } catch (_) {
        _fields = [];
      }
    }
    _isLoaded = true;
    notifyListeners();
  }

  /// Save current fields to local storage.
  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    final json = jsonEncode(_fields.map((f) => f.toJson()).toList());
    await prefs.setString(_storageKey, json);
  }

  /// Add a new field and persist.
  Future<void> addField(Field field) async {
    _fields.add(field);
    notifyListeners();
    await _persist();
  }

  /// Remove a field by index and persist.
  Future<void> removeField(int index) async {
    if (index >= 0 && index < _fields.length) {
      _fields.removeAt(index);
      notifyListeners();
      await _persist();
    }
  }

  /// Clear all fields.
  Future<void> clearAll() async {
    _fields.clear();
    notifyListeners();
    await _persist();
  }
}
