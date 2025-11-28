import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../models/ad_insight.dart';

class TopAdsSection extends StatelessWidget {
  final List<AdInsight> insights;
  final Map<String, AdCreative> adCreatives;
  final Map<String, int> phoneLeads;
  final String sortBy;
  final int limit;
  final bool isCreativesLoading;
  final Function(String) onSortChanged;
  final Function(int) onLimitChanged;
  final Function(AdInsight) onAdTap;

  const TopAdsSection({
    Key? key,
    required this.insights,
    required this.adCreatives,
    required this.phoneLeads,
    required this.sortBy,
    required this.limit,
    required this.isCreativesLoading,
    required this.onSortChanged,
    required this.onLimitChanged,
    required this.onAdTap,
  }) : super(key: key);

  String _formatCurrency(double value) {
    return '฿${NumberFormat('#,##0.00', 'en_US').format(value)}';
  }

  String _formatNumber(int value) {
    return NumberFormat('#,##0', 'en_US').format(value);
  }

  List<AdInsight> _getSortedTopAds() {
    final List<AdInsight> sortedAds = List.from(insights);

    if (sortBy == 'leads') {
      sortedAds.sort((a, b) =>
          b.totalMessagingConnection.compareTo(a.totalMessagingConnection));
    } else if (sortBy == 'phone') {
      sortedAds.sort((a, b) {
        final aPhone = phoneLeads[a.adId] ?? 0;
        final bPhone = phoneLeads[b.adId] ?? 0;
        return bPhone.compareTo(aPhone);
      });
    } else {
      sortedAds.sort((a, b) {
        final aCost =
            a.getCostPerAction('onsite_conversion.total_messaging_connection');
        final bCost =
            b.getCostPerAction('onsite_conversion.total_messaging_connection');
        return aCost.compareTo(bCost);
      });
    }

    return limit == -1 ? sortedAds : sortedAds.take(limit).toList();
  }

  @override
  Widget build(BuildContext context) {
    final topAds = _getSortedTopAds();
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    if (topAds.isEmpty) {
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
        padding: EdgeInsets.all(isMobile ? 24 : 32),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.emoji_events,
                  size: isMobile ? 48 : 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'No TOP Ads data',
                style: TextStyle(
                  fontSize: isMobile ? 16 : 18,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    }

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
          // Header with gradient - Matching page.tsx
          Container(
            padding: EdgeInsets.all(isMobile ? 16 : 24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.purple[600]!, Colors.pink[600]!],
              ),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(isMobile ? 16 : 24),
                topRight: Radius.circular(isMobile ? 16 : 24),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '🏆 TOP ${limit == -1 ? "All" : limit} Ads',
                        style: TextStyle(
                          fontSize: isMobile ? 18 : 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${topAds.length} ads',
                        style: TextStyle(
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Sort Buttons - 3 buttons like page.tsx
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildSortButton(
                        context,
                        '💬 Total Inbox',
                        'leads',
                        isMobile,
                      ),
                      const SizedBox(width: 8),
                      _buildSortButton(
                        context,
                        '📞 Phone Leads',
                        'phone',
                        isMobile,
                      ),
                      const SizedBox(width: 8),
                      _buildSortButton(
                        context,
                        '💰 Cost',
                        'cost',
                        isMobile,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Limit Dropdown - Matching page.tsx
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.yellow[400]!, Colors.orange[400]!],
                    ),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.yellow[600]!, width: 2),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<int>(
                      value: limit,
                      dropdownColor: Colors.yellow[50],
                      icon: Icon(Icons.keyboard_arrow_down,
                          color: Colors.grey[800]),
                      style: TextStyle(
                        color: Colors.grey[800],
                        fontWeight: FontWeight.w600,
                        fontSize: isMobile ? 12 : 14,
                      ),
                      items: [
                        DropdownMenuItem(value: 5, child: Text('⭐ Top 5')),
                        DropdownMenuItem(value: 10, child: Text('⭐ Top 10')),
                        DropdownMenuItem(value: 15, child: Text('⭐ Top 15')),
                        DropdownMenuItem(value: 20, child: Text('⭐ Top 20')),
                        DropdownMenuItem(value: 30, child: Text('⭐ Top 30')),
                        DropdownMenuItem(value: -1, child: Text('⭐ Top All')),
                      ],
                      onChanged: (value) {
                        if (value != null) onLimitChanged(value);
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Loading Indicator
          if (isCreativesLoading)
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.blue[50],
              child: Row(
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.blue[700]!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Loading ad images...',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.blue,
                    ),
                  ),
                ],
              ),
            ),

          // Table Header - Matching page.tsx
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 8 : 16,
              vertical: 12,
            ),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(
              children: [
                SizedBox(
                    width: isMobile ? 32 : 40,
                    child: Center(
                        child: Text('#', style: _headerStyle(isMobile)))),
                SizedBox(
                    width: isMobile ? 56 : 72,
                    child: Center(
                        child: Text('Ad', style: _headerStyle(isMobile)))),
                Expanded(
                    flex: 2,
                    child: Center(
                        child: Text('Spent', style: _headerStyle(isMobile)))),
                Expanded(
                    flex: 1,
                    child: Center(
                        child: Text('New', style: _headerStyle(isMobile)))),
                Expanded(
                    flex: 1,
                    child: Center(
                        child: Text('Total', style: _headerStyle(isMobile)))),
                Expanded(
                    flex: 1,
                    child: Center(
                        child: Text('📞', style: _headerStyle(isMobile)))),
                Expanded(
                    flex: 2,
                    child: Center(
                        child: Text('Cost', style: _headerStyle(isMobile)))),
              ],
            ),
          ),

          // Ads List - Table style matching page.tsx
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: topAds.length,
            separatorBuilder: (context, index) =>
                Divider(height: 1, color: Colors.grey[200]),
            itemBuilder: (context, index) {
              final ad = topAds[index];
              final creative = adCreatives[ad.adId];
              final phoneLeadCount = phoneLeads[ad.adId] ?? 0;
              final rank = index + 1;
              final thumbnailUrl = creative?.thumbnailUrl ?? creative?.imageUrl;
              final costPerConnection = ad.getCostPerAction(
                  'onsite_conversion.total_messaging_connection');

              return Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => onAdTap(ad),
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: isMobile ? 8 : 16,
                      vertical: isMobile ? 8 : 12,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.transparent,
                          Colors.blue[50]!.withOpacity(0.3),
                          Colors.purple[50]!.withOpacity(0.3),
                          Colors.pink[50]!.withOpacity(0.3)
                        ],
                      ),
                    ),
                    child: Row(
                      children: [
                        // Rank
                        SizedBox(
                          width: isMobile ? 32 : 40,
                          child: Center(
                            child: Text(
                              '$rank',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: isMobile ? 14 : 16,
                                color: Colors.grey[700],
                              ),
                            ),
                          ),
                        ),
                        // Thumbnail
                        SizedBox(
                          width: isMobile ? 56 : 72,
                          child: Center(
                              child: _buildThumbnail(thumbnailUrl, isMobile)),
                        ),
                        // Spend
                        Expanded(
                          flex: 2,
                          child: Center(
                            child: Text(
                              _formatCurrency(ad.spend),
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: isMobile ? 12 : 14,
                                color: Colors.grey[700],
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
                                fontSize: isMobile ? 12 : 14,
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
                                fontSize: isMobile ? 12 : 14,
                                color: Colors.blue[700],
                              ),
                            ),
                          ),
                        ),
                        // Phone Leads
                        Expanded(
                          flex: 1,
                          child: Center(
                            child: Text(
                              '$phoneLeadCount',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: isMobile ? 12 : 14,
                                color: Colors.purple[700],
                              ),
                            ),
                          ),
                        ),
                        // Cost per Lead
                        Expanded(
                          flex: 2,
                          child: Center(
                            child: Text(
                              costPerConnection > 0
                                  ? _formatCurrency(costPerConnection)
                                  : '—',
                              style: TextStyle(
                                fontSize: isMobile ? 12 : 14,
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
    );
  }

  TextStyle _headerStyle(bool isMobile) {
    return TextStyle(
      fontWeight: FontWeight.w600,
      fontSize: isMobile ? 11 : 13,
      color: Colors.grey[700],
    );
  }

  Widget _buildSortButton(
      BuildContext context, String label, String value, bool isMobile) {
    final isSelected = sortBy == value;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onSortChanged(value),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 10 : 16,
            vertical: isMobile ? 8 : 10,
          ),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 4,
                        offset: const Offset(0, 2))
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: isMobile ? 11 : 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              color: isSelected ? Colors.purple[700] : Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildThumbnail(String? thumbnailUrl, bool isMobile) {
    final size = isMobile ? 48.0 : 64.0;
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: thumbnailUrl != null
          ? CachedNetworkImage(
              imageUrl: thumbnailUrl,
              width: size,
              height: size,
              fit: BoxFit.cover,
              placeholder: (context, url) => Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child:
                    Container(width: size, height: size, color: Colors.white),
              ),
              errorWidget: (context, url, error) => Container(
                width: size,
                height: size,
                color: Colors.grey[200],
                child: Icon(Icons.image,
                    size: size * 0.4, color: Colors.grey[400]),
              ),
            )
          : Container(
              width: size,
              height: size,
              color: Colors.grey[100],
              child: Icon(Icons.image_outlined,
                  size: size * 0.4, color: Colors.grey[400]),
            ),
    );
  }
}
