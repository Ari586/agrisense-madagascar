/// Model representing a user's agricultural field (saha).
/// Stored locally via SharedPreferences.
class Field {
  final String name;
  final String cropKey;
  final String area; // in m²
  final String date; // ISO date string (YYYY-MM-DD)

  Field({
    required this.name,
    required this.cropKey,
    required this.area,
    required this.date,
  });

  factory Field.fromJson(Map<String, dynamic> json) {
    return Field(
      name: json['name'] as String? ?? '',
      cropKey: json['cropKey'] as String? ?? '',
      area: json['area'] as String? ?? '',
      date: json['date'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'cropKey': cropKey,
      'area': area,
      'date': date,
    };
  }
}
