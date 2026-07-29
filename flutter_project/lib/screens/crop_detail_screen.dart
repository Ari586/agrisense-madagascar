import 'package:flutter/material.dart';
import '../data/crops_data.dart';

/// Full-screen interactive EPUB / Ebook Reader view for a specific crop.
/// Directly mirrors the React EbookViewer implementation.
class CropDetailScreen extends StatefulWidget {
  final String cropKey;
  final CropData crop;

  const CropDetailScreen({
    super.key,
    required this.cropKey,
    required this.crop,
  });

  @override
  State<CropDetailScreen> createState() => _CropDetailScreenState();
}

class _CropDetailScreenState extends State<CropDetailScreen> {
  late PageController _pageController;
  int _currentPage = 0;
  final int _totalPages = 6;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _totalPages - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _prevPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final crop = widget.crop;

    return Scaffold(
      backgroundColor: const Color(0xFF0B140E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF132218),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Text(crop.emoji, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                crop.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            margin: const EdgeInsets.only(right: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E3A28),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF4ADE80).withAlpha(100)),
            ),
            child: Text(
              'Pejy ${_currentPage + 1} / $_totalPages',
              style: const TextStyle(
                color: Color(0xFF4ADE80),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Linear progress bar at top of book
          LinearProgressIndicator(
            value: (_currentPage + 1) / _totalPages,
            minHeight: 4,
            backgroundColor: const Color(0xFF1A2F22),
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF4ADE80)),
          ),

          // Main Book Pages View
          Expanded(
            child: PageView(
              controller: _pageController,
              onPageChanged: (page) {
                setState(() => _currentPage = page);
              },
              children: [
                _buildCoverPage(crop),
                _buildConditionsPage(crop),
                _buildNurseryPage(crop),
                _buildCarePage(crop),
                _buildTimelinePage(crop),
                _buildTipsPage(crop),
              ],
            ),
          ),

          // EPUB Bottom Navigation Bar
          _buildEbookBottomNav(),
        ],
      ),
    );
  }

  // ───────────────────── PAGE 0: COVER PAGE ─────────────────────

  Widget _buildCoverPage(CropData crop) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF14241A),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF2E4B37)),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black45,
                  blurRadius: 12,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              children: [
                // Book Cover Image / Hero Banner
                Stack(
                  alignment: Alignment.center,
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                      child: crop.imagePath.isNotEmpty
                          ? Image.asset(
                              crop.imagePath,
                              height: 220,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => _buildFallbackBanner(),
                            )
                          : _buildFallbackBanner(),
                    ),
                    Positioned(
                      bottom: 12,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF14241A).withAlpha(220),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF4ADE80), width: 2),
                        ),
                        child: Text(crop.emoji, style: const TextStyle(fontSize: 40)),
                      ),
                    ),
                  ],
                ),

                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  child: Column(
                    children: [
                      Text(
                        crop.name,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 24,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E3A28),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF4ADE80).withAlpha(100)),
                        ),
                        child: Text(
                          crop.category,
                          style: const TextStyle(
                            color: Color(0xFF4ADE80),
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Badges Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildBadge(Icons.wb_sunny_outlined, crop.season, Colors.orange),
                          const SizedBox(width: 8),
                          _buildBadge(Icons.timer_outlined, crop.duration, Colors.blue),
                        ],
                      ),
                      const SizedBox(height: 20),

                      const Divider(color: Color(0xFF26402E)),
                      const SizedBox(height: 12),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.menu_book, color: Color(0xFF4ADE80), size: 18),
                          SizedBox(width: 6),
                          Text(
                            'Fisy Tekinika (Fiche technique)',
                            style: TextStyle(
                              color: Color(0xFFCBD5E1),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Swiper sy vakio ireo pejy manaraka raha hahita fomba fambolena feno',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFallbackBanner() {
    return Container(
      height: 220,
      width: double.infinity,
      color: const Color(0xFF1B3224),
      child: const Center(
        child: Icon(Icons.eco, size: 80, color: Color(0xFF2C543B)),
      ),
    );
  }

  Widget _buildBadge(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withAlpha(80)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
          ),
        ],
      ),
    );
  }

  // ───────────────────── PAGE 1: CONDITIONS ─────────────────────

  Widget _buildConditionsPage(CropData crop) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPageHeader(Icons.eco, 'Toeram-pambolena (Conditions)'),
          const SizedBox(height: 16),

          _buildConditionCard(
            icon: Icons.wb_sunny_outlined,
            iconColor: Colors.orange,
            title: 'Toetr\'andro (Climat)',
            content: crop.climate,
          ),
          _buildConditionCard(
            icon: Icons.landscape_outlined,
            iconColor: Colors.amber,
            title: 'Karazantany (Sol)',
            content: crop.soil,
          ),
          _buildConditionCard(
            icon: Icons.water_drop_outlined,
            iconColor: Colors.blue,
            title: 'Rotsakorana / Rano ilaina',
            content: crop.waterNeeds,
          ),

          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildStatBox('Elanelam-boly', crop.spacing),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatBox('Taham-pamokarana', crop.yield_),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildStatBox('Vinavina Tombony', '${crop.cost}k Ar/10m² fampiasana → ${crop.revenue}k Ar vokatra'),
        ],
      ),
    );
  }

  Widget _buildConditionCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String content,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF14241A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF26402E)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withAlpha(30),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: iconColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  content,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13.5,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatBox(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF14241A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF26402E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 10.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 13.5,
            ),
          ),
        ],
      ),
    );
  }

  // ───────────────────── PAGE 2: SEED & NURSERY ─────────────────────

  Widget _buildNurseryPage(CropData crop) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPageHeader(Icons.grass, 'Famafazana & Taninketsa'),
          const SizedBox(height: 16),

          if (crop.nursery.isNotEmpty &&
              !crop.nursery.contains("MIVANTANA")) ...[
            Container(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF14301D),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF265433)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, color: Color(0xFF4ADE80), size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Fikarakarana ny taninketsa',
                          style: TextStyle(
                            color: Color(0xFF4ADE80),
                            fontWeight: FontWeight.bold,
                            fontSize: 13.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          crop.nursery,
                          style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],

          _buildFormattedTextCard(crop.seed),
        ],
      ),
    );
  }

  // ───────────────────── PAGE 3: PLANTING GUIDE ─────────────────────

  Widget _buildCarePage(CropData crop) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPageHeader(Icons.menu_book, 'Fikarakarana ny Voly'),
          const SizedBox(height: 16),

          _buildFormattedTextCard(crop.plantingGuide),
          const SizedBox(height: 16),

          // AI Crop Diagnostic Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF2A1515),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF5E2626)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.bug_report_outlined, color: Color(0xFFF87171), size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Aretina sy Bibikely',
                        style: TextStyle(
                          color: Color(0xFFF87171),
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Raha mahita bibikely na aretina amin\'ny ravina ianao, ampiasao ny fakan-tsary hahafantarana ny fanafody sahaza.',
                        style: TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.4),
                      ),
                      const SizedBox(height: 8),
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          foregroundColor: const Color(0xFFF87171),
                        ),
                        icon: const Icon(Icons.camera_alt_outlined, size: 16),
                        label: const Text(
                          'Mampiasa ny fakan-tsary (Diagnostic IA) →',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        onPressed: () {
                          Navigator.pop(context);
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ───────────────────── PAGE 4: TIMELINE ─────────────────────

  Widget _buildTimelinePage(CropData crop) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPageHeader(Icons.timeline, 'Tsingerim-pitsiriana (Cycle)'),
          const SizedBox(height: 16),

          ...crop.steps.asMap().entries.map((entry) {
            final idx = entry.key;
            final step = entry.value;
            final isLast = idx == crop.steps.length - 1;

            return IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: const BoxDecoration(
                          color: Color(0xFF22C55E),
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${idx + 1}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      if (!isLast)
                        Expanded(
                          child: Container(
                            width: 2,
                            color: const Color(0xFF26402E),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF14241A),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF26402E)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step.week,
                            style: const TextStyle(
                              color: Color(0xFF4ADE80),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            step.action,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13.5,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // ───────────────────── PAGE 5: TIPS PAGE ─────────────────────

  Widget _buildTipsPage(CropData crop) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPageHeader(Icons.lightbulb_outline, 'Tombontsoa sy Torohevitra'),
          const SizedBox(height: 16),

          ...crop.tips.asMap().entries.map((entry) {
            final idx = entry.key;
            final tip = entry.value;

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF14241A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF26402E)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: const Color(0xFF22C55E).withAlpha(30),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${idx + 1}',
                      style: const TextStyle(
                        color: Color(0xFF4ADE80),
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      tip,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        height: 1.5,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 24),
          Center(
            child: Column(
              children: [
                const Text(
                  'Mirary fahombiazana amin\'ny fambolena! 🌱',
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF22C55E),
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Manakatona ny boky', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ──────────────── Helpers & Formatter ─────────────────

  Widget _buildPageHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF4ADE80), size: 24),
        const SizedBox(width: 10),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 20,
          ),
        ),
      ],
    );
  }

  Widget _buildFormattedTextCard(String rawText) {
    final lines = rawText.split('\n');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF14241A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF26402E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: lines.map((line) {
          final trimmed = line.trim();
          if (trimmed.isEmpty) return const SizedBox(height: 6);

          final isHeader = trimmed.startsWith('DINGANA') ||
              trimmed.contains('FATRA ILAINA') ||
              trimmed.contains('HALALINY') ||
              trimmed.contains('HAFANANA') ||
              trimmed.contains('TOROHEVITRA');

          if (isHeader) {
            return Padding(
              padding: const EdgeInsets.only(top: 10, bottom: 4),
              child: Text(
                trimmed,
                style: const TextStyle(
                  color: Color(0xFF4ADE80),
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  letterSpacing: 0.3,
                ),
              ),
            );
          }

          return Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text(
              trimmed,
              style: const TextStyle(
                color: Color(0xFFF1F5F9),
                fontSize: 13.5,
                height: 1.5,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildEbookBottomNav() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF132218),
        border: Border(top: BorderSide(color: Color(0xFF26402E))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          ElevatedButton.icon(
            icon: const Icon(Icons.chevron_left, size: 20),
            label: const Text('Teo aloha'),
            style: ElevatedButton.styleFrom(
              backgroundColor: _currentPage > 0 ? const Color(0xFF1B2E22) : const Color(0xFF14241A),
              foregroundColor: _currentPage > 0 ? Colors.white : const Color(0xFF64748B),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: _currentPage > 0 ? _prevPage : null,
          ),

          // Page Dot Indicators
          Row(
            children: List.generate(_totalPages, (idx) {
              final active = idx == _currentPage;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: active ? 16 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: active ? const Color(0xFF4ADE80) : const Color(0xFF26402E),
                  borderRadius: BorderRadius.circular(4),
                ),
              );
            }),
          ),

          ElevatedButton.icon(
            label: const Text('Manaraka'),
            icon: const Icon(Icons.chevron_right, size: 20),
            style: ElevatedButton.styleFrom(
              backgroundColor: _currentPage < _totalPages - 1 ? const Color(0xFF22C55E) : const Color(0xFF14241A),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: _currentPage < _totalPages - 1 ? _nextPage : null,
          ),
        ],
      ),
    );
  }
}
