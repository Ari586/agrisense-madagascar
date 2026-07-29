class Crop {
  final String id;
  final String name;
  final String malagasyName;
  final String description;
  final String category;
  final List<String> imagePaths;
  final String? imagePath;
  final String sowingMonth;
  final String harvestMonth;
  final double waterRequirement;
  final List<String> commonDiseases;
  final List<String> soilTypes;
  final double minTemperature;
  final double maxTemperature;

  Crop({
    required this.id,
    required this.name,
    required this.malagasyName,
    required this.description,
    required this.category,
    required this.imagePaths,
    this.imagePath,
    required this.sowingMonth,
    required this.harvestMonth,
    required this.waterRequirement,
    required this.commonDiseases,
    required this.soilTypes,
    required this.minTemperature,
    required this.maxTemperature,
  });

  factory Crop.fromJson(Map<String, dynamic> json) {
    return Crop(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      malagasyName: json['malagasyName'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? '',
      imagePaths: List<String>.from(json['imagePaths'] as List? ?? []),
      imagePath: json['imagePath'] as String?,
      sowingMonth: json['sowingMonth'] as String? ?? '',
      harvestMonth: json['harvestMonth'] as String? ?? '',
      waterRequirement: (json['waterRequirement'] as num?)?.toDouble() ?? 0.0,
      commonDiseases: List<String>.from(json['commonDiseases'] as List? ?? []),
      soilTypes: List<String>.from(json['soilTypes'] as List? ?? []),
      minTemperature: (json['minTemperature'] as num?)?.toDouble() ?? 0.0,
      maxTemperature: (json['maxTemperature'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'malagasyName': malagasyName,
      'description': description,
      'category': category,
      'imagePaths': imagePaths,
      'imagePath': imagePath,
      'sowingMonth': sowingMonth,
      'harvestMonth': harvestMonth,
      'waterRequirement': waterRequirement,
      'commonDiseases': commonDiseases,
      'soilTypes': soilTypes,
      'minTemperature': minTemperature,
      'maxTemperature': maxTemperature,
    };
  }
}
