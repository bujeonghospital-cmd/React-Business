from flask import Flask, jsonify, request
from flask_cors import CORS
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Google Sheets Configuration
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SPREADSHEET_ID = os.getenv('GOOGLE_SPREADSHEET_ID')

# Create credentials from environment variables
def get_google_credentials():
    """Create Google credentials from environment variables"""
    credentials_info = {
        "type": "service_account",
        "project_id": os.getenv('GOOGLE_PROJECT_ID'),
        "private_key_id": os.getenv('GOOGLE_PRIVATE_KEY_ID'),
        "private_key": os.getenv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', '').replace('\\n', '\n'),
        "client_email": os.getenv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        "client_id": os.getenv('GOOGLE_CLIENT_ID'),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv('GOOGLE_CLIENT_CERT_URL')
    }
    
    credentials = service_account.Credentials.from_service_account_info(
        credentials_info, scopes=SCOPES
    )
    return credentials

def get_sheets_service():
    """Get Google Sheets API service"""
    credentials = get_google_credentials()
    service = build('sheets', 'v4', credentials=credentials)
    return service

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/film-data', methods=['GET'])
def get_film_data():
    """
    Get all data from Film data sheet for surgery schedule
    Returns all records with surgery-related information
    """
    try:
        service = get_sheets_service()
        
        # Read data from Film data sheet - get all columns
        sheet_range = 'Film data!A:AZ'
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=sheet_range
        ).execute()
        
        rows = result.get('values', [])
        
        if not rows:
            return jsonify({
                'success': True,
                'data': [],
                'total': 0,
                'message': 'No data found in Film data sheet'
            })
        
        # First row is header
        headers = rows[0]
        data_rows = rows[1:]
        
        print(f"\n=== GOOGLE SHEETS - Film data (Surgery Schedule) ===")
        print(f"Total columns: {len(headers)}")
        print(f"Headers: {headers}")
        print(f"Total data rows: {len(data_rows)}")
        
        # Map column names to indexes (case-insensitive search)
        def find_column_index(header_name):
            for idx, header in enumerate(headers):
                if header and header.strip().lower() == header_name.lower():
                    return idx
            return -1
        
        # Find indexes for surgery-related columns
        doctor_idx = find_column_index('หมอ')
        contact_person_idx = find_column_index('ผู้ติดต่อ')
        name_idx = find_column_index('ชื่อ')
        phone_idx = find_column_index('เบอร์โทร')
        date_surgery_scheduled_idx = find_column_index('วันที่ได้นัดผ่าตัด')
        time_scheduled_idx = find_column_index('เวลาที่นัด')
        amount_idx = find_column_index('ยอดนำเสนอ')
        surgery_date_idx = find_column_index('วันที่ผ่าตัด')
        date_consult_scheduled_idx = find_column_index('วันที่ได้นัด consult')
        
        print(f"\n=== MAPPING COLUMNS ===")
        print(f"หมอ (index {doctor_idx}): '{headers[doctor_idx] if doctor_idx >= 0 else 'N/A'}'")
        print(f"ผู้ติดต่อ (index {contact_person_idx}): '{headers[contact_person_idx] if contact_person_idx >= 0 else 'N/A'}'")
        print(f"ชื่อ (index {name_idx}): '{headers[name_idx] if name_idx >= 0 else 'N/A'}'")
        print(f"เบอร์โทร (index {phone_idx}): '{headers[phone_idx] if phone_idx >= 0 else 'N/A'}'")
        print(f"วันที่ได้นัดผ่าตัด (index {date_surgery_scheduled_idx}): '{headers[date_surgery_scheduled_idx] if date_surgery_scheduled_idx >= 0 else 'N/A'}'")
        print(f"เวลาที่นัด (index {time_scheduled_idx}): '{headers[time_scheduled_idx] if time_scheduled_idx >= 0 else 'N/A'}'")
        print(f"ยอดนำเสนอ (index {amount_idx}): '{headers[amount_idx] if amount_idx >= 0 else 'N/A'}'")
        print(f"วันที่ผ่าตัด (index {surgery_date_idx}): '{headers[surgery_date_idx] if surgery_date_idx >= 0 else 'N/A'}'")
        print(f"วันที่ได้นัด consult (index {date_consult_scheduled_idx}): '{headers[date_consult_scheduled_idx] if date_consult_scheduled_idx >= 0 else 'N/A'}'")
        
        # Process data rows
        surgery_data = []
        
        for idx, row in enumerate(data_rows):
            if not row or len(row) == 0:
                continue
            
            # Get values safely
            def get_value(col_idx):
                return row[col_idx].strip() if len(row) > col_idx and row[col_idx] else ""
            
            doctor = get_value(doctor_idx) if doctor_idx >= 0 else ""
            contact_person = get_value(contact_person_idx) if contact_person_idx >= 0 else ""
            name = get_value(name_idx) if name_idx >= 0 else ""
            phone = get_value(phone_idx) if phone_idx >= 0 else ""
            date_surgery_scheduled = get_value(date_surgery_scheduled_idx) if date_surgery_scheduled_idx >= 0 else ""
            time_scheduled = get_value(time_scheduled_idx) if time_scheduled_idx >= 0 else ""
            amount = get_value(amount_idx) if amount_idx >= 0 else ""
            surgery_date = get_value(surgery_date_idx) if surgery_date_idx >= 0 else ""
            date_consult_scheduled = get_value(date_consult_scheduled_idx) if date_consult_scheduled_idx >= 0 else ""
            
            # Add record (include all records, frontend will filter)
            surgery_data.append({
                'id': f'film-{idx + 2}',
                'หมอ': doctor,
                'ผู้ติดต่อ': contact_person if contact_person else 'ไม่ระบุ',
                'ชื่อ': name,
                'เบอร์โทร': phone,
                'วันที่ได้นัดผ่าตัด': date_surgery_scheduled,
                'เวลาที่นัด': time_scheduled,
                'ยอดนำเสนอ': amount,
                'วันที่ผ่าตัด': surgery_date,
                'date_consult_scheduled': date_consult_scheduled,
                'contact_person': contact_person if contact_person else 'ไม่ระบุ',
                'date_surgery_scheduled': date_surgery_scheduled,
                'surgery_date': surgery_date
            })
        
        print(f"\n=== RESULTS ===")
        print(f"Total records processed: {len(surgery_data)}")
        
        return jsonify({
            'success': True,
            'data': surgery_data,
            'total': len(surgery_data),
            'timestamp': datetime.now().isoformat(),
            'debug': {
                'totalRows': len(data_rows),
                'processedRows': len(surgery_data),
                'columns': {
                    'doctor': f"หมอ (index {doctor_idx})",
                    'contact_person': f"ผู้ติดต่อ (index {contact_person_idx})",
                    'name': f"ชื่อ (index {name_idx})",
                    'phone': f"เบอร์โทร (index {phone_idx})",
                    'date_surgery_scheduled': f"วันที่ได้นัดผ่าตัด (index {date_surgery_scheduled_idx})",
                    'time_scheduled': f"เวลาที่นัด (index {time_scheduled_idx})",
                    'amount': f"ยอดนำเสนอ (index {amount_idx})",
                    'surgery_date': f"วันที่ผ่าตัด (index {surgery_date_idx})",
                    'date_consult_scheduled': f"วันที่ได้นัด consult (index {date_consult_scheduled_idx})"
                }
            }
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/film-call-status', methods=['GET'])
def get_film_call_status():
    """
    Get call status from Film_dev sheet
    Returns records with status "อยู่ระหว่างโทรออก"
    """
    try:
        service = get_sheets_service()
        
        # Read data from Film_dev sheet - extended range to include column AS
        sheet_range = 'Film_dev!A:AZ'
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=sheet_range
        ).execute()
        
        rows = result.get('values', [])
        
        if not rows:
            return jsonify({
                'success': True,
                'data': [],
                'total': 0,
                'message': 'No data found in Film_dev sheet'
            })
        
        # First row is header (or might be Google Sheet column names like AS, AT, AU)
        headers = rows[0]
        
        # Check if first row has sheet column names (A, B, C, AS, AT, etc.)
        first_row_has_column_names = any(
            cell and len(str(cell).strip()) <= 3 and str(cell).strip().isupper() 
            for cell in headers[:5]
        )
        
        if first_row_has_column_names and len(rows) > 1:
            print(f"📋 Detected 2-row header system")
            print(f"Row 0 (Column names): {headers}")
            print(f"Row 1 (Real headers): {rows[1]}")
            headers = rows[1]  # Use second row as real headers
            data_rows = rows[2:]  # Data starts from row 3
        else:
            data_rows = rows[1:]  # Data starts from row 2
        
        print(f"\n=== GOOGLE SHEETS - Film_dev (Call Status) ===")
        print(f"Total columns: {len(headers)}")
        print(f"Headers: {headers}")
        print(f"Total data rows: {len(data_rows)}")
        
        # Find column indexes
        # Fixed column indexes based on your requirements:
        # Column C (index 2) = ผลิตภัณฑ์ที่สนใจ
        # Column F (index 5) = ชื่อ
        # Column G (index 6) = เบอร์โทร
        # Column H (index 7) = หมายเหตุ
        # Column AS (index 44) = status_call
        
        product_idx = 2  # Column C
        name_idx = 5     # Column F
        phone_idx = 6    # Column G
        remarks_idx = 7  # Column H
        status_call_idx = 44  # Column AS
        
        print(f"\n=== MAPPING COLUMNS (FIXED INDEXES) ===")
        print(f"Column C (index 2) = ผลิตภัณฑ์ที่สนใจ: '{headers[product_idx] if len(headers) > product_idx else 'N/A'}'")
        print(f"Column F (index 5) = ชื่อ: '{headers[name_idx] if len(headers) > name_idx else 'N/A'}'")
        print(f"Column G (index 6) = เบอร์โทร: '{headers[phone_idx] if len(headers) > phone_idx else 'N/A'}'")
        print(f"Column H (index 7) = หมายเหตุ: '{headers[remarks_idx] if len(headers) > remarks_idx else 'N/A'}'")
        print(f"Column AS (index 44) = status_call: '{headers[status_call_idx] if len(headers) > status_call_idx else 'N/A'}'")
        
        if len(headers) <= status_call_idx:
            print(f"❌ Headers only have {len(headers)} columns, AS (44) not found")
            return jsonify({
                'success': False,
                'error': f'Column AS not found. Only {len(headers)} columns available.',
                'availableHeaders': headers
            }), 400
        
        # Check first few data rows for column AS to see status values
        print(f"\n📊 Sample data from columns:")
        for idx in range(min(5, len(data_rows))):
            if len(data_rows[idx]) > 0:
                row = data_rows[idx]
                print(f"  Row {idx + 2}:")
                print(f"    - ผลิตภัณฑ์: '{row[product_idx] if len(row) > product_idx else ''}'")
                print(f"    - ชื่อ: '{row[name_idx] if len(row) > name_idx else ''}'")
                print(f"    - เบอร์: '{row[phone_idx] if len(row) > phone_idx else ''}'")
                print(f"    - หมายเหตุ: '{row[remarks_idx] if len(row) > remarks_idx else ''}'")
                print(f"    - สถานะ: '{row[status_call_idx] if len(row) > status_call_idx else ''}'")
        
        # Filter data with status "อยู่ระหว่างโทรออก"
        outgoing_calls = []
        status_values = set()
        
        for idx, row in enumerate(data_rows):
            if not row or len(row) == 0:
                continue
            
            # Get values safely (handle if row is shorter than expected)
            status = row[status_call_idx].strip() if len(row) > status_call_idx and row[status_call_idx] else ""
            product = row[product_idx].strip() if len(row) > product_idx and row[product_idx] else ""
            name = row[name_idx].strip() if len(row) > name_idx and row[name_idx] else ""
            phone = row[phone_idx].strip() if len(row) > phone_idx and row[phone_idx] else ""
            remarks = row[remarks_idx].strip() if len(row) > remarks_idx and row[remarks_idx] else ""
            
            # Collect all status values for debugging
            if status:
                status_values.add(status)
            
            # Filter by status "อยู่ระหว่างโทรออก"
            if status == "อยู่ระหว่างโทรออก" and phone and phone != "-":
                outgoing_calls.append({
                    'id': f'film-{idx + 2}',
                    'customerName': name if name else phone,
                    'phoneNumber': phone,
                    'product': product,
                    'remarks': remarks,
                    'status': 'outgoing',  # Map to frontend status
                    'contactDate': datetime.now().isoformat()
                })
                print(f"✅ Row {idx + 2}: {name or 'No name'} - {phone} - {product} ({status})")
        
        print(f"\n=== UNIQUE STATUS VALUES FOUND ===")
        print(f"Total unique statuses: {len(status_values)}")
        print(f"Status values: {sorted(status_values)}")
        print(f"\n=== RESULTS ===")
        print(f"Total outgoing calls: {len(outgoing_calls)}")
        
        return jsonify({
            'success': True,
            'data': outgoing_calls,
            'total': len(outgoing_calls),
            'timestamp': datetime.now().isoformat(),
            'debug': {
                'totalRows': len(data_rows),
                'matchedRows': len(outgoing_calls),
                'columns': {
                    'product': f"Column C (index {product_idx}): {headers[product_idx] if len(headers) > product_idx else 'N/A'}",
                    'name': f"Column F (index {name_idx}): {headers[name_idx] if len(headers) > name_idx else 'N/A'}",
                    'phone': f"Column G (index {phone_idx}): {headers[phone_idx] if len(headers) > phone_idx else 'N/A'}",
                    'remarks': f"Column H (index {remarks_idx}): {headers[remarks_idx] if len(headers) > remarks_idx else 'N/A'}",
                    'status': f"Column AS (index {status_call_idx}): {headers[status_call_idx] if len(headers) > status_call_idx else 'N/A'}"
                },
                'uniqueStatuses': sorted(list(status_values))
            }
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/film-dev', methods=['GET'])
def get_film_dev_data():
    """Get Film_dev consult data with status 'นัด Consult (VDO)'"""
    try:
        # Get date parameter (optional)
        target_date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        print(f"\n=== FETCHING FILM_DEV DATA ===")
        print(f"Target date: {target_date}")
        
        # Get Google Sheets service
        service = get_sheets_service()
        sheet = service.spreadsheets()
        
        # Fetch data from Film_dev sheet
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range='Film_dev!A:Z'
        ).execute()
        
        values = result.get('values', [])
        
        if not values:
            return jsonify({
                'success': True,
                'date': target_date,
                'agentCounts': {},
                'totalCount': 0
            })
        
        # First row is header
        headers = values[0]
        data_rows = values[1:]
        
        print(f"Total columns: {len(headers)}")
        print(f"Headers: {headers[:10]}...")  # Show first 10 headers
        print(f"Total data rows: {len(data_rows)}")
        
        # Find column indices
        status_idx = -1
        contact_person_idx = -1
        
        for idx, header in enumerate(headers):
            header_lower = str(header).lower().strip()
            if 'สถานะ' in header_lower:
                status_idx = idx
            if 'ผู้ติดต่อ' in header_lower:
                contact_person_idx = idx
        
        print(f"\nColumn indices:")
        print(f"  สถานะ: {status_idx} ({headers[status_idx] if status_idx != -1 else 'NOT FOUND'})")
        print(f"  ผู้ติดต่อ: {contact_person_idx} ({headers[contact_person_idx] if contact_person_idx != -1 else 'NOT FOUND'})")
        
        if status_idx == -1 or contact_person_idx == -1:
            return jsonify({
                'success': False,
                'error': 'Required columns (สถานะ, ผู้ติดต่อ) not found',
                'availableHeaders': headers
            }), 500
        
        # Agent name mapping
        agent_name_map = {
            'สา': '101',
            'พัชชา': '102',
            'ตั้งโอ๋': '103',
            'Test': '104',
            'จีน': '105',
            'มุก': '106',
            'เจ': '107',
            'ว่าน': '108'
        }
        
        # Initialize agent counts
        agent_counts = {agent_id: 0 for agent_id in agent_name_map.values()}
        
        matched_rows = 0
        
        # Process each row
        for idx, row in enumerate(data_rows):
            if not row or len(row) == 0:
                continue
            
            # Get values safely
            status = row[status_idx].strip() if len(row) > status_idx and row[status_idx] else ""
            contact_person = row[contact_person_idx].strip() if len(row) > contact_person_idx and row[contact_person_idx] else ""
            
            # Debug first 5 rows
            if idx < 5:
                print(f"\n🔍 Debug Row {idx + 2}:")
                print(f"  สถานะ: {status}")
                print(f"  ผู้ติดต่อ: {contact_person}")
            
            if not status or not contact_person:
                continue
            
            # Check if status matches "นัด Consult (VDO)" OR "นัด Consult"
            is_consult_vdo = status == "นัด Consult (VDO)"
            is_consult = status == "นัด Consult"
            
            if not (is_consult_vdo or is_consult):
                continue
            
            # Find agent ID from contact person
            matched_agent_id = None
            
            # First try to match by agent ID (101-108)
            for agent_id in agent_name_map.values():
                if agent_id in contact_person:
                    matched_agent_id = agent_id
                    break
            
            # If not found, try to match by agent name
            if not matched_agent_id:
                for agent_name, agent_id in agent_name_map.items():
                    if agent_name in contact_person:
                        matched_agent_id = agent_id
                        break
            
            if matched_agent_id:
                agent_counts[matched_agent_id] += 1
                matched_rows += 1
                if matched_rows <= 10:  # Show first 10 matches
                    print(f"✅ Row {idx + 2}: {contact_person} ({matched_agent_id}) - สถานะ: {status}")
        
        total_count = sum(agent_counts.values())
        
        print(f"\n=== RESULTS ===")
        print(f"Matched rows: {matched_rows}")
        print(f"Agent counts: {agent_counts}")
        print(f"Total count: {total_count}")
        
        return jsonify({
            'success': True,
            'date': target_date,
            'agentCounts': agent_counts,
            'totalCount': total_count,
            'debug': {
                'totalRows': len(data_rows),
                'matchedRows': matched_rows,
                'contactPersonColumn': headers[contact_person_idx],
                'statusColumn': headers[status_idx]
            }
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Check if required environment variables are set
    required_vars = [
        'GOOGLE_SPREADSHEET_ID',
        'GOOGLE_SERVICE_ACCOUNT_EMAIL',
        'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please create a .env file with the required variables")
        exit(1)
    
    print("🚀 Starting Flask API server...")
    print(f"📊 Spreadsheet ID: {SPREADSHEET_ID}")
    app.run(host='0.0.0.0', port=5000, debug=True)
