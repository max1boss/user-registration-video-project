import json
import os
import jwt
import psycopg2
from typing import Dict, Any, Optional
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def handle_google_sheets_export(cursor) -> Dict[str, Any]:
    '''Handle Google Sheets export functionality'''
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
        
        # Get leads with user information
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
        
        if not leads_data:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'No leads data to export', 'exported_count': 0})
            }
        
        # Full export: rewrite entire table
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
        body = {'values': values}
        
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
            'body': json.dumps({'error': f'Export error: {str(e)}'})
        }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin panel API for viewing all user data and videos
    Args: event with httpMethod, headers with X-Auth-Token
    Returns: All users data with their videos and comments
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'isBase64Encoded': False,
            'body': ''
        }
    
    if method not in ['GET', 'POST']:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Get auth token from headers
        headers = event.get('headers', {})
        auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
        
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Authentication token required'})
            }
        
        # Verify JWT token and check admin role
        jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
        
        try:
            payload = jwt.decode(auth_token, jwt_secret, algorithms=['HS256'])
            user_role = payload.get('role')
            
            if user_role != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Access denied. Admin role required'})
                }
        except jwt.InvalidTokenError:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Invalid token'})
            }
        
        # Connect to database
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Handle POST request for Google Sheets export
        if method == 'POST':
            return handle_google_sheets_export(cursor)
        
        # Handle GET request for admin data
        # Get all users with their leads
        cursor.execute("""
            SELECT 
                u.id as user_id,
                u.name as user_name, 
                u.email as user_email,
                u.created_at as user_created_at,
                vl.id as lead_id,
                vl.title as lead_title,
                vl.comments as lead_comments,
                vl.created_at as lead_created_at,
                vl.video_filename
            FROM users u
            LEFT JOIN video_leads vl ON u.id = vl.user_id
            ORDER BY u.created_at DESC, vl.created_at DESC
        """)
        
        results = cursor.fetchall()
        
        # Organize data by users
        users_data = {}
        
        for row in results:
            user_id, user_name, user_email, user_created_at, lead_id, lead_title, lead_comments, lead_created_at, video_filename = row
            
            # Create user entry if not exists
            if user_id not in users_data:
                users_data[user_id] = {
                    'id': user_id,
                    'name': user_name,
                    'email': user_email,
                    'created_at': user_created_at.isoformat() if user_created_at else None,
                    'leads': []
                }
            
            # Add lead if exists
            if lead_id:
                lead_data = {
                    'id': lead_id,
                    'title': lead_title,
                    'comments': lead_comments,
                    'created_at': lead_created_at.isoformat() if lead_created_at else None,
                    'audio_filename': video_filename,
                    'has_audio': bool(video_filename)
                }
                users_data[user_id]['leads'].append(lead_data)
        
        # Convert to list
        users_list = list(users_data.values())
        
        # Get total statistics
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM video_leads")
        total_leads = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM video_leads WHERE video_filename IS NOT NULL")
        total_audios = cursor.fetchone()[0]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'statistics': {
                    'total_users': total_users,
                    'total_leads': total_leads,
                    'total_audios': total_audios
                },
                'users': users_list
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()