import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/ad_insight.dart';

class DailySummaryTable extends StatelessWidget {
  final List<DailySummary> summaries;

  const DailySummaryTable({
    Key? key,
    required this.summaries,
  }) : super(key: key);

  String _formatCurrency(double value) {
    return '฿${NumberFormat('#,##0.00', 'en_US').format(value)}';
  }

  String _formatNumber(int value) {
    return NumberFormat('#,##0', 'en_US').format(value);
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MMM dd, yyyy').format(date);
    } catch (e) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    if (summaries.isEmpty) {
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
        padding: EdgeInsets.all(isMobile ? 20 : 24),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.calendar_today,
                  size: isMobile ? 40 : 48, color: Colors.grey[400]),
              const SizedBox(height: 12),
              Text(
                'No daily summary data',
                style: TextStyle(
                  fontSize: isMobile ? 14 : 16,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Gradient - Matching page.tsx
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.purple[600]!,
                  Colors.pink[600]!,
                  Colors.red[600]!,
                ],
              ),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(isMobile ? 16 : 24),
                topRight: Radius.circular(isMobile ? 16 : 24),
              ),
            ),
            padding: EdgeInsets.all(isMobile ? 16 : 20),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    '📅 Daily Summary (Last 30 Days)',
                    style: TextStyle(
                      fontSize: isMobile ? 16 : 18,
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
                    '${summaries.length} days',
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

          // Table
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: ConstrainedBox(
              constraints: BoxConstraints(minWidth: screenWidth - 24),
              child: DataTable(
                columnSpacing: isMobile ? 16 : 24,
                horizontalMargin: isMobile ? 12 : 16,
                headingRowHeight: isMobile ? 48 : 56,
                dataRowMinHeight: isMobile ? 50 : 56,
                dataRowMaxHeight: isMobile ? 56 : 64,
                headingRowColor: MaterialStateProperty.all(Colors.grey[50]),
                columns: [
                  DataColumn(
                    label: Text(
                      'Date',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: isMobile ? 12 : 14,
                        color: Colors.grey[700],
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Total Spend',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: isMobile ? 12 : 14,
                        color: Colors.grey[700],
                      ),
                    ),
                    numeric: true,
                  ),
                  DataColumn(
                    label: Text(
                      'New Inbox',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: isMobile ? 12 : 14,
                        color: Colors.grey[700],
                      ),
                    ),
                    numeric: true,
                  ),
                  DataColumn(
                    label: Text(
                      'Total Inbox',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: isMobile ? 12 : 14,
                        color: Colors.grey[700],
                      ),
                    ),
                    numeric: true,
                  ),
                  DataColumn(
                    label: Text(
                      'Phone Leads',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: isMobile ? 12 : 14,
                        color: Colors.grey[700],
                      ),
                    ),
                    numeric: true,
                  ),
                ],
                rows: summaries.map((summary) {
                  return DataRow(
                    cells: [
                      DataCell(
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 8 : 12,
                            vertical: isMobile ? 4 : 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _formatDate(summary.date),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue[700],
                              fontSize: isMobile ? 11 : 13,
                            ),
                          ),
                        ),
                      ),
                      DataCell(
                        Text(
                          _formatCurrency(summary.totalSpend),
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: isMobile ? 12 : 14,
                            color: Colors.blue[600],
                          ),
                        ),
                      ),
                      DataCell(
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 8 : 10,
                            vertical: isMobile ? 4 : 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green[50],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _formatNumber(summary.newInbox),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.green[700],
                              fontSize: isMobile ? 12 : 14,
                            ),
                          ),
                        ),
                      ),
                      DataCell(
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 8 : 10,
                            vertical: isMobile ? 4 : 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.teal[50],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _formatNumber(summary.totalInbox),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.teal[700],
                              fontSize: isMobile ? 12 : 14,
                            ),
                          ),
                        ),
                      ),
                      DataCell(
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 8 : 10,
                            vertical: isMobile ? 4 : 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.purple[50],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _formatNumber(summary.phoneLeads),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.purple[700],
                              fontSize: isMobile ? 12 : 14,
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
