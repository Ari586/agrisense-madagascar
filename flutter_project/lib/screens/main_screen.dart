import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../widgets/home_tab.dart';
import '../widgets/sahako_tab.dart';
import '../providers/sensor_provider.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<TabItem> _tabs = [
    TabItem(label: 'Fandraisana', icon: Icons.home),
    TabItem(label: 'Sahako', icon: Icons.grass),
    TabItem(label: 'Tetiandro', icon: Icons.calendar_month),
    TabItem(label: 'Kajy', icon: Icons.calculate),
    TabItem(label: 'Tsena', icon: Icons.store),
    TabItem(label: 'Hafa', icon: Icons.more_horiz),
  ];

  @override
  void initState() {
    super.initState();
    // Trigger initial data fetch
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SensorProvider>().fetchData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _buildTabContent(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: _tabs.map((tab) => BottomNavigationBarItem(
          icon: Icon(tab.icon),
          label: tab.label,
        )).toList(),
      ),
    );
  }

  Widget _buildTabContent(int index) {
    switch (index) {
      case 0:
        return const HomeTab();
      case 1:
        return const SahakoTab();
      case 2:
        return const Center(child: Text('Tetiandro Tab')); // TODO: Implement
      case 3:
        return const Center(child: Text('Kajy Tab')); // TODO: Implement
      case 4:
        return const Center(child: Text('Tsena Tab')); // TODO: Implement
      case 5:
        return const Center(child: Text('Hafa Tab')); // TODO: Implement
      default:
        return const HomeTab();
    }
  }
}

class TabItem {
  final String label;
  final IconData icon;

  TabItem({required this.label, required this.icon});
}
