enum AlertSeverity { critical, warning, info }

class Alert {
  final String id;
  final String type;
  final AlertSeverity severity;
  final String title;
  final String message;
  final String region;
  final DateTime time;

  Alert({
    required this.id,
    required this.type,
    required this.severity,
    required this.title,
    required this.message,
    required this.region,
    required this.time,
  });

  factory Alert.fromJson(Map<String, dynamic> json) {
    return Alert(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? '',
      severity: _parseSeverity(json['severity'] as String?),
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      region: json['region'] as String? ?? '',
      time: DateTime.tryParse(json['time'] as String? ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'severity': severity.name,
      'title': title,
      'message': message,
      'region': region,
      'time': time.toIso8601String(),
    };
  }

  static AlertSeverity _parseSeverity(String? value) {
    switch (value?.toLowerCase()) {
      case 'critical':
        return AlertSeverity.critical;
      case 'warning':
        return AlertSeverity.warning;
      default:
        return AlertSeverity.info;
    }
  }
}
