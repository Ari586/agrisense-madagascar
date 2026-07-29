import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../data/crops_data.dart';
import '../models/field.dart';
import '../providers/field_provider.dart';
import '../screens/crop_detail_screen.dart';

/// Full implementation of the Sahako tab.
/// Includes:
/// - Mobile / Desktop responsive layout
/// - Field management ("Ny Sahako") with progress bars & status
/// - Crop Guide ("Torolàlana Voly") with Search, Category filters, and Region recommendations
/// - High-contrast, crystal-clear typography & modern dark UI
class SahakoTab extends StatefulWidget {
  const SahakoTab({super.key});

  @override
  State<SahakoTab> createState() => _SahakoTabState();
}

class _SahakoTabState extends State<SahakoTab> {
  // Navigation & Search States
  int _activeSubTab = 1; // 0 = Ny Sahako, 1 = Torolàlana Voly
  String _selectedCategory = 'Rehetra';
  String _selectedRegion = 'Rehetra (Madagasikara)';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<FieldProvider>();
      if (!provider.isLoaded) {
        provider.loadFields();
      }
    });
  }

  // Get list of regions for selector
  List<String> get _regionList => ['Rehetra (Madagasikara)', ...regionRecommendations.keys];

  // Filter crops based on Search, Category, and Region
  List<String> get _filteredCropKeys {
    List<String> keys = cropsData.keys.toList();

    // Filter by Region if selected
    if (_selectedRegion != 'Rehetra (Madagasikara)') {
      final recs = regionRecommendations[_selectedRegion];
      if (recs != null && recs.isNotEmpty) {
        keys = keys.where((k) => recs.contains(k)).toList();
      }
    }

    // Filter by Category
    if (_selectedCategory != 'Rehetra') {
      keys = keys.where((k) {
        final crop = cropsData[k];
        return crop != null && crop.category.toLowerCase() == _selectedCategory.toLowerCase();
      }).toList();
    }

    // Filter by Search query
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.trim().toLowerCase();
      keys = keys.where((k) {
        final crop = cropsData[k];
        if (crop == null) return false;
        return k.toLowerCase().contains(q) ||
            crop.name.toLowerCase().contains(q) ||
            crop.category.toLowerCase().contains(q);
      }).toList();
    }

    return keys;
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 900;

    return Scaffold(
      backgroundColor: const Color(0xFF0B140E),
      body: SafeArea(
        child: isWide
            ? Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Desktop Left: Ny Sahako (4/12 flex)
                  Expanded(
                    flex: 4,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: _buildMyFieldsPanel(),
                    ),
                  ),
                  // Desktop Right: Torolàlana Voly (8/12 flex)
                  Expanded(
                    flex: 8,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: _buildCropGuidePanel(),
                    ),
                  ),
                ],
              )
            : Column(
                children: [
                  // Mobile Sub-Tab Switcher
                  _buildMobileTabSwitcher(),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: _activeSubTab == 0
                          ? _buildMyFieldsPanel()
                          : _buildCropGuidePanel(),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildMobileTabSwitcher() {
    final fieldCount = context.watch<FieldProvider>().fields.length;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFF14241A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF26402E)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildTabButton(
              index: 0,
              label: 'Ny Sahako ($fieldCount)',
              icon: Icons.eco,
            ),
          ),
          Expanded(
            child: _buildTabButton(
              index: 1,
              label: 'Torolàlana Voly',
              icon: Icons.menu_book,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton({
    required int index,
    required String label,
    required IconData icon,
  }) {
    final isSelected = _activeSubTab == index;
    return GestureDetector(
      onTap: () => setState(() => _activeSubTab = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF22C55E) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? Colors.white : const Color(0xFF94A3B8),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ───────────────────── NY SAHAKO (My Fields) ─────────────────────

  Widget _buildMyFieldsPanel() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF14241A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF26402E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Row(
            children: [
              const Icon(Icons.eco, color: Color(0xFF4ADE80), size: 24),
              const SizedBox(width: 10),
              const Text(
                'Ny Sahako',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Tantano sy araho ny fivoaran\'ny sahanao',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
          ),
          const SizedBox(height: 16),

          // Consumer Fields List
          Consumer<FieldProvider>(
            builder: (context, provider, _) {
              if (!provider.isLoaded) {
                return const Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Center(child: CircularProgressIndicator(color: Color(0xFF4ADE80))),
                );
              }

              if (provider.fields.isEmpty) {
                return _buildEmptyState();
              }

              return Column(
                children: [
                  ...provider.fields.asMap().entries.map(
                        (entry) => _buildFieldCard(entry.key, entry.value),
                      ),
                  const SizedBox(height: 12),
                  _buildAddFieldButton(),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1B2E22),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2B4734)),
      ),
      child: Column(
        children: [
          const Text('🚜', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          const Text(
            'Mbola tsy misy saha',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Ampidiro ny sahanao voalohany mba hanarahana ny fivoaran\'ny volinao.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
          ),
          const SizedBox(height: 16),
          _buildAddFieldButton(),
        ],
      ),
    );
  }

  Widget _buildAddFieldButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        icon: const Icon(Icons.add, size: 20),
        label: const Text('Hampiditra saha vaovao'),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF22C55E),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        onPressed: () => _showAddFieldModal(),
      ),
    );
  }

  Widget _buildFieldCard(int index, Field field) {
    final crop = cropsData[field.cropKey];
    final cropName = crop?.name ?? field.cropKey;
    final cropEmoji = crop?.emoji ?? '🌱';
    final cropImage = crop?.imagePath ?? '';

    // Calculations
    final sownDate = DateTime.tryParse(field.date);
    final today = DateTime.now();
    final daysSinceSown = sownDate != null ? today.difference(sownDate).inDays : 0;

    final durationStr = crop?.duration ?? '90-120';
    final match = RegExp(r'(\d+)-(\d+)').firstMatch(durationStr);
    final maxDays = match != null ? int.tryParse(match.group(2)!) ?? 120 : 120;
    final progress = (daysSinceSown / maxDays).clamp(0.0, 1.0);

    String statusText;
    Color statusColor;
    if (sownDate != null && daysSinceSown < 0) {
      statusText = 'Hovoleana (Préparation)';
      statusColor = const Color(0xFFA855F7);
    } else if (progress >= 1.0) {
      statusText = 'Vonona ho jinjaina 🎉';
      statusColor = const Color(0xFF22C55E);
    } else {
      statusText = 'Ao anaty fitomboana';
      statusColor = const Color(0xFF3B82F6);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1B2E22),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2C4A37)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Photo or Emoji
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: const Color(0xFF274331),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF4ADE80).withAlpha(80)),
                ),
                clipBehavior: Clip.antiAlias,
                alignment: Alignment.center,
                child: cropImage.isNotEmpty
                    ? Image.asset(
                        cropImage,
                        width: 46,
                        height: 46,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Text(cropEmoji, style: const TextStyle(fontSize: 24)),
                      )
                    : Text(cropEmoji, style: const TextStyle(fontSize: 24)),
              ),
              const SizedBox(width: 12),
              // Field title & details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      field.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$cropName  ·  ${field.area} m²',
                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12.5),
                    ),
                  ],
                ),
              ),
              // Delete Action
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 20),
                onPressed: () => _confirmDeleteField(index, field.name),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Status & Days Indicator
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                statusText,
                style: TextStyle(
                  color: statusColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
              Text(
                daysSinceSown >= 0 ? '$daysSinceSown / $maxDays andro' : 'Mbola tsy nambolena',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: const Color(0xFF274331),
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
            ),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteField(int index, String name) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF14241A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Fafana ny saha?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text('Tena tianao hosorana ve ny saha "$name"?', style: const TextStyle(color: Color(0xFFCBD5E1))),
        actions: [
          TextButton(
            child: const Text('Ajanona', style: TextStyle(color: Color(0xFF94A3B8))),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            child: const Text('Fafana', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            onPressed: () {
              context.read<FieldProvider>().removeField(index);
              Navigator.pop(ctx);
            },
          ),
        ],
      ),
    );
  }

  // ───────────────── TOROLÀLANA VOLY (Crop Guide) ──────────────────

  Widget _buildCropGuidePanel() {
    final filteredKeys = _filteredCropKeys;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF14241A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF26402E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title & Subtitle
          Row(
            children: [
              const Icon(Icons.menu_book, color: Color(0xFF4ADE80), size: 24),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'Torolàlana Voly',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF223829),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF4ADE80).withAlpha(80)),
                ),
                child: Text(
                  '${filteredKeys.length} voly',
                  style: const TextStyle(
                    color: Color(0xFF4ADE80),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Boky torolàlana sy fomba fambolena ny vokatra rehetra',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
          ),
          const SizedBox(height: 16),

          // Search Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF1B2E22),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF2C4A37)),
            ),
            child: TextField(
              style: const TextStyle(color: Colors.white, fontSize: 14),
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                icon: const Icon(Icons.search, color: Color(0xFF4ADE80), size: 20),
                hintText: 'Hikaroka voly (ohatra: Vary, Karoty, Ovy)...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13.5),
                border: InputBorder.none,
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Color(0xFF94A3B8), size: 18),
                        onPressed: () => setState(() => _searchQuery = ''),
                      )
                    : null,
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Region Dropdown Filter
          Row(
            children: [
              const Icon(Icons.location_on, color: Color(0xFF4ADE80), size: 18),
              const SizedBox(width: 8),
              const Text(
                'Faritra (Region):',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1B2E22),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF2C4A37)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedRegion,
                      dropdownColor: const Color(0xFF1B2E22),
                      isExpanded: true,
                      icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF4ADE80)),
                      items: _regionList.map((reg) {
                        return DropdownMenuItem<String>(
                          value: reg,
                          child: Text(
                            reg,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            overflow: TextOverflow.ellipsis,
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() => _selectedRegion = val);
                        }
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Category Chips Bar
          SizedBox(
            height: 38,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: cropCategories.length,
              itemBuilder: (context, index) {
                final cat = cropCategories[index];
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: const Color(0xFF22C55E),
                    backgroundColor: const Color(0xFF1B2E22),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
                      fontWeight: FontWeight.bold,
                      fontSize: 12.5,
                    ),
                    side: BorderSide(
                      color: isSelected ? const Color(0xFF22C55E) : const Color(0xFF2C4A37),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    onSelected: (_) {
                      setState(() => _selectedCategory = cat);
                    },
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 18),

          // Crops Grid
          if (filteredKeys.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              child: const Column(
                children: [
                  Icon(Icons.search_off, color: Color(0xFF64748B), size: 48),
                  SizedBox(height: 12),
                  Text(
                    'Tsy misy voly mifanaraka amin\'ny fikarohana',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ],
              ),
            )
          else
            LayoutBuilder(
              builder: (context, constraints) {
                // Responsive column count based on available width
                final cols = constraints.maxWidth > 600 ? 4 : (constraints.maxWidth > 400 ? 3 : 2);
                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredKeys.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: cols,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.82,
                  ),
                  itemBuilder: (context, index) {
                    final key = filteredKeys[index];
                    final crop = cropsData[key];
                    if (crop == null) return const SizedBox.shrink();

                    return _buildCropGridTile(key, crop);
                  },
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildCropGridTile(String key, CropData crop) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CropDetailScreen(cropKey: key, crop: crop),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFF1B2E22),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF2C4A37)),
          boxShadow: const [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 4,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Crop Thumbnail Photo or Emoji
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: const Color(0xFF274331),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF4ADE80).withAlpha(80), width: 1.5),
              ),
              clipBehavior: Clip.antiAlias,
              child: crop.imagePath.isNotEmpty
                  ? Image.asset(
                      crop.imagePath,
                      width: 58,
                      height: 58,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Center(
                        child: Text(crop.emoji, style: const TextStyle(fontSize: 28)),
                      ),
                    )
                  : Center(
                      child: Text(crop.emoji, style: const TextStyle(fontSize: 28)),
                    ),
            ),
            const SizedBox(height: 8),
            // Crop Title
            Text(
              key,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            // Duration badge
            Text(
              crop.duration,
              style: const TextStyle(
                color: Color(0xFF4ADE80),
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  // ──────────────── Modal Add Field Form ─────────────────

  void _showAddFieldModal() {
    String name = '';
    String cropKey = cropsData.keys.first;
    String area = '';
    DateTime selectedDate = DateTime.now();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF14241A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Hampiditra saha vaovao',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white70),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Field Name
                  const Text('Anaran\'ny saha', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    style: const TextStyle(color: Colors.white),
                    onChanged: (val) => name = val,
                    decoration: InputDecoration(
                      hintText: 'Ohatra: Tanimbary an-dohasaha',
                      hintStyle: const TextStyle(color: Color(0xFF64748B)),
                      filled: true,
                      fillColor: const Color(0xFF1B2E22),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF2C4A37)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Crop Selection
                  const Text('Karazana voly', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1B2E22),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF2C4A37)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: cropKey,
                        dropdownColor: const Color(0xFF1B2E22),
                        isExpanded: true,
                        icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF4ADE80)),
                        items: cropsData.entries.map((entry) {
                          return DropdownMenuItem<String>(
                            value: entry.key,
                            child: Text(
                              '${entry.value.emoji} ${entry.value.name}',
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setModalState(() => cropKey = val);
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Area and Date
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Velarana (m²)', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            TextField(
                              keyboardType: TextInputType.number,
                              style: const TextStyle(color: Colors.white),
                              onChanged: (val) => area = val,
                              decoration: InputDecoration(
                                hintText: '2000',
                                hintStyle: const TextStyle(color: Color(0xFF64748B)),
                                filled: true,
                                fillColor: const Color(0xFF1B2E22),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(color: Color(0xFF2C4A37)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Daty nambolena', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            GestureDetector(
                              onTap: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: selectedDate,
                                  firstDate: DateTime(2020),
                                  lastDate: DateTime(2030),
                                );
                                if (picked != null) {
                                  setModalState(() => selectedDate = picked);
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 15),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1B2E22),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFF2C4A37)),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '${selectedDate.day}/${selectedDate.month}/${selectedDate.year}',
                                      style: const TextStyle(color: Colors.white, fontSize: 13.5),
                                    ),
                                    const Icon(Icons.calendar_today, color: Color(0xFF4ADE80), size: 16),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Submit button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF22C55E),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Hamafiso sy tehirizo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                      onPressed: () {
                        if (name.trim().isEmpty || area.trim().isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Fenoy ny anarana sy ny velarana valio')),
                          );
                          return;
                        }
                        final dateStr =
                            '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}';

                        context.read<FieldProvider>().addField(Field(
                              name: name.trim(),
                              cropKey: cropKey,
                              area: area.trim(),
                              date: dateStr,
                            ));

                        Navigator.pop(ctx);
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
