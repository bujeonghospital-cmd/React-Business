import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'dart:async';
import '../models/ad_insight.dart';
import '../services/facebook_ads_service.dart';
import '../widgets/performance_card.dart';
import '../widgets/date_range_picker.dart' as custom_picker;
import '../widgets/daily_summary_table.dart';
import '../widgets/top_ads_section.dart';
import '../widgets/ad_preview_modal.dart';

class FacebookAdsDashboardNew extends StatefulWidget {
  const FacebookAdsDashboardNew({Key? key}) : super(key: key);

  @override
  State<FacebookAdsDashboardNew> createState() =>
      _FacebookAdsDashboardNewState();
}

class _FacebookAdsDashboardNewState extends State<FacebookAdsDashboardNew>
    with SingleTickerProviderStateMixin {
  final FacebookAdsService _service = FacebookAdsService();
  final RefreshController _refreshController =
      RefreshController(initialRefresh: false);

  // Data
  List<AdInsight> _insights = [];
  Map<String, AdCreative> _adCreatives = {};
  Map<String, int> _phoneLeads = {};
  List<DailySummary> _dailySummaries = [];

  // Loading states
  bool _isLoading = true;
  bool _isCreativesLoading = false;
  String? _error;

  // Metrics
  double _facebookBalance = 0;
  int _phoneCount = 0;
  int _googleSheetsData = 0;
  int _googleAdsData = 0;

  // Filters
  String _viewMode = 'ads';
  String _dateRange = 'today';
  DateTime? _customDateStart;
  DateTime? _customDateEnd;
  String _topAdsSortBy = 'leads';
  int _topAdsLimit = 20;

  // Auto-refresh timer
  Timer? _autoRefreshTimer;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _loadAllData();
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    _refreshController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _startAutoRefresh() {
    _autoRefreshTimer = Timer.periodic(
      const Duration(minutes: 2),
      (timer) {
        _loadAllData(isBackground: true);
      },
    );
  }

  Future<void> _loadAllData({bool isBackground = false}) async {
    if (!isBackground) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    }

    try {
      String level = _viewMode == 'campaigns'
          ? 'campaign'
          : _viewMode == 'adsets'
              ? 'adset'
              : 'ad';

      final insights = await _service.fetchInsights(
        level: level,
        datePreset: _dateRange == 'custom' ? 'last_30d' : _dateRange,
        timeSince:
            _dateRange == 'custom' ? _formatDate(_customDateStart!) : null,
        timeUntil: _dateRange == 'custom' ? _formatDate(_customDateEnd!) : null,
      );

      print('🚀 Starting to fetch all data...');
      final results = await Future.wait([
        _service.fetchFacebookBalance(),
        _service.fetchPhoneCount(),
        _service.fetchGoogleSheetsData(
          datePreset: _dateRange == 'custom' ? 'last_30d' : _dateRange,
          timeSince:
              _dateRange == 'custom' ? _formatDate(_customDateStart!) : null,
          timeUntil:
              _dateRange == 'custom' ? _formatDate(_customDateEnd!) : null,
        ),
        _service.fetchGoogleAdsData(
          datePreset: _dateRange,
          startDate:
              _dateRange == 'custom' ? _formatDate(_customDateStart!) : null,
          endDate: _dateRange == 'custom' ? _formatDate(_customDateEnd!) : null,
        ),
        _service.fetchDailySummaryData(),
      ]);

      print('📦 All data fetched!');
      print('💵 Facebook Balance: ${results[0]}');
      print('📞 Phone Count: ${results[1]}');
      print('📊 Google Sheets: ${results[2]}');
      print('📈 Google Ads: ${results[3]}');
      print('📅 Daily Summaries: ${(results[4] as List).length} items');

      setState(() {
        _insights = insights;
        _facebookBalance = results[0] as double;
        _phoneCount = results[1] as int;
        _googleSheetsData = results[2] as int;
        _googleAdsData = results[3] as int;
        _dailySummaries = results[4] as List<DailySummary>;
        _isLoading = false;
      });

      print('✅ State updated with new data');

      if (_viewMode == 'ads' && _insights.isNotEmpty) {
        _fetchAdCreatives();
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }

    if (!isBackground) {
      _refreshController.refreshCompleted();
    }
  }

  Future<void> _fetchAdCreatives() async {
    setState(() {
      _isCreativesLoading = true;
    });

    try {
      final adIds = _insights.map((ad) => ad.adId).toList();
      final creatives = await _service.fetchAdCreatives(adIds);
      final phoneLeads = await _service.fetchPhoneLeads(adIds: adIds);

      setState(() {
        _adCreatives = creatives;
        _phoneLeads = phoneLeads;
        _isCreativesLoading = false;
      });
    } catch (e) {
      setState(() {
        _isCreativesLoading = false;
      });
    }
  }

  void _onRefresh() {
    _loadAllData();
  }

  String _formatDate(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  String _formatCurrency(double value) {
    return '฿${NumberFormat('#,##0.00', 'th_TH').format(value)}';
  }

  String _formatNumber(dynamic value) {
    if (value is String) {
      value = double.tryParse(value) ?? 0;
    }
    return NumberFormat('#,##0', 'th_TH').format(value);
  }

  double _getTotalSpend() {
    return _insights.fold(0, (sum, ad) => sum + ad.spend);
  }

  int _getTotalNewInbox() {
    return _insights.fold(0, (sum, ad) => sum + ad.messagingFirstReply);
  }

  int _getTotalInbox() {
    return _insights.fold(0, (sum, ad) => sum + ad.totalMessagingConnection);
  }

  void _showDatePicker() {
    showDialog(
      context: context,
      builder: (context) => custom_picker.DateRangePickerDialog(
        initialStartDate: _customDateStart,
        initialEndDate: _customDateEnd,
        onDateRangeSelected: (start, end) {
          setState(() {
            _customDateStart = start;
            _customDateEnd = end;
            _dateRange = 'custom';
          });
          _loadAllData();
        },
      ),
    );
  }

  void _showAdPreview(AdInsight ad) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AdPreviewModal(
        ad: ad,
        creative: _adCreatives[ad.adId],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Loading State - Matching page.tsx design
    if (_isLoading) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Colors.grey[50]!, Colors.blue[50]!],
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 64,
                  height: 64,
                  child: CircularProgressIndicator(
                    valueColor:
                        AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
                    strokeWidth: 4,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Loading data...',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please wait',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Error State - Matching page.tsx design
    if (_error != null) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(
            color: Colors.grey[50],
          ),
          padding: const EdgeInsets.all(16),
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 500),
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    '⚠️',
                    style: TextStyle(fontSize: 48),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'An error occurred',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _loadAllData,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[600],
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Try Again',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Colors.grey[50]!, Colors.blue[50]!],
            ),
          ),
          child: SmartRefresher(
            controller: _refreshController,
            onRefresh: _onRefresh,
            header: WaterDropMaterialHeader(
              backgroundColor: Colors.blue[600],
              color: Colors.white,
            ),
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Back Button Header - Matching page.tsx
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                    child: Row(
                      children: [
                        Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () => Navigator.of(context).pop(),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 10),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.blue[500]!,
                                    Colors.blue[600]!
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.blue.withOpacity(0.3),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '←',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Back to Home',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Date Filter Bar - Matching page.tsx
                  _buildDateFilterBar(),

                  // Performance Cards Section
                  const SizedBox(height: 12),
                  _buildPerformanceCardsSection(),

                  // Daily Summary Section
                  const SizedBox(height: 16),
                  _buildDailySummarySection(),

                  // Top Ads Section
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: TopAdsSection(
                      insights: _insights,
                      adCreatives: _adCreatives,
                      phoneLeads: _phoneLeads,
                      sortBy: _topAdsSortBy,
                      limit: _topAdsLimit,
                      isCreativesLoading: _isCreativesLoading,
                      onSortChanged: (sortBy) {
                        setState(() {
                          _topAdsSortBy = sortBy;
                        });
                      },
                      onLimitChanged: (limit) {
                        setState(() {
                          _topAdsLimit = limit;
                        });
                      },
                      onAdTap: _showAdPreview,
                    ),
                  ),

                  // Report Section
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: _buildReportSection(),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDateFilterBar() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 12 : 16,
        vertical: 12,
      ),
      child: isMobile
          ? _buildMobileDateDropdown()
          : SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildDateRangeChip('Today', 'today'),
                  _buildDateRangeChip('Yesterday', 'yesterday'),
                  _buildDateRangeChip('7 Days', 'last_7d'),
                  _buildDateRangeChip('14 Days', 'last_14d'),
                  _buildDateRangeChip('30 Days', 'last_30d'),
                  _buildDateRangeChip('This Month', 'this_month'),
                  _buildCustomDateChip(),
                  if (_dateRange == 'custom' &&
                      _customDateStart != null &&
                      _customDateEnd != null)
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue[200]!),
                      ),
                      child: Text(
                        '${_formatDate(_customDateStart!)} - ${_formatDate(_customDateEnd!)}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildMobileDateDropdown() {
    return Row(
      children: [
        Text(
          '📅',
          style: TextStyle(fontSize: 16),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!, width: 2),
              borderRadius: BorderRadius.circular(8),
              color: Colors.white,
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _dateRange,
                isExpanded: true,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[700],
                ),
                items: [
                  DropdownMenuItem(value: 'today', child: Text('Today')),
                  DropdownMenuItem(
                      value: 'yesterday', child: Text('Yesterday')),
                  DropdownMenuItem(
                      value: 'last_7d', child: Text('Last 7 Days')),
                  DropdownMenuItem(
                      value: 'last_14d', child: Text('Last 14 Days')),
                  DropdownMenuItem(
                      value: 'last_30d', child: Text('Last 30 Days')),
                  DropdownMenuItem(
                      value: 'this_month', child: Text('This Month')),
                  DropdownMenuItem(value: 'custom', child: Text('🗓️ Custom')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    if (value == 'custom') {
                      _showDatePicker();
                    } else {
                      setState(() {
                        _dateRange = value;
                      });
                      _loadAllData();
                    }
                  }
                },
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPerformanceCardsSection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;
    final cardHeight = isMobile ? 100.0 : 140.0;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // First Row: Total Spend + New/Total Inbox
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: cardHeight,
                  child: PerformanceCard(
                    title: '💰 Total Spend',
                    value: _formatCurrency(_getTotalSpend()),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.blue[500]!,
                        Colors.blue[600]!,
                        Colors.blue[700]!
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(width: isMobile ? 8 : 12),
              Expanded(
                child: SizedBox(
                  height: cardHeight,
                  child: PerformanceCard(
                    title: '💬 New / Total Inbox',
                    value:
                        '${_formatNumber(_getTotalNewInbox())} / ${_formatNumber(_getTotalInbox())}',
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.teal[500]!,
                        Colors.teal[600]!,
                        Colors.cyan[600]!
                      ],
                    ),
                    isSmallText: true,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: isMobile ? 8 : 16),
          // Second Row: FB Balance + Phone Leads
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: cardHeight,
                  child: PerformanceCard(
                    title: '💵 FB Balance',
                    value: _formatCurrency(_facebookBalance),
                    subtitle: 'Facebook Balance',
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        const Color(0xFF00C853),
                        const Color(0xFF00E676),
                        Colors.green[700]!,
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(width: isMobile ? 8 : 12),
              Expanded(
                child: SizedBox(
                  height: cardHeight,
                  child: PerformanceCard(
                    title: '📞 Phone Leads',
                    value: _formatNumber(_phoneCount),
                    subtitle: 'Phone Leads Today',
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.purple[500]!,
                        Colors.purple[600]!,
                        Colors.indigo[700]!,
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDailySummarySection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 16),
      child: DailySummaryTable(
        summaries: _dailySummaries,
      ),
    );
  }

  Widget _buildReportSection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(isMobile ? 16 : 24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header with Gradient - Matching page.tsx
          Container(
            padding: EdgeInsets.all(isMobile ? 16 : 24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.blue[600]!,
                  Colors.indigo[600]!,
                  Colors.purple[600]!,
                ],
              ),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(isMobile ? 16 : 24),
                topRight: Radius.circular(isMobile ? 16 : 24),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    '📋 Report - Last 30 Days',
                    style: TextStyle(
                      fontSize: isMobile ? 16 : 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (isMobile)
                  Text(
                    '👉 Scroll',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.75),
                    ),
                  ),
                if (!isMobile) const SizedBox(width: 12),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${_insights.length} items',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // View Mode Tabs - Matching page.tsx
          Container(
            padding: EdgeInsets.all(isMobile ? 12 : 16),
            color: Colors.grey[50],
            child: Row(
              children: [
                Expanded(
                    child:
                        _buildViewModeTab('Campaigns', 'campaigns', isMobile)),
                SizedBox(width: isMobile ? 6 : 8),
                Expanded(
                    child: _buildViewModeTab('Ad Sets', 'adsets', isMobile)),
                SizedBox(width: isMobile ? 6 : 8),
                Expanded(child: _buildViewModeTab('Ads', 'ads', isMobile)),
              ],
            ),
          ),

          // Empty State
          if (_insights.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.inbox,
                        size: isMobile ? 48 : 64, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No data available',
                      style: TextStyle(
                        fontSize: isMobile ? 16 : 18,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            // Table Header
            Column(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 8 : 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    border:
                        Border(bottom: BorderSide(color: Colors.grey[200]!)),
                  ),
                  child: Row(
                    children: [
                      if (_viewMode == 'ads')
                        SizedBox(
                            width: isMobile ? 56 : 72,
                            child: Center(
                                child: Text('Image',
                                    style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 2,
                          child: Text('Ad Name',
                              style: _tableHeaderStyle(isMobile))),
                      Expanded(
                          flex: 2,
                          child: Center(
                              child: Text('Campaign',
                                  style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 1,
                          child: Center(
                              child: Text('Spent',
                                  style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 1,
                          child: Center(
                              child: Text('New',
                                  style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 1,
                          child: Center(
                              child: Text('Inbox',
                                  style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 1,
                          child: Center(
                              child: Text('Cost/Lead',
                                  style: _tableHeaderStyle(isMobile)))),
                    ],
                  ),
                ),
                // Data Rows
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: EdgeInsets.zero,
                  itemCount: _insights.length,
                  separatorBuilder: (context, index) =>
                      Divider(height: 1, color: Colors.grey[200]),
                  itemBuilder: (context, index) {
                    final ad = _insights[index];
                    final creative = _adCreatives[ad.adId];
                    final thumbnailUrl =
                        creative?.thumbnailUrl ?? creative?.imageUrl;
                    final costPerConnection = ad.getCostPerAction(
                      'onsite_conversion.total_messaging_connection',
                    );

                    return Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () => _showAdPreview(ad),
                        child: Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 8 : 16,
                            vertical: isMobile ? 10 : 12,
                          ),
                          child: Row(
                            children: [
                              // Thumbnail
                              if (_viewMode == 'ads')
                                SizedBox(
                                  width: isMobile ? 56 : 72,
                                  child: Center(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: thumbnailUrl != null
                                          ? Image.network(
                                              thumbnailUrl,
                                              width: isMobile ? 48 : 56,
                                              height: isMobile ? 48 : 56,
                                              fit: BoxFit.cover,
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                return Container(
                                                  width: isMobile ? 48 : 56,
                                                  height: isMobile ? 48 : 56,
                                                  color: Colors.grey[200],
                                                  child: Icon(Icons.image,
                                                      color: Colors.grey[400],
                                                      size: 24),
                                                );
                                              },
                                            )
                                          : Container(
                                              width: isMobile ? 48 : 56,
                                              height: isMobile ? 48 : 56,
                                              color: Colors.grey[100],
                                              child: Icon(Icons.image_outlined,
                                                  color: Colors.grey[400],
                                                  size: 24),
                                            ),
                                    ),
                                  ),
                                ),
                              // Ad Name
                              Expanded(
                                flex: 2,
                                child: Text(
                                  ad.adName,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: isMobile ? 12 : 14,
                                    color: Colors.grey[800],
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              // Campaign Name
                              Expanded(
                                flex: 2,
                                child: Center(
                                  child: Text(
                                    ad.campaignName,
                                    style: TextStyle(
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.grey[600],
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                              // Spent
                              Expanded(
                                flex: 1,
                                child: Center(
                                  child: Text(
                                    _formatCurrency(ad.spend),
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.blue[700],
                                    ),
                                  ),
                                ),
                              ),
                              // New Inbox
                              Expanded(
                                flex: 1,
                                child: Center(
                                  child: Text(
                                    '${ad.messagingFirstReply}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.green[700],
                                    ),
                                  ),
                                ),
                              ),
                              // Total Inbox
                              Expanded(
                                flex: 1,
                                child: Center(
                                  child: Text(
                                    '${ad.totalMessagingConnection}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.teal[700],
                                    ),
                                  ),
                                ),
                              ),
                              // Cost per Lead
                              Expanded(
                                flex: 1,
                                child: Center(
                                  child: Text(
                                    costPerConnection > 0
                                        ? _formatCurrency(costPerConnection)
                                        : '—',
                                    style: TextStyle(
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.grey[700],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
        ],
      ),
    );
  }

  TextStyle _tableHeaderStyle(bool isMobile) {
    return TextStyle(
      fontWeight: FontWeight.w600,
      fontSize: isMobile ? 11 : 13,
      color: Colors.grey[700],
    );
  }

  Widget _buildDateRangeChip(String label, String value) {
    final isSelected = _dateRange == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey[700],
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            fontSize: 13,
          ),
        ),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _dateRange = value;
          });
          _loadAllData();
        },
        selectedColor: Colors.blue[600],
        backgroundColor: Colors.grey[200],
        elevation: isSelected ? 2 : 0,
        pressElevation: 4,
      ),
    );
  }

  Widget _buildCustomDateChip() {
    final isSelected = _dateRange == 'custom';
    return FilterChip(
      label: Text(
        '🗓️ กำหนดเอง',
        style: TextStyle(
          color: isSelected ? Colors.white : Colors.grey[700],
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 13,
        ),
      ),
      selected: isSelected,
      onSelected: (selected) {
        _showDatePicker();
      },
      selectedColor: Colors.blue[600],
      backgroundColor: Colors.grey[200],
      elevation: isSelected ? 2 : 0,
      pressElevation: 4,
    );
  }

  Widget _buildViewModeTab(String label, String mode, bool isMobile) {
    final isSelected = _viewMode == mode;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          setState(() {
            _viewMode = mode;
          });
          _loadAllData();
        },
        borderRadius: BorderRadius.circular(isMobile ? 8 : 12),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: isMobile ? 10 : 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.blue[100] : Colors.white,
            borderRadius: BorderRadius.circular(isMobile ? 8 : 12),
            border: Border.all(
              color: isSelected ? Colors.blue[300]! : Colors.grey[300]!,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: isMobile ? 12 : 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? Colors.blue[700] : Colors.grey[700],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
