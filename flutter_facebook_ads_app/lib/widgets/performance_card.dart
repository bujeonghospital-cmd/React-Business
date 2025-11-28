import 'package:flutter/material.dart';

class PerformanceCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final Gradient gradient;
  final bool isSmallText;

  const PerformanceCard({
    Key? key,
    required this.title,
    required this.value,
    this.subtitle,
    required this.gradient,
    this.isSmallText = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(isMobile ? 16 : 24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: isMobile ? 8 : 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(isMobile ? 12 : 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: isMobile ? 12 : 14,
                fontWeight: FontWeight.w600,
                shadows: const [
                  Shadow(
                    color: Colors.black26,
                    blurRadius: 2,
                  ),
                ],
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const Spacer(),
            Center(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  value,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: isSmallText
                        ? (isMobile ? 16 : 20)
                        : (isMobile ? 20 : 28),
                    fontWeight: FontWeight.bold,
                    height: 1.1,
                    shadows: const [
                      Shadow(
                        color: Colors.black26,
                        blurRadius: 3,
                      ),
                    ],
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(
                subtitle!,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: isMobile ? 9 : 11,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ] else
              const Spacer(),
          ],
        ),
      ),
    );
  }
}
