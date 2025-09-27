import json
import os
import psycopg2
from typing import Dict, Any, List
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Export leads data to Google Sheets with parent name, child name, age, phone, username
    Args: event - dict with httpMethod (POST for export)
          context - object with request_id, function_name attributes
    Returns: HTTP response with export status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Get Google Sheets credentials
        service_account_json = os.environ.get('GOOGLE_SHEETS_SERVICE_ACCOUNT')
        if not service_account_json:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Google Sheets credentials not configured',
                    'details': 'Добавьте секрет GOOGLE_SHEETS_SERVICE_ACCOUNT в настройках проекта',
                    'setup_required': True
                })
            }
        
        credentials_info = json.loads(service_account_json)
        credentials = Credentials.from_service_account_info(
            credentials_info,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        
        # Build Google Sheets service
        service = build('sheets', 'v4', credentials=credentials)
        
        # Google Sheets ID from the provided URL
        spreadsheet_id = '13qDlzyvsrX2qInjp8EJ8wGSNshUkhb_D_ePNg12R1gQ'
        
        # Connect to database and get leads data
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database URL not configured'})
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Check if this is a full export (manual) or auto-export (add only new)
        query_params = event.get('queryStringParameters') or {}
        auto_export = query_params.get('auto', '').lower() == 'true'
        
        # Get leads with user information
        # Note: using video_leads table since that's where the actual data is stored
        cursor.execute("""
            SELECT 
                l.title as parent_name,
                l.comments as child_info,
                '' as child_age,
                '' as phone,
                u.name as username
            FROM video_leads l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
        """)
        
        leads_data = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not leads_data:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'No leads data to export', 'exported_count': 0})
            }
        
        if auto_export and leads_data:
            # Auto-export: добавляем только последний лид
            latest_lead = leads_data[0]  # Leads sorted by created_at DESC
            parent_name, child_info, child_age, phone, username = latest_lead
            
            # Добавляем в конец таблицы
            new_row = [
                parent_name or '',
                child_info or '',
                str(child_age) if child_age else '',
                phone or '',
                username or ''
            ]
            
            body = {
                'values': [new_row]
            }
            
            result = service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range='A:E',
                valueInputOption='RAW',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()
            
            updated_cells = result.get('updates', {}).get('updatedCells', 0)
            
        else:
            # Полный экспорт: перезаписываем всю таблицу
            # Header row
            values = [['Имя родителя', 'Информация о ребенке', 'Возраст ребенка', 'Телефон', 'Имя пользователя']]
            
            # Add leads data
            for lead in leads_data:
                parent_name, child_info, child_age, phone, username = lead
                values.append([
                    parent_name or '',
                    child_info or '',
                    str(child_age) if child_age else '',
                    phone or '',
                    username or ''
                ])
            
            # Clear existing data and write new data
            service.spreadsheets().values().clear(
                spreadsheetId=spreadsheet_id,
                range='A:E'
            ).execute()
            
            # Write new data
            body = {
                'values': values
            }
            
            result = service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range='A1:E' + str(len(values)),
                valueInputOption='RAW',
                body=body
            ).execute()
            
            updated_cells = result.get('updatedCells', 0)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Data exported successfully to Google Sheets',
                'exported_count': len(leads_data),
                'updated_cells': updated_cells,
                'spreadsheet_id': spreadsheet_id
            })
        }
        
    except HttpError as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': f'Google Sheets API error: {str(e)}',
                'details': 'Check if the service account has access to the spreadsheet'
            })
        }
    except psycopg2.Error as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    except json.JSONDecodeError as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Invalid Google Sheets credentials format: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Unexpected error: {str(e)}'})
        }