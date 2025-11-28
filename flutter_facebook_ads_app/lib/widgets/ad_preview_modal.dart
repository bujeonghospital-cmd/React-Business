import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../models/ad_insight.dart';

class AdPreviewModal extends StatelessWidget {
  final AdInsight ad;
  final AdCreative? creative;

  const AdPreviewModal({
    Key? key,
    required this.ad,
    this.creative,
  }) : super(key: key);

  String _formatCurrency(double value) {
    return '฿${NumberFormat('#,##0.00', 'en_US').format(value)}';
  }

  String _formatNumber(int value) {
    return NumberFormat('#,##0', 'en_US').format(value);
  }

  String _formatPercentage(double value) {
    return '${NumberFormat('#,##0.00', 'en_US').format(value)}%';
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;
    final thumbnailUrl = creative?.thumbnailUrl ?? creative?.imageUrl;
    final videoId = creative?.videoId;
    final effectiveStoryId = creative?.effectiveObjectStoryId;
    final costPerConnection =
        ad.getCostPerAction('onsite_conversion.total_messaging_connection');

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Header
              Container(
                padding: EdgeInsets.all(isMobile ? 16 : 20),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[200]!),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ad.adName,
                            style: TextStyle(
                              fontSize: isMobile ? 16 : 18,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Campaign: ${ad.campaignName}',
                            style: TextStyle(
                              fontSize: isMobile ? 12 : 13,
                              color: Colors.grey[600],
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.grey[100],
                      ),
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: EdgeInsets.all(isMobile ? 16 : 20),
                  children: [
                    // Preview Image/Video
                    if (thumbnailUrl != null)
                      Container(
                        decoration: BoxDecoration(
                          borderRadius:
                              BorderRadius.circular(isMobile ? 12 : 16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius:
                              BorderRadius.circular(isMobile ? 12 : 16),
                          child: Image.network(
                            thumbnailUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              height: 200,
                              color: Colors.grey[200],
                              child: Icon(
                                Icons.image,
                                size: 64,
                                color: Colors.grey[400],
                              ),
                            ),
                          ),
                        ),
                      ),

                    SizedBox(height: isMobile ? 16 : 20),

                    // Open in Facebook Buttons
                    if (videoId != null || effectiveStoryId != null) ...[
                      if (isMobile)
                        Column(
                          children: [
                            if (videoId != null)
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    _launchUrl(
                                        'https://www.facebook.com/ads/library/?id=$videoId');
                                  },
                                  icon:
                                      const Icon(Icons.video_library, size: 18),
                                  label: const Text('View in FB Ads Library'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.blue[600],
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                ),
                              ),
                            if (videoId != null && effectiveStoryId != null)
                              const SizedBox(height: 10),
                            if (effectiveStoryId != null)
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    final postUrl =
                                        'https://www.facebook.com/${effectiveStoryId.replaceFirst('_', '/posts/')}';
                                    _launchUrl(postUrl);
                                  },
                                  icon: const Icon(Icons.open_in_new, size: 18),
                                  label: const Text('Open Post'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.indigo[600],
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        )
                      else
                        Row(
                          children: [
                            if (videoId != null)
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    _launchUrl(
                                        'https://www.facebook.com/ads/library/?id=$videoId');
                                  },
                                  icon: const Icon(Icons.video_library),
                                  label: const Text('View in FB Ads Library'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.blue[600],
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                ),
                              ),
                            if (videoId != null && effectiveStoryId != null)
                              const SizedBox(width: 12),
                            if (effectiveStoryId != null)
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    final postUrl =
                                        'https://www.facebook.com/${effectiveStoryId.replaceFirst('_', '/posts/')}';
                                    _launchUrl(postUrl);
                                  },
                                  icon: const Icon(Icons.open_in_new),
                                  label: const Text('Open Post'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.indigo[600],
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      SizedBox(height: isMobile ? 16 : 20),
                    ],

                    // Performance Stats
                    Container(
                      padding: EdgeInsets.all(isMobile ? 12 : 16),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(isMobile ? 12 : 16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Ad Performance',
                            style: TextStyle(
                              fontSize: isMobile ? 14 : 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: isMobile ? 12 : 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildMetricCard(
                                  '💰 Spent',
                                  _formatCurrency(ad.spend),
                                  Colors.blue,
                                  isMobile,
                                ),
                              ),
                              SizedBox(width: isMobile ? 8 : 12),
                              Expanded(
                                child: _buildMetricCard(
                                  '💬 Results',
                                  _formatNumber(ad.messagingFirstReply),
                                  Colors.green,
                                  isMobile,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: isMobile ? 8 : 12),
                          Row(
                            children: [
                              Expanded(
                                child: _buildMetricCard(
                                  '💵 CPC',
                                  _formatCurrency(ad.cpc),
                                  Colors.purple,
                                  isMobile,
                                ),
                              ),
                              SizedBox(width: isMobile ? 8 : 12),
                              Expanded(
                                child: _buildMetricCard(
                                  '📊 CTR',
                                  _formatPercentage(ad.ctr),
                                  Colors.orange,
                                  isMobile,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: isMobile ? 16 : 20),

                    // Ad Details
                    Container(
                      padding: EdgeInsets.all(isMobile ? 12 : 16),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(isMobile ? 12 : 16),
                        border: Border.all(color: Colors.blue[200]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.info_outline,
                                  size: isMobile ? 18 : 20,
                                  color: Colors.blue[700]),
                              const SizedBox(width: 8),
                              Text(
                                'Ad Details',
                                style: TextStyle(
                                  fontSize: isMobile ? 14 : 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: isMobile ? 12 : 16),
                          _buildDetailRow('Impressions',
                              _formatNumber(ad.impressions), isMobile),
                          _buildDetailRow(
                              'Clicks', _formatNumber(ad.clicks), isMobile),
                          _buildDetailRow(
                              'CPM', _formatCurrency(ad.cpm), isMobile),
                          if (ad.reach != null)
                            _buildDetailRow(
                                'Reach', _formatNumber(ad.reach!), isMobile),
                          _buildDetailRow(
                              'Total Inbox',
                              _formatNumber(ad.totalMessagingConnection),
                              isMobile),
                          _buildDetailRow('Cost/Conversation',
                              _formatCurrency(costPerConnection), isMobile),
                          _buildDetailRow('Date', ad.dateStart, isMobile),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMetricCard(
      String label, String value, Color color, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 10 : 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(isMobile ? 10 : 12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isMobile ? 11 : 12,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: TextStyle(
                fontSize: isMobile ? 15 : 18,
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, bool isMobile) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: isMobile ? 5 : 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isMobile ? 12 : 13,
              color: Colors.grey[700],
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isMobile ? 12 : 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
