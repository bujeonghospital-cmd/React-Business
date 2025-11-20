import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/facebook_ads_webview.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set portrait orientation only
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set status bar style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const FacebookAdsManagerApp());
}

class FacebookAdsManagerApp extends StatelessWidget {
  const FacebookAdsManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Facebook Ads Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF1877F2), // Facebook Blue
        scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          elevation: 0,
          backgroundColor: Color(0xFF1877F2),
          foregroundColor: Colors.white,
          centerTitle: true,
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.light,
          ),
        ),
        useMaterial3: true,
      ),
      home: const FacebookAdsWebView(),
    );
  }
}
