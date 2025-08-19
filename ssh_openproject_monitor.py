#!/usr/bin/env python3
import re
import subprocess
import json
import logging
import socket
import psutil
import shutil
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
import geoip2.database
import folium
import os
from collections import defaultdict, Counter

app = Flask(__name__)
CORS(app)  # Habilitar CORS para permitir peticiones desde React

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/opt/ssh-monitor/app.log'),
        logging.StreamHandler()
    ]
)

def load_trusted_ips():
    """Load trusted IPs from JSON file"""
    try:
        with open('/opt/ssh-monitor/trusted_ips.json', 'r') as f:
            return json.load(f)
    except:
        return {}

def get_geo_info(ip):
    """Get geographical information for an IP address"""
    try:
        if ip in ['127.0.0.1', 'localhost', '::1']:
            return {'country': 'Local', 'city': 'localhost', 'lat': 0, 'lon': 0}
        
        with geoip2.database.Reader('/opt/ssh-monitor/GeoLite2-City.mmdb') as reader:
            response = reader.city(ip)
            return {
                'country': response.country.name or 'Unknown',
                'city': response.city.name or 'Unknown',
                'lat': float(response.location.latitude or 0),
                'lon': float(response.location.longitude or 0)
            }
    except:
        return {'country': 'Unknown', 'city': 'Unknown', 'lat': 0, 'lon': 0}

def run_command(command):
    """Execute a shell command and return output"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
        return result.stdout.strip()
    except:
        return ""

def get_ssh_log_entries(hours=24):
    """Get SSH log entries from the last N hours - FIXED VERSION"""
    try:
        since_time = datetime.now() - timedelta(hours=hours)
        since_str = since_time.strftime('%Y-%m-%d %H:%M:%S')
        
        cmd = f"journalctl --since '{since_str}' --no-pager | grep sshd"
        output = run_command(cmd)
        
        entries = []
        for line in output.split('\n'):
            if line.strip():
                # Parse different SSH log patterns
                if 'Failed password' in line or 'Invalid user' in line:
                    match = re.search(r'from (\d+\.\d+\.\d+\.\d+)', line)
                    if match:
                        ip = match.group(1)
                        user_match = re.search(r'user (\w+)', line) or re.search(r'for (\w+)', line)
                        user = user_match.group(1) if user_match else 'unknown'
                        
                        timestamp_match = re.search(r'(\w{3} \d{1,2} \d{2}:\d{2}:\d{2})', line)
                        timestamp = timestamp_match.group(1) if timestamp_match else 'unknown'
                        
                        entries.append({
                            'type': 'attack',
                            'ip': ip,
                            'user': user,
                            'timestamp': timestamp,
                            'service': 'SSH',
                            'raw': line
                        })
                        
                elif 'Accepted' in line and ('password' in line or 'publickey' in line):
                    match = re.search(r'from (\d+\.\d+\.\d+\.\d+)', line)
                    if match:
                        ip = match.group(1)
                        user_match = re.search(r'for (\w+)', line)
                        user = user_match.group(1) if user_match else 'unknown'
                        
                        auth_type = 'publickey' if 'publickey' in line else 'password'
                        
                        timestamp_match = re.search(r'(\w{3} \d{1,2} \d{2}:\d{2}:\d{2})', line)
                        timestamp = timestamp_match.group(1) if timestamp_match else 'unknown'
                        
                        entries.append({
                            'type': 'success',
                            'ip': ip,
                            'user': user,
                            'auth_type': auth_type,
                            'timestamp': timestamp,
                            'service': 'SSH',
                            'raw': line
                        })
                        
        logging.info(f"SSH logs processed: {len(entries)} entries found")
        return entries
    except Exception as e:
        logging.error(f"Error getting SSH log entries: {e}")
        return []

def get_openproject_logs(hours=24):
    """Get OpenProject log entries from the last N hours"""
    try:
        # Get OpenProject container logs
        cmd = f"docker logs openproject --since {hours}h --timestamps"
        output = run_command(cmd)
        
        entries = []
        user_sessions = {}
        
        for line in output.split('\n'):
            if line.strip() and 'INFO --' in line:
                # Parse OpenProject request logs
                if 'duration=' in line and 'status=' in line and 'method=' in line:
                    try:
                        # Extract key information
                        duration_match = re.search(r'duration=([0-9.]+)', line)
                        status_match = re.search(r'status=(\d+)', line)
                        method_match = re.search(r'method=(\w+)', line)
                        path_match = re.search(r'path=([^\s]+)', line)
                        host_match = re.search(r'host=([^\s]+)', line)
                        user_match = re.search(r'user=(\d+)', line)
                        timestamp_match = re.search(r'\[([0-9-T:.]+) #', line)
                        
                        if status_match and method_match:
                            duration = float(duration_match.group(1)) if duration_match else 0
                            status = int(status_match.group(1))
                            method = method_match.group(1)
                            path = path_match.group(1) if path_match else 'unknown'
                            host = host_match.group(1) if host_match else 'unknown'
                            user_id = user_match.group(1) if user_match else 'anonymous'
                            timestamp = timestamp_match.group(1) if timestamp_match else 'unknown'
                            
                            # Use simulated IP mapping for realistic geographical data
                            # This is a temporary solution until real IP capture is configured
                            simulated_ips = {
                                "1": "127.0.0.1",          # System user
                                "2": "127.0.0.1",          # Anonymous user  
                                "3": "142.111.25.137",     # You (SurfShark VPN)
                                "4": "187.190.45.122",     # Carlos Diaz (Mexico/Venezuela region)
                                "5": "201.249.78.89",      # Cesar Celis (Venezuela/Colombia region)
                                "6": "190.202.156.43",     # Samantha Hernandez (Venezuela region)
                                "7": "45.137.194.210",     # Carlos Polanco (Server IP - local access)
                            }
                            
                            # Override IP with simulated one if user is known
                            if user_id in simulated_ips:
                                ip = simulated_ips[user_id]
                            elif user_id != 'anonymous':
                                # Fallback pattern for unknown users
                                try:
                                    uid_num = int(user_id)
                                    ip = f"192.168.1.{uid_num + 100}"
                                except:
                                    ip = 'unknown'
                            
                            # Track user sessions
                            if user_id != 'anonymous':
                                user_sessions[user_id] = {
                                    'user_id': user_id,
                                    'host': host,
                                    'ip': ip,
                                    'last_activity': timestamp,
                                    'requests': user_sessions.get(user_id, {}).get('requests', 0) + 1
                                }
                            
                            entries.append({
                                'type': 'access',
                                'ip': ip,
                                'host': host,
                                'user_id': user_id,
                                'method': method,
                                'path': path,
                                'status': status,
                                'duration': duration,
                                'timestamp': timestamp,
                                'service': 'OpenProject',
                                'raw': line
                            })
                    except Exception as e:
                        logging.error(f"Error parsing OpenProject log line: {e}")
                        continue
        
        logging.info(f"OpenProject logs processed: {len(entries)} entries, {len(user_sessions)} users found")
        return entries, list(user_sessions.values())
        
    except Exception as e:
        logging.error(f"Error getting OpenProject logs: {e}")
        return [], []

def get_active_web_connections():
    """Get currently active web connections (HTTP/HTTPS)"""
    connections = []
    trusted_ips = load_trusted_ips()
    
    try:
        # Get HTTP connections (port 80)
        http_output = run_command("netstat -tn | grep ':80 ' | grep ESTABLISHED")
        for line in http_output.split('\n'):
            if line.strip():
                parts = line.split()
                if len(parts) >= 5:
                    try:
                        local_addr = parts[3]
                        remote_addr = parts[4]
                        
                        remote_ip, remote_port = remote_addr.rsplit(':', 1)
                        local_port = local_addr.split(':')[-1]
                        
                        if remote_ip not in ['127.0.0.1', '::1']:
                            geo_info = get_geo_info(remote_ip)
                            is_trusted = remote_ip in trusted_ips.get('ips', [])
                            
                            connections.append({
                                'remote_ip': remote_ip,
                                'remote_port': remote_port,
                                'local_port': local_port,
                                'protocol': 'HTTP',
                                'service': 'OpenProject',
                                'country': geo_info['country'],
                                'is_trusted': is_trusted,
                                'connection_time': 'Activa'
                            })
                    except:
                        continue
        
        # Get HTTPS connections (port 443)
        https_output = run_command("netstat -tn | grep ':443 ' | grep ESTABLISHED")
        for line in https_output.split('\n'):
            if line.strip():
                parts = line.split()
                if len(parts) >= 5:
                    try:
                        local_addr = parts[3]
                        remote_addr = parts[4]
                        
                        remote_ip, remote_port = remote_addr.rsplit(':', 1)
                        local_port = local_addr.split(':')[-1]
                        
                        if remote_ip not in ['127.0.0.1', '::1']:
                            geo_info = get_geo_info(remote_ip)
                            is_trusted = remote_ip in trusted_ips.get('ips', [])
                            
                            connections.append({
                                'remote_ip': remote_ip,
                                'remote_port': remote_port,
                                'local_port': local_port,
                                'protocol': 'HTTPS',
                                'service': 'OpenProject',
                                'country': geo_info['country'],
                                'is_trusted': is_trusted,
                                'connection_time': 'Activa'
                            })
                    except:
                        continue
                        
    except Exception as e:
        logging.error(f"Error getting web connections: {e}")
    
    logging.info(f"Active web connections: {len(connections)}")
    return connections

def get_active_ssh_sessions():
    """Get currently active SSH sessions"""
    sessions_data = {
        'user_sessions': [],
        'network_connections': []
    }
    
    trusted_ips = load_trusted_ips()
    
    try:
        # Get SSH network connections using netstat for multiple SSH ports (22, 2234, 2222, etc.)
        ssh_ports = ['22', '2234', '2222', '22222']  # Common SSH ports
        all_connections = []
        
        for port in ssh_ports:
            netstat_output = run_command(f"netstat -tn | grep ':{port} ' | grep ESTABLISHED")
            if netstat_output:
                all_connections.extend(netstat_output.split('\n'))
        
        for line in all_connections:
            if line.strip() and 'ESTABLISHED' in line:
                parts = line.split()
                if len(parts) >= 5:
                    try:
                        local_addr = parts[3]
                        remote_addr = parts[4]
                        
                        remote_ip, remote_port = remote_addr.rsplit(':', 1)
                        local_port = local_addr.split(':')[-1]
                        
                        if remote_ip not in ['127.0.0.1', '::1']:
                            # Check if this IP already has a user session (avoid duplicating)
                            existing_user_session = any(s.get('ip') == remote_ip for s in sessions_data['user_sessions'])
                            if not existing_user_session:
                                geo_info = get_geo_info(remote_ip)
                                is_trusted = remote_ip in trusted_ips.get('ips', [])
                                
                                sessions_data['network_connections'].append({
                                    'remote_ip': remote_ip,
                                    'remote_port': remote_port,
                                    'local_port': local_port,
                                    'service': 'SSH (Network)',
                                    'country': geo_info['country'],
                                    'is_trusted': is_trusted,
                                    'connection_time': 'Activa'
                                })
                    except Exception as e:
                        logging.error(f"Error parsing SSH connection: {e}")
                        continue
        
        # Try to get user sessions from 'w' command and 'who' command
        w_output = run_command("w")
        who_output = run_command("who")
        
        # Parse 'w' command output
        lines = w_output.split('\n')
        for line in lines[2:]:  # Skip header lines
            if line.strip() and not line.startswith('USER'):
                parts = line.split()
                if len(parts) >= 3:
                    user = parts[0]
                    tty = parts[1] if parts[1] != '' else 'notty'
                    from_info = parts[2] if parts[2] != '' else 'local'
                    login_time = parts[3] if len(parts) > 3 else 'unknown'
                    
                    # Extract IP from various formats
                    from_ip = from_info
                    if ':' in from_info and '.' in from_info:
                        # Format like "142.111.25.137:50234" 
                        from_ip = from_info.split(':')[0]
                    
                    if re.match(r'^\d+\.\d+\.\d+\.\d+$', from_ip):
                        geo_info = get_geo_info(from_ip)
                        is_trusted = from_ip in trusted_ips.get('ips', [])
                        
                        # Determinar el tipo de conexión basado en el terminal
                        connection_type = 'SSH'
                        if tty == 'notty':
                            connection_type = 'SSH (VSCode/SCP)'
                        elif tty.startswith('pts/'):
                            connection_type = 'SSH (Terminal)'
                        
                        sessions_data['user_sessions'].append({
                            'user': user,
                            'terminal': tty,
                            'login_time': login_time,
                            'ip': from_ip,
                            'service': connection_type,
                            'country': geo_info['country'],
                            'is_trusted': is_trusted,
                            'full_connection': from_info
                        })
        
        # Also try 'who' command for additional session info
        who_lines = who_output.split('\n')
        for line in who_lines:
            if line.strip() and '(' in line and ')' in line:
                # Format: "root     pts/0        2024-08-17 10:18 (142.111.25.137)"
                parts = re.split(r'\s+', line.strip())
                if len(parts) >= 4:
                    user = parts[0]
                    tty = parts[1]
                    
                    # Extract IP from parentheses
                    ip_match = re.search(r'\(([^)]+)\)', line)
                    if ip_match:
                        from_ip = ip_match.group(1)
                        
                        # Extract time info
                        time_match = re.search(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2})', line)
                        login_time = time_match.group(1) if time_match else 'unknown'
                        
                        if re.match(r'^\d+\.\d+\.\d+\.\d+$', from_ip):
                            # Check if this session is already added (avoid duplicates from w and who commands)
                            session_key = f"{user}_{tty}_{from_ip}"
                            existing = any(s.get('session_key') == session_key for s in sessions_data['user_sessions'])
                            if not existing:
                                geo_info = get_geo_info(from_ip)
                                is_trusted = from_ip in trusted_ips.get('ips', [])
                                
                                # Determinar el tipo de conexión
                                connection_type = 'SSH'
                                if tty == 'notty':
                                    connection_type = 'SSH (VSCode/SCP)'
                                elif tty.startswith('pts/'):
                                    connection_type = 'SSH (Terminal)'
                                
                                sessions_data['user_sessions'].append({
                                    'user': user,
                                    'terminal': tty,
                                    'login_time': login_time,
                                    'ip': from_ip,
                                    'service': connection_type,
                                    'country': geo_info['country'],
                                    'is_trusted': is_trusted,
                                    'session_key': session_key
                                })
        
        # Consolidate sessions: merge user sessions with network connections
        # Keep different types of connections separate even from same IP
        consolidated_sessions = []
        
        # Add all user sessions (these are more detailed)
        for user_session in sessions_data['user_sessions']:
            consolidated_sessions.append({
                'type': 'user_session',
                'user': user_session['user'],
                'terminal': user_session['terminal'],
                'login_time': user_session['login_time'],
                'ip': user_session['ip'],
                'service': user_session['service'],
                'country': user_session['country'],
                'is_trusted': user_session['is_trusted'],
                'connection_status': 'Activa',
                'connection_id': f"{user_session['ip']}_{user_session['terminal']}_{user_session['user']}"
            })
        
        # Add network connections that provide additional information
        # Show network connections as separate entries to give complete view
        for net_conn in sessions_data['network_connections']:
            # Create a unique identifier for this network connection
            net_id = f"{net_conn['remote_ip']}_port{net_conn['local_port']}_net"
            
            # Always add network connections but with clear labeling
            # This helps show VSCode connections vs terminal connections
            consolidated_sessions.append({
                'type': 'network_connection',
                'user': 'Network Port',
                'terminal': f"port:{net_conn['remote_port']}→{net_conn['local_port']}",
                'login_time': 'N/A',
                'ip': net_conn['remote_ip'],
                'service': net_conn['service'],
                'country': net_conn['country'],
                'is_trusted': net_conn['is_trusted'],
                'connection_status': net_conn['connection_time'],
                'remote_port': net_conn['remote_port'],
                'connection_id': net_id
            })
        
        # Update the return structure
        sessions_data['consolidated_sessions'] = consolidated_sessions
        total_connections = len(consolidated_sessions)
        logging.info(f"Active SSH sessions: {total_connections} total (consolidated from {len(sessions_data['user_sessions'])} users + {len(sessions_data['network_connections'])} connections)")
        
    except Exception as e:
        logging.error(f"Error getting SSH sessions: {e}")
    
    return sessions_data

def get_fail2ban_status():
    """Get fail2ban status and banned IPs"""
    try:
        # Get banned IPs
        banned_output = run_command("fail2ban-client status sshd | grep 'Banned IP list'")
        banned_ips = []
        
        if banned_output:
            ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
            ips = re.findall(ip_pattern, banned_output)
            
            for ip in ips:
                geo_info = get_geo_info(ip)
                banned_ips.append({
                    'ip': ip,
                    'country': geo_info['country']
                })
        
        jail_output = run_command("fail2ban-client status sshd")
        
        stats = {
            'jail_status': 'Activo' if jail_output else 'Inactivo',
            'total_banned': len(banned_ips)
        }
        
        return {
            'banned_ips': banned_ips,
            'stats': stats
        }
        
    except Exception as e:
        logging.error(f"Error getting fail2ban status: {e}")
        return {'banned_ips': [], 'stats': {'jail_status': 'Error', 'total_banned': 0}}

def get_openproject_users_from_db():
    """Get real user names from OpenProject database"""
    try:
        cmd = 'docker exec op_db psql -U postgres -d openproject -t -c "SELECT id, login, firstname, lastname, mail, status, last_login_on FROM users WHERE status = 1;"'
        output = run_command(cmd)
        
        users = {}
        for line in output.split('\n'):
            if line.strip() and '|' in line:
                parts = [p.strip() for p in line.split('|')]
                if len(parts) >= 7:
                    try:
                        user_id = int(parts[0])
                        login = parts[1] if parts[1] else f"user_{user_id}"
                        firstname = parts[2] if parts[2] else ""
                        lastname = parts[3] if parts[3] else ""
                        email = parts[4] if parts[4] else ""
                        last_login = parts[6] if parts[6] else None
                        
                        # Create display name
                        if firstname and lastname:
                            display_name = f"{firstname} {lastname}"
                        elif login:
                            display_name = login
                        else:
                            display_name = f"User {user_id}"
                        
                        users[user_id] = {
                            'id': user_id,
                            'login': login,
                            'display_name': display_name,
                            'email': email,
                            'last_login': last_login
                        }
                    except (ValueError, IndexError):
                        continue
        
        logging.info(f"OpenProject users loaded: {len(users)} users")
        return users
        
    except Exception as e:
        logging.error(f"Error getting OpenProject users from DB: {e}")
        return {}

def get_openproject_failed_logins(hours=24):
    """Get OpenProject failed login attempts from logs"""
    try:
        since_time = datetime.now() - timedelta(hours=hours)
        since_hours = f"{hours}h"
        
        cmd = f"docker logs openproject --since={since_hours} | grep 'Failed login'"
        output = run_command(cmd)
        
        failed_logins = []
        for line in output.split('\n'):
            if line.strip() and 'Failed login' in line:
                # Parse: Failed login for 'username' from IP at timestamp
                try:
                    user_match = re.search(r"Failed login for '([^']+)'", line)
                    ip_match = re.search(r'from (\d+\.\d+\.\d+\.\d+)', line)
                    time_match = re.search(r'at ([0-9-]+ [0-9:]+)', line)
                    
                    if user_match and ip_match:
                        username = user_match.group(1)
                        ip = ip_match.group(1)
                        timestamp = time_match.group(1) if time_match else 'unknown'
                        
                        geo_info = get_geo_info(ip)
                        
                        failed_logins.append({
                            'username': username,
                            'ip': ip,
                            'timestamp': timestamp,
                            'country': geo_info['country'],
                            'service': 'OpenProject'
                        })
                except Exception as e:
                    logging.error(f"Error parsing failed login line: {e}")
                    continue
        
        logging.info(f"OpenProject failed logins: {len(failed_logins)} attempts")
        return failed_logins
        
    except Exception as e:
        logging.error(f"Error getting OpenProject failed logins: {e}")
        return []

def get_openproject_successful_logins(hours=24):
    """Get OpenProject successful logins from database"""
    try:
        since_time = datetime.now() - timedelta(hours=hours)
        since_str = since_time.strftime('%Y-%m-%d %H:%M:%S')
        
        cmd = f'docker exec op_db psql -U postgres -d openproject -t -c "SELECT id, login, firstname, lastname, last_login_on FROM users WHERE status = 1 AND last_login_on >= \'{since_str}\';"'
        output = run_command(cmd)
        
        successful_logins = []
        for line in output.split('\n'):
            if line.strip() and '|' in line:
                parts = [p.strip() for p in line.split('|')]
                if len(parts) >= 5:
                    try:
                        user_id = int(parts[0])
                        login = parts[1] if parts[1] else f"user_{user_id}"
                        firstname = parts[2] if parts[2] else ""
                        lastname = parts[3] if parts[3] else ""
                        last_login = parts[4] if parts[4] else ""
                        
                        # Create display name
                        if firstname and lastname:
                            display_name = f"{firstname} {lastname}"
                        elif login:
                            display_name = login
                        else:
                            display_name = f"User {user_id}"
                        
                        successful_logins.append({
                            'user_id': user_id,
                            'username': display_name,
                            'login': login,
                            'last_login': last_login,
                            'service': 'OpenProject'
                        })
                    except (ValueError, IndexError):
                        continue
        
        logging.info(f"OpenProject successful logins: {len(successful_logins)} users")
        return successful_logins
        
    except Exception as e:
        logging.error(f"Error getting OpenProject successful logins: {e}")
        return []

def get_openproject_active_users(hours=1):
    """Get currently active OpenProject users from recent logs"""
    try:
        since_hours = f"{hours}h"
        cmd = f"docker logs openproject --since={since_hours} | grep 'user=' | tail -100"
        output = run_command(cmd)
        
        # Get user database for name resolution
        users_db = get_openproject_users_from_db()
        
        active_users = {}
        user_ips = {}
        
        # IP simulation mapping for users (temporary solution)
        # This simulates realistic IPs for different users until real IP capture is configured
        simulated_ips = {
            1: "127.0.0.1",          # System user
            2: "127.0.0.1",          # Anonymous user  
            3: "142.111.25.137",     # You (SurfShark VPN)
            4: "187.190.45.122",     # Carlos Diaz (Mexico/Venezuela region)
            5: "201.249.78.89",      # Cesar Celis (Venezuela/Colombia region)
            6: "190.202.156.43",     # Samantha Hernandez (Venezuela region)
            7: "45.137.194.210",     # Carlos Polanco (Server IP - local access)
        }
        
        for line in output.split('\n'):
            if line.strip() and 'user=' in line:
                try:
                    # Extract user ID
                    user_match = re.search(r'user=(\d+)', line)
                    # Extract timestamp
                    time_match = re.search(r'\[([0-9-T:.]+)', line)
                    
                    if user_match:
                        user_id = int(user_match.group(1))
                        
                        # Skip system users (1=System, 2=Anonymous)
                        if user_id <= 2:
                            continue
                        
                        # Use simulated IP based on user ID
                        ip = simulated_ips.get(user_id, f"192.168.1.{user_id + 100}")  # Fallback pattern
                        
                        timestamp = time_match.group(1) if time_match else 'unknown'
                        
                        # Get user info from database
                        user_info = users_db.get(user_id, {})
                        display_name = user_info.get('display_name', f'User {user_id}')
                        
                        active_users[user_id] = {
                            'user_id': user_id,
                            'username': display_name,
                            'login': user_info.get('login', ''),
                            'last_activity': timestamp,
                            'service': 'OpenProject'
                        }
                        
                        user_ips[user_id] = ip
                            
                except Exception as e:
                    logging.error(f"Error parsing active user line: {e}")
                    continue
        
        # Add IP and geo info to active users
        for user_id, user_data in active_users.items():
            if user_id in user_ips:
                ip = user_ips[user_id]
                user_data['ip'] = ip
                geo_info = get_geo_info(ip)
                user_data['country'] = geo_info['country']
                
                trusted_ips = load_trusted_ips()
                user_data['is_trusted'] = ip in trusted_ips.get('ips', [])
            else:
                user_data['ip'] = 'unknown'
                user_data['country'] = 'Unknown'
                user_data['is_trusted'] = False
        
        active_list = list(active_users.values())
        logging.info(f"OpenProject active users: {len(active_list)} users (using simulated IPs until real IP capture is configured)")
        return active_list
        
    except Exception as e:
        logging.error(f"Error getting OpenProject active users: {e}")
        return []

def detect_potential_intruders():
    """Detect potential security issues in OpenProject"""
    try:
        # Get total registered users
        users_db = get_openproject_users_from_db()
        total_registered = len(users_db)
        
        # Get currently active users
        active_users = get_openproject_active_users(1)
        total_active = len(active_users)
        
        # Check for anomalies
        alerts = []
        
        if total_active > total_registered:
            alerts.append({
                'type': 'critical',
                'message': f'Active users ({total_active}) exceed registered users ({total_registered})',
                'severity': 'high'
            })
        
        if total_active > total_registered * 0.8:  # More than 80% of users active
            alerts.append({
                'type': 'warning',
                'message': f'High user activity: {total_active}/{total_registered} users active',
                'severity': 'medium'
            })
        
        return {
            'total_registered': total_registered,
            'total_active': total_active,
            'alerts': alerts
        }
        
    except Exception as e:
        logging.error(f"Error detecting potential intruders: {e}")
        return {'total_registered': 0, 'total_active': 0, 'alerts': []}

def create_combined_map(ssh_attacks, ssh_successful, openproject_access, active_ssh, active_web):
    """Create a comprehensive map showing SSH and OpenProject activity"""
    try:
        m = folium.Map(location=[20, 0], zoom_start=2)
        trusted_ips = load_trusted_ips()
        
        # Add SSH attack markers (red circles)
        attack_counts = Counter()
        for attack in ssh_attacks[-100:]:
            geo_info = get_geo_info(attack['ip'])
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                attack_counts[(geo_info['lat'], geo_info['lon'], attack['ip'])] += 1
        
        # Forzar alertas de demo para testing (puntos rojos en el mapa)
        demo_coords = [
            (37.751, -97.822, '8.8.8.8'),      # Google DNS - Estados Unidos
            (55.7386, 37.6068, '77.88.8.8'),   # Yandex DNS - Rusia  
            (37.7642, -122.3993, '208.67.222.222') # OpenDNS - San Francisco
        ]
        for lat, lon, ip in demo_coords:
            attack_counts[(lat, lon, ip)] = 15  # 15 intentos
        
        for (lat, lon, ip), count in attack_counts.items():
            folium.CircleMarker(
                location=[lat, lon],
                radius=min(count * 2, 20),
                popup=f"🔴 SSH Ataques desde {ip}<br>Total: {count}",
                color='#dc2626',
                weight=2,
                fill=True,
                fillColor='#ef4444',
                fillOpacity=0.4  # Más translúcido
            ).add_to(m)
        
        # Add SSH successful connections (green circles)
        ssh_success_counts = Counter()
        for conn in ssh_successful[-50:]:
            geo_info = get_geo_info(conn['ip'])
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                ssh_success_counts[(geo_info['lat'], geo_info['lon'], conn['ip'])] += 1
        
        for (lat, lon, ip), count in ssh_success_counts.items():
            is_trusted = ip in trusted_ips.get('ips', [])
            is_admin = ip == '142.111.25.137'  # ⭐ Tu IP especial
            
            if is_admin:
                color = '#6366f1'  # Indigo especial para admin
                fillColor = '#8b5cf6'  # Violeta brillante
                icon = '👑🔥'  # Icono especial de admin
                radius = 10  # Más grande
                popup_text = f"{icon} ADMIN SSH desde {ip}<br>🎯 Acceso Privilegiado"
            elif is_trusted:
                color = '#1d4ed8'
                fillColor = '#3b82f6'
                icon = '🔵'
                radius = 8
                popup_text = f"{icon} SSH Exitosa desde {ip}<br>(IP Confiable)"
            else:
                color = '#059669'
                fillColor = '#10b981'
                icon = '🟢'
                radius = 8
                popup_text = f"{icon} SSH Exitosa desde {ip}"
            
            folium.CircleMarker(
                location=[lat, lon],
                radius=radius,
                popup=popup_text,
                color=color,
                weight=3 if is_admin else 2,
                fill=True,
                fillColor=fillColor,
                fillOpacity=0.7 if is_admin else 0.5  # Admin más visible
            ).add_to(m)
        
        # Add OpenProject access markers (orange triangles)
        op_access_counts = Counter()
        for access in openproject_access[-50:]:
            if access['ip'] != 'unknown':
                geo_info = get_geo_info(access['ip'])
                if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                    op_access_counts[(geo_info['lat'], geo_info['lon'], access['ip'])] += 1
        
        for (lat, lon, ip), count in op_access_counts.items():
            is_trusted = ip in trusted_ips.get('ips', [])
            color = 'purple' if is_trusted else 'orange'
            icon = '🟣' if is_trusted else '🟠'
            
            folium.CircleMarker(
                location=[lat, lon],
                radius=6,
                popup=f"{icon} OpenProject desde {ip}<br>Accesos: {count}<br>{'(IP Confiable)' if is_trusted else ''}",
                color='#7c3aed' if is_trusted else '#ea580c',
                weight=2,
                fill=True,
                fillColor='#8b5cf6' if is_trusted else '#f97316',
                fillOpacity=0.5  # Más translúcido
            ).add_to(m)
        
        # Add active SSH sessions (large circles)
        for session in active_ssh.get('network_connections', []):
            geo_info = get_geo_info(session['remote_ip'])
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                is_admin = session['remote_ip'] == '142.111.25.137'
                
                if is_admin:
                    popup_text = f"👑🔥 ADMIN SSH ACTIVA desde {session['remote_ip']}<br>🎯 Sesión Privilegiada<br>Puerto: {session['remote_port']}"
                    color = '#6366f1'
                    fillColor = '#8b5cf6'
                    radius = 15  # Más grande para admin
                    weight = 4
                    opacity = 0.8
                else:
                    popup_text = f"🔵 SSH Activa desde {session['remote_ip']}<br>{'(IP Confiable)' if session['is_trusted'] else ''}<br>Puerto: {session['remote_port']}"
                    color = '#1e40af'
                    fillColor = '#3b82f6'
                    radius = 12
                    weight = 3
                    opacity = 0.6
                
                folium.CircleMarker(
                    location=[geo_info['lat'], geo_info['lon']],
                    radius=radius,
                    popup=popup_text,
                    color=color,
                    weight=weight,
                    fill=True,
                    fillColor=fillColor,
                    fillOpacity=opacity
                ).add_to(m)
        
        # Add active web connections (large purple circles)
        for conn in active_web:
            geo_info = get_geo_info(conn['remote_ip'])
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                folium.CircleMarker(
                    location=[geo_info['lat'], geo_info['lon']],
                    radius=10,
                    popup=f"🟣 {conn['protocol']} Activa desde {conn['remote_ip']}<br>{'(IP Confiable)' if conn['is_trusted'] else ''}<br>Puerto: {conn['remote_port']}",
                    color='#7c2d12',
                    weight=2,
                    fill=True,
                    fillColor='#a855f7',
                    fillOpacity=0.5  # Más translúcido
                ).add_to(m)
        
        return m._repr_html_()
        
    except Exception as e:
        logging.error(f"Error creating combined map: {e}")
        return "<p>Error generando mapa</p>"

def create_enhanced_map(ssh_attacks, ssh_successful, openproject_access, active_ssh, active_web, active_layers):
    """Create an enhanced map with layer controls and better visualizations"""
    try:
        m = folium.Map(location=[20, 0], zoom_start=2)
        trusted_ips = load_trusted_ips()
        
        # Layer 1: Trusted IPs (IP Autorizada) - Special icon
        if 'trustedIPs' in active_layers:
            # Add trusted IPs with distinctive shield icon
            all_ips = []
            all_ips.extend([attack['ip'] for attack in ssh_attacks])
            all_ips.extend([conn['ip'] for conn in ssh_successful])
            all_ips.extend([session.get('remote_ip', session.get('ip', '')) for session in active_ssh.get('network_connections', [])])
            all_ips.extend([session.get('ip', '') for session in active_ssh.get('user_sessions', [])])
            
            for ip in set(all_ips):
                if ip in trusted_ips.get('ips', []):
                    geo_info = get_geo_info(ip)
                    if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                        folium.Marker(
                            location=[geo_info['lat'], geo_info['lon']],
                            popup=f"🛡️ IP AUTORIZADA<br>{ip}<br>📍 {geo_info['country']}<br>✅ Acceso confiable",
                            icon=folium.Icon(color='blue', icon='shield', prefix='fa')
                        ).add_to(m)
        
        # Layer 2: SSH Attacks (Atacantes) - Scalable red circles
        if 'sshAttacks' in active_layers:
            attack_counts = Counter()
            for attack in ssh_attacks[-100:]:
                geo_info = get_geo_info(attack['ip'])
                if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                    attack_counts[(geo_info['lat'], geo_info['lon'], attack['ip'])] += 1
            
            for (lat, lon, ip), count in attack_counts.items():
                if ip not in trusted_ips.get('ips', []):  # Don't show attacks from trusted IPs
                    # Scale circle size by attack count (min 5, max 25)
                    radius = min(max(count * 3, 5), 25)
                    folium.CircleMarker(
                        location=[lat, lon],
                        radius=radius,
                        popup=f"⚠️ ATACANTE SSH<br>IP: {ip}<br>Ataques: {count}<br>Tamaño = Frecuencia",
                        color='darkred',
                        fill=True,
                        fillColor='red',
                        fillOpacity=0.7,
                        weight=2
                    ).add_to(m)
        
        # Layer 3: OpenProject Clients (Datos simulados)
        if 'openProject' in active_layers:
            op_counts = Counter()
            for access in openproject_access[-50:]:
                if access.get('ip') and access['ip'] != 'unknown':
                    geo_info = get_geo_info(access['ip'])
                    if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                        op_counts[(geo_info['lat'], geo_info['lon'], access['ip'])] += 1
            
            for (lat, lon, ip), count in op_counts.items():
                folium.CircleMarker(
                    location=[lat, lon],
                    radius=8,
                    popup=f"👥 OpenProject<br>IP: {ip} (simulada)<br>Accesos: {count}<br>⚠️ Datos simulados",
                    color='darkorange',
                    fill=True,
                    fillColor='orange',
                    fillOpacity=0.6
                ).add_to(m)
        
        # Layer 4: Web Connections (HTTPS)
        if 'webConnections' in active_layers:
            for conn in active_web:
                geo_info = get_geo_info(conn['remote_ip'])
                if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                    is_trusted = conn['remote_ip'] in trusted_ips.get('ips', [])
                    if not is_trusted:  # Don't duplicate trusted IP markers
                        folium.CircleMarker(
                            location=[geo_info['lat'], geo_info['lon']],
                            radius=6,
                            popup=f"🌐 {conn['protocol']} Activa<br>IP: {conn['remote_ip']}<br>Puerto: {conn['remote_port']}",
                            color='purple',
                            fill=True,
                            fillColor='purple',
                            fillOpacity=0.8
                        ).add_to(m)
        
        return m._repr_html_()
        
    except Exception as e:
        logging.error(f"Error creating enhanced map: {e}")
        return "<p>Error generando mapa mejorado</p>"

@app.route('/')
def api_root():
    """API Root - Backend Status"""
    return jsonify({
        "service": "SSH + OpenProject Monitor Backend",
        "version": "3.1",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "health": "/api/health",
            "summary": "/api/summary", 
            "server_status": "/api/server/status",
            "ssh": {
                "attacks": "/api/ssh/attacks",
                "successful": "/api/ssh/successful", 
                "active": "/api/ssh/active"
            },
            "openproject": {
                "users": "/api/openproject/users",
                "connections": "/api/openproject/connections",
                "access": "/api/openproject/access"
            }
        }
    })

@app.route('/api/health')
def api_health():
    """Health check endpoint for monitoring"""
    try:
        # Test basic functionality
        now = datetime.now()
        
        return jsonify({
            "status": "healthy",
            "timestamp": now.isoformat(),
            "uptime": "running",
            "services": {
                "flask": "running",
                "geoip": os.path.exists('/opt/ssh-monitor/GeoLite2-City.mmdb'),
                "logs": "accessible"
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/summary')
def api_summary():
    """API endpoint for enhanced summary statistics including SSH and OpenProject"""
    try:
        # SSH Data (existing)
        ssh_entries = get_ssh_log_entries(24)
        active_ssh = get_active_ssh_sessions()
        fail2ban_data = get_fail2ban_status()
        
        ssh_attacks = [e for e in ssh_entries if e['type'] == 'attack']
        ssh_successful = [e for e in ssh_entries if e['type'] == 'success']
        total_ssh_active = len(active_ssh['user_sessions']) + len(active_ssh['network_connections'])
        
        # Calculate unique IPs (for the 4th metric block)
        unique_ips_attacks = len(set(e['ip'] for e in ssh_attacks))
        unique_ips_successful = len(set(e['ip'] for e in ssh_successful))
        unique_ips_total = len(set(e['ip'] for e in ssh_entries))
        
        # OpenProject Data (new and improved)
        op_failed_logins = get_openproject_failed_logins(24)
        op_successful_logins = get_openproject_successful_logins(24)
        op_active_users = get_openproject_active_users(1)
        active_web = get_active_web_connections()
        intrusion_data = detect_potential_intruders()
        
        summary = {
            # SSH Server Monitoring (24h)
            'ssh_failed_logins': len(ssh_attacks),
            'ssh_successful_logins': len(ssh_successful),
            'ssh_active_connections': total_ssh_active,
            'ssh_blocked_ips': len(fail2ban_data['banned_ips']),
            'ssh_unique_ips': unique_ips_total,  # New metric for 4th block
            
            # OpenProject Application Monitoring (24h)
            'op_failed_logins': len(op_failed_logins),
            'op_successful_logins': len(op_successful_logins),
            'op_active_users': len(op_active_users),
            'op_blocked_users': 0,  # Placeholder - OpenProject doesn't have built-in user blocking
            
            # Security Analysis
            'total_registered_users': intrusion_data['total_registered'],
            'potential_security_alerts': len(intrusion_data['alerts']),
            'total_active_connections': total_ssh_active + len(active_web),
            
            # Legacy compatibility (for existing frontend)
            'ssh_attacks_24h': len(ssh_attacks),
            'ssh_successful_24h': len(ssh_successful),
            'op_active_connections': len(active_web)
        }
        
        logging.info(f"Enhanced API Summary: SSH({len(ssh_attacks)} attacks, {len(ssh_successful)} success), OP({len(op_failed_logins)} failed, {len(op_successful_logins)} success, {len(op_active_users)} active)")
        return jsonify(summary)
    except Exception as e:
        logging.error(f"Error in summary API: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ssh/attacks')
def api_ssh_attacks():
    """API endpoint for SSH attack data"""
    try:
        entries = get_ssh_log_entries(24)
        attacks = [e for e in entries if e['type'] == 'attack']
        
        for attack in attacks:
            geo_info = get_geo_info(attack['ip'])
            attack['country'] = geo_info['country']
        
        logging.info(f"API SSH Attacks: {len(attacks)} attacks")
        return jsonify(attacks[-100:])
    except Exception as e:
        logging.error(f"Error in SSH attacks API: {e}")
        return jsonify([])

@app.route('/api/ssh/successful')
def api_ssh_successful():
    """API endpoint for successful SSH connections"""
    try:
        entries = get_ssh_log_entries(24)
        successful = [e for e in entries if e['type'] == 'success']
        trusted_ips = load_trusted_ips()
        
        for conn in successful:
            geo_info = get_geo_info(conn['ip'])
            conn['country'] = geo_info['country']
            conn['is_trusted'] = conn['ip'] in trusted_ips.get('ips', [])
        
        return jsonify(successful[-50:])
    except Exception as e:
        logging.error(f"Error in SSH successful API: {e}")
        return jsonify([])

@app.route('/api/ssh/active')
def api_ssh_active():
    """API endpoint for active SSH sessions"""
    try:
        return jsonify(get_active_ssh_sessions())
    except Exception as e:
        logging.error(f"Error in SSH active API: {e}")
        return jsonify({'user_sessions': [], 'network_connections': []})

@app.route('/api/openproject/access')
def api_openproject_access():
    """API endpoint for OpenProject access logs"""
    try:
        entries, _ = get_openproject_logs(24)
        trusted_ips = load_trusted_ips()
        
        for entry in entries:
            if entry['ip'] != 'unknown':
                geo_info = get_geo_info(entry['ip'])
                entry['country'] = geo_info['country']
                entry['is_trusted'] = entry['ip'] in trusted_ips.get('ips', [])
            else:
                entry['country'] = 'Unknown'
                entry['is_trusted'] = False
        
        return jsonify(entries[-100:])
    except Exception as e:
        logging.error(f"Error in OpenProject access API: {e}")
        return jsonify([])

@app.route('/api/openproject/users')
def api_openproject_users():
    """API endpoint for OpenProject active users"""
    try:
        _, users = get_openproject_logs(24)
        trusted_ips = load_trusted_ips()
        
        for user in users:
            if user['ip'] != 'unknown':
                geo_info = get_geo_info(user['ip'])
                user['country'] = geo_info['country']
                user['is_trusted'] = user['ip'] in trusted_ips.get('ips', [])
            else:
                user['country'] = 'Unknown'
                user['is_trusted'] = False
        
        return jsonify(users)
    except Exception as e:
        logging.error(f"Error in OpenProject users API: {e}")
        return jsonify([])

@app.route('/api/openproject/connections')
def api_openproject_connections():
    """API endpoint for active web connections"""
    try:
        return jsonify(get_active_web_connections())
    except Exception as e:
        logging.error(f"Error in web connections API: {e}")
        return jsonify([])

@app.route('/api/fail2ban')
def api_fail2ban():
    """API endpoint for fail2ban status"""
    try:
        return jsonify(get_fail2ban_status())
    except Exception as e:
        logging.error(f"Error in fail2ban API: {e}")
        return jsonify({'banned_ips': [], 'stats': {'jail_status': 'Error', 'total_banned': 0}})

@app.route('/api/map')
def api_map():
    """API endpoint for the combined world map with filtering support"""
    try:
        # Get filter parameters
        hide_params = request.args.getlist('hide')
        
        ssh_entries = get_ssh_log_entries(24)
        op_entries, _ = get_openproject_logs(24)
        
        ssh_attacks = [e for e in ssh_entries if e['type'] == 'attack'] if 'ssh_attacks' not in hide_params else []
        ssh_successful = [e for e in ssh_entries if e['type'] == 'success'] if 'ssh_successful' not in hide_params else []
        
        # Agregar alertas de demo como ataques SSH para mostrar en el mapa
        if 'ssh_attacks' not in hide_params:
            demo_attack_ips = ['8.8.8.8', '77.88.8.8', '208.67.222.222']  # Google DNS (US), Yandex DNS (RU), OpenDNS (US)
            logging.info(f"Adding {len(demo_attack_ips)} demo attack IPs to map")
            for ip in demo_attack_ips:
                ssh_attacks.append({
                    'ip': ip,
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'type': 'attack',
                    'user': 'demo_alert',
                    'attempts': 15
                })
            logging.info(f"Total ssh_attacks after adding demo: {len(ssh_attacks)}")
        
        # Active SSH incluido en ssh_successful (no filtro separado)
        active_ssh = get_active_ssh_sessions() if 'ssh_successful' not in hide_params else {}
        active_web = get_active_web_connections() if 'https' not in hide_params else []
        
        # Filter OpenProject if requested
        if 'openproject' in hide_params:
            op_entries = []
        
        # Create map with selected layers
        map_html = create_enhanced_map(
            ssh_attacks, ssh_successful, op_entries, 
            active_ssh, active_web, active_layers
        )
        return jsonify({'map_html': map_html})
    except Exception as e:
        logging.error(f"Error in map API: {e}")
        return jsonify({'map_html': '<p>Error generando mapa</p>'})

@app.route('/api/geo-data')
def api_geo_data():
    """API endpoint for geographical data in JSON format for React frontend"""
    try:
        ssh_entries = get_ssh_log_entries(24)
        op_entries, _ = get_openproject_logs(24)
        
        ssh_attacks = [e for e in ssh_entries if e['type'] == 'attack']
        ssh_successful = [e for e in ssh_entries if e['type'] == 'success']
        
        active_ssh = get_active_ssh_sessions()
        active_web = get_active_web_connections()
        
        geo_data = []
        
        # SSH Successful connections
        for entry in ssh_successful:
            ip = entry.get('ip', 'unknown')
            geo_info = get_geo_info(ip)
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                geo_data.append({
                    'lat': geo_info['lat'],
                    'lon': geo_info['lon'],
                    'type': 'ssh_success',
                    'country': geo_info['country'],
                    'city': geo_info['city'],
                    'ip': ip,
                    'description': f"SSH Exitosa desde {ip}",
                    'color': 'green',
                    'count': 1
                })
        
        # SSH Attacks
        for entry in ssh_attacks:
            ip = entry.get('ip', 'unknown')
            geo_info = get_geo_info(ip)
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                geo_data.append({
                    'lat': geo_info['lat'],
                    'lon': geo_info['lon'],
                    'type': 'ssh_attack',
                    'country': geo_info['country'],
                    'city': geo_info['city'],
                    'ip': ip,
                    'description': f"Ataque SSH desde {ip}",
                    'color': 'red',
                    'count': 1
                })
        
        # OpenProject entries
        for entry in op_entries:
            ip = entry.get('ip', 'unknown')
            if ip and ip != 'unknown':
                geo_info = get_geo_info(ip)
                if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                    geo_data.append({
                        'lat': geo_info['lat'],
                        'lon': geo_info['lon'],
                        'type': 'openproject',
                        'country': geo_info['country'],
                        'city': geo_info['city'],
                        'ip': ip,
                        'description': f"OpenProject desde {ip}",
                        'color': 'orange',
                        'count': 1
                    })
        
        # Active web connections
        for connection in active_web:
            ip = connection.get('ip', 'unknown')
            if ip and ip != 'unknown':
                geo_info = get_geo_info(ip)
                if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                    geo_data.append({
                        'lat': geo_info['lat'],
                        'lon': geo_info['lon'],
                        'type': 'web_active',
                        'country': geo_info['country'],
                        'city': geo_info['city'],
                        'ip': ip,
                        'description': f"Conexión Web Activa desde {ip}",
                        'color': 'blue',
                        'count': 1
                    })
        
        # Consolidar entradas duplicadas por ubicación
        consolidated_data = {}
        for item in geo_data:
            key = f"{item['lat']},{item['lon']},{item['type']}"
            if key in consolidated_data:
                consolidated_data[key]['count'] += 1
                consolidated_data[key]['description'] += f" (+{consolidated_data[key]['count']})"
            else:
                consolidated_data[key] = item
        
        return jsonify(list(consolidated_data.values()))
        
    except Exception as e:
        logging.error(f"Error in geo-data API: {e}")
        return jsonify([])

# New OpenProject API endpoints
@app.route('/api/openproject/failed-logins')
def api_openproject_failed_logins():
    """API endpoint for OpenProject failed login attempts"""
    try:
        failed_logins = get_openproject_failed_logins(24)
        return jsonify(failed_logins)
    except Exception as e:
        logging.error(f"Error in OpenProject failed logins API: {e}")
        return jsonify([])

@app.route('/api/openproject/successful-logins')
def api_openproject_successful_logins():
    """API endpoint for OpenProject successful logins"""
    try:
        successful_logins = get_openproject_successful_logins(24)
        return jsonify(successful_logins)
    except Exception as e:
        logging.error(f"Error in OpenProject successful logins API: {e}")
        return jsonify([])

@app.route('/api/openproject/active-users')
def api_openproject_active_users():
    """API endpoint for currently active OpenProject users"""
    try:
        active_users = get_openproject_active_users(1)
        return jsonify(active_users)
    except Exception as e:
        logging.error(f"Error in OpenProject active users API: {e}")
        return jsonify([])

@app.route('/api/openproject/users-db')
def api_openproject_users_db():
    """API endpoint for valid OpenProject users from database (filters out demo/invalid users)"""
    try:
        users = get_openproject_users_from_db()
        users_list = list(users.values())
        
        # Filter out invalid/demo users
        valid_users = []
        for user in users_list:
            # Skip users with generic names like user_1, user_2, etc.
            if user.get('login', '').startswith('user_'):
                continue
            
            # Skip users without proper display names (likely demo users)
            display_name = user.get('display_name', '')
            if not display_name or display_name.startswith('User '):
                continue
                
            valid_users.append(user)
        
        logging.info(f"Filtered users: {len(valid_users)} valid users from {len(users_list)} total")
        return jsonify(valid_users)
    except Exception as e:
        logging.error(f"Error in OpenProject users DB API: {e}")
        return jsonify([])

def get_docker_status():
    """Get Docker containers status"""
    try:
        result = subprocess.run(['docker', 'ps', '-a', '--format', 'json'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            containers = []
            for line in result.stdout.strip().split('\n'):
                if line:
                    containers.append(json.loads(line))
            
            running = len([c for c in containers if c.get('State') == 'running'])
            total = len(containers)
            return {'running': running, 'total': total, 'containers': containers}
        else:
            return {'running': 0, 'total': 0, 'containers': []}
    except Exception as e:
        logging.error(f"Error getting Docker status: {e}")
        return {'running': 0, 'total': 0, 'containers': []}

def get_services_status():
    """Get system services status"""
    try:
        # Key services to monitor
        key_services = ['ssh', 'nginx', 'systemd-resolved', 'cron']
        
        active_services = 0
        services_detail = []
        
        for service in key_services:
            try:
                result = subprocess.run(['systemctl', 'is-active', service], 
                                      capture_output=True, text=True, timeout=5)
                is_active = result.stdout.strip() == 'active'
                services_detail.append({
                    'name': service,
                    'status': 'active' if is_active else 'inactive'
                })
                if is_active:
                    active_services += 1
            except:
                services_detail.append({
                    'name': service,
                    'status': 'unknown'
                })
        
        return {
            'active': active_services,
            'total': len(key_services),
            'services': services_detail
        }
    except Exception as e:
        logging.error(f"Error getting services status: {e}")
        return {'active': 0, 'total': 0, 'services': []}

@app.route('/api/server/status')
def api_server_status():
    """API endpoint for real-time server status"""
    try:
        status = get_system_status()
        logging.info(f"Server status API called - CPU: {status['metrics']['cpu']['value']}%, Memory: {status['metrics']['memory']['value']}%, Disk: {status['metrics']['disk']['value']}%")
        return jsonify(status)
    except Exception as e:
        logging.error(f"Error in server status API: {e}")
        return jsonify({
            'metrics': {
                'cpu': {'value': 0.0, 'status': 'unknown'},
                'memory': {'value': 0.0, 'status': 'unknown'},
                'disk': {'value': 0.0, 'status': 'unknown'},
                'load': {'value': 0.0, 'status': 'unknown'}
            },
            'uptime': 'Unknown',
            'lastUpdate': datetime.now().strftime('%H:%M:%S'),
            'security': {'active': 0, 'total': 0, 'services': [], 'lastUpdate': 'Unknown'},
            'system': {'docker': {'containers': [], 'running': 0, 'total': 0}, 'lastBackup': 'Unknown', 'activeConnections': 0}
        })

def get_system_info():
    """Get real system information"""
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        
        # Load average
        load_avg = os.getloadavg()[0] if hasattr(os, 'getloadavg') else 0.0
        
        # Uptime
        boot_time = psutil.boot_time()
        uptime_seconds = datetime.now().timestamp() - boot_time
        uptime_days = int(uptime_seconds // 86400)
        uptime_hours = int((uptime_seconds % 86400) // 3600)
        uptime_minutes = int((uptime_seconds % 3600) // 60)
        
        if uptime_days > 0:
            uptime_str = f"{uptime_days}d {uptime_hours}h"
        else:
            uptime_str = f"{uptime_hours}h {uptime_minutes}m"
        
        return {
            'cpu': cpu_percent,
            'memory': memory_percent,
            'disk': disk_percent,
            'load': round(load_avg, 2),
            'uptime': uptime_str
        }
    except Exception as e:
        logging.error(f"Error getting system info: {e}")
        return {
            'cpu': 0.0,
            'memory': 0.0,
            'disk': 0.0,
            'load': 0.0,
            'uptime': 'Unknown'
        }

def get_security_services():
    """Check security services status"""
    services = []
    
    # SSH service
    try:
        result = subprocess.run(['systemctl', 'is-active', 'ssh'], 
                              capture_output=True, text=True, timeout=5)
        ssh_status = 'active' if result.stdout.strip() == 'active' else 'inactive'
        services.append({
            'name': 'SSH',
            'status': ssh_status,
            'info': 'Puerto 22'
        })
    except:
        services.append({'name': 'SSH', 'status': 'unknown', 'info': 'Error'})
    
    # Fail2Ban
    try:
        result = subprocess.run(['systemctl', 'is-active', 'fail2ban'], 
                              capture_output=True, text=True, timeout=5)
        fail2ban_status = 'active' if result.stdout.strip() == 'active' else 'inactive'
        services.append({
            'name': 'Fail2Ban',
            'status': fail2ban_status,
            'info': 'Protección activa' if fail2ban_status == 'active' else 'Desactivado'
        })
    except:
        services.append({'name': 'Fail2Ban', 'status': 'inactive', 'info': 'No instalado'})
    
    # GeoIP (check if database exists)
    geoip_status = 'active' if os.path.exists('/opt/ssh-monitor/GeoLite2-City.mmdb') else 'inactive'
    services.append({
        'name': 'GeoIP',
        'status': geoip_status,
        'info': 'Localización IP' if geoip_status == 'active' else 'Base de datos no encontrada'
    })
    
    # UFW Firewall - verificar estado REAL
    try:
        result = subprocess.run(['ufw', 'status'], 
                              capture_output=True, text=True, timeout=5)
        ufw_status = 'active' if 'Status: active' in result.stdout else 'inactive'
        services.append({
            'name': 'Firewall (UFW)',
            'status': ufw_status,
            'info': 'Protección activa' if ufw_status == 'active' else 'Desactivado'
        })
    except:
        services.append({'name': 'Firewall (UFW)', 'status': 'inactive', 'info': 'No disponible'})
    
    # iptables rules - verificar si hay reglas
    try:
        result = subprocess.run(['iptables', '-L', 'INPUT', '-n'], 
                              capture_output=True, text=True, timeout=5)
        iptables_rules = len(result.stdout.strip().split('\n')) > 3  # Más de header
        services.append({
            'name': 'iptables',
            'status': 'active' if iptables_rules else 'inactive',
            'info': f'{"Reglas activas" if iptables_rules else "Sin reglas"}'
        })
    except:
        services.append({'name': 'iptables', 'status': 'unknown', 'info': 'No verificable'})
    

    
    return services

def get_docker_info():
    """Get Docker containers information"""
    containers = []
    try:
        # Get running containers
        result = subprocess.run(['docker', 'ps', '--format', 'table {{.Names}}\t{{.Status}}'],
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')[1:]  # Skip header
            for line in lines:
                if line.strip():
                    parts = line.split('\t')
                    if len(parts) >= 2:
                        name = parts[0].strip()
                        status_full = parts[1].strip()
                        
                        # Determine container importance and info
                        if 'openproject' in name.lower():
                            info = 'Principal'
                        elif 'postgres' in name.lower() or 'db' in name.lower():
                            info = 'Base de datos'
                        elif 'monitor' in name.lower() or 'ssh' in name.lower():
                            info = 'Este sistema'
                        else:
                            info = 'Servicio'
                        
                        containers.append({
                            'name': name,
                            'status': 'running',
                            'info': info
                        })
        
        # Get all containers (including stopped ones) for total count
        result_all = subprocess.run(['docker', 'ps', '-a', '--format', 'table {{.Names}}'],
                                  capture_output=True, text=True, timeout=10)
        total_containers = 0
        if result_all.returncode == 0:
            lines = result_all.stdout.strip().split('\n')[1:]  # Skip header
            total_containers = len([line for line in lines if line.strip()])
            
    except Exception as e:
        logging.error(f"Error getting Docker info: {e}")
    
    return {
        'containers': containers[:3],  # Solo mostrar los 3 más importantes
        'running': len(containers),
        'total': total_containers
    }

def get_system_status():
    """Get comprehensive system status"""
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100
        
        # System uptime
        boot_time = psutil.boot_time()
        uptime_seconds = datetime.now().timestamp() - boot_time
        uptime_days = int(uptime_seconds // 86400)
        uptime_hours = int((uptime_seconds % 86400) // 3600)
        uptime = f'{uptime_days}d {uptime_hours}h' if uptime_days > 0 else f'{uptime_hours}h'
        
        # System load
        load_avg = os.getloadavg()[0] if hasattr(os, 'getloadavg') else 0.0
        
        # Docker containers status
        docker_containers = get_docker_status()
        
        # System services status
        services = get_services_status()
        
        # Network connections
        active_connections = len(psutil.net_connections(kind='inet'))
        
        # Get last Ubuntu update info
        try:
            result = subprocess.run(['stat', '-c', '%Y', '/var/log/apt/history.log'],
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                update_timestamp = int(result.stdout.strip())
                update_date = datetime.fromtimestamp(update_timestamp)
                days_ago = (datetime.now() - update_date).days
                if days_ago == 0:
                    last_update = 'Hoy'
                elif days_ago == 1:
                    last_update = 'Ayer'
                else:
                    last_update = f'Hace {days_ago} días'
            else:
                last_update = 'Desconocido'
        except:
            last_update = 'Desconocido'
        
        # Determine status levels
        def get_metric_status(value, warning_threshold=70, critical_threshold=90):
            if value >= critical_threshold:
                return 'critical'
            elif value >= warning_threshold:
                return 'warning'
            else:
                return 'good'
        
        # Security services list - usar estado REAL
        security_services = get_security_services()
        
        # Obtener fecha REAL de última actualización de Ubuntu
        try:
            # Buscar última fecha en logs de apt
            result = subprocess.run(['stat', '-c', '%y', '/var/log/apt/history.log'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                last_update_raw = result.stdout.strip().split()[0]  # Solo la fecha
                # Convertir a formato más legible
                from datetime import datetime as dt
                update_date = dt.strptime(last_update_raw, '%Y-%m-%d')
                days_ago = (dt.now() - update_date).days
                
                if days_ago == 0:
                    last_update = 'Hoy'
                elif days_ago == 1:
                    last_update = 'Ayer'
                elif days_ago < 7:
                    last_update = f'Hace {days_ago} días'
                elif days_ago < 30:
                    last_update = f'Hace {days_ago//7} semanas'
                else:
                    last_update = f'Hace {days_ago} días (⚠️ ANTIGUO)'
            else:
                last_update = 'Fecha no disponible'
        except:
            last_update = 'Error al verificar'
        
        # Mock backup info (you can implement real backup checking here)
        last_backup = 'Ayer 02:00'  # This should be replaced with real backup check
        
        return {
            'metrics': {
                'cpu': {
                    'value': round(cpu_percent, 1),
                    'status': get_metric_status(cpu_percent)
                },
                'memory': {
                    'value': round(memory_percent, 1),
                    'status': get_metric_status(memory_percent)
                },
                'disk': {
                    'value': round(disk_percent, 1),
                    'status': get_metric_status(disk_percent)
                },
                'load': {
                    'value': round(load_avg, 2),
                    'status': get_metric_status(load_avg * 100, 70, 90)
                }
            },
            'uptime': uptime,
            'lastUpdate': datetime.now().strftime('%H:%M:%S'),
            'security': {
                'active': len([s for s in security_services if s['status'] == 'active']),
                'total': len(security_services),
                'services': security_services,
                'lastUpdate': last_update
            },
            'system': {
                'docker': {
                    'running': docker_containers['running'],
                    'total': docker_containers['total'],
                    'containers': [
                        {'name': 'openproject', 'status': 'running', 'info': 'Principal'},
                        {'name': 'postgresql', 'status': 'running', 'info': 'Base de datos'},
                        {'name': 'monitoring', 'status': 'running', 'info': 'Este sistema'}
                    ]
                },
                'lastBackup': last_backup,
                'activeConnections': active_connections
            }
        }
    except Exception as e:
        logging.error(f"Error getting system status: {e}")
        return {
            'metrics': {
                'cpu': {'value': 0.0, 'status': 'unknown'},
                'memory': {'value': 0.0, 'status': 'unknown'},
                'disk': {'value': 0.0, 'status': 'unknown'},
                'load': {'value': 0.0, 'status': 'unknown'}
            },
            'uptime': 'Unknown',
            'lastUpdate': datetime.now().strftime('%H:%M:%S'),
            'security': {'active': 0, 'total': 0, 'services': [], 'lastUpdate': 'Unknown'},
            'system': {'docker': {'containers': [], 'running': 0, 'total': 0}, 'lastBackup': 'Unknown', 'activeConnections': 0}
        }

@app.route('/api/security/intrusion-detection')
def api_intrusion_detection():
    """API endpoint for security intrusion detection analysis"""
    try:
        intrusion_data = detect_potential_intruders()
        
        # Agregar alertas de demostración para testing con geolocalización
        demo_ips = ['8.8.8.8', '77.88.8.8', '208.67.222.222']  # Google DNS (US), Yandex DNS (RU), OpenDNS (US)
        demo_alerts = []
        
        for i, ip in enumerate(demo_ips):
            geo_info = get_geo_info(ip)
            severity_levels = ['high', 'medium', 'low']
            alert_types = ['Intento de Intrusión SSH', 'Actividad Sospechosa', 'Escaneo de Puertos']
            messages = [
                'Múltiples intentos fallidos de login',
                'Acceso desde geolocalización inusual', 
                'Detectado escaneo sistemático de puertos'
            ]
            
            demo_alerts.append({
                'type': alert_types[i],
                'message': messages[i],
                'severity': severity_levels[i],
                'ip': ip,
                'country': geo_info.get('country', 'Unknown'),
                'city': geo_info.get('city', 'Unknown'),
                'timestamp': (datetime.now() - timedelta(minutes=i*5)).isoformat(),
                'attempts': [15, 3, 47][i],  # Número de intentos
                'description': f'Actividad desde {geo_info.get("country", "Unknown")}'
            })
        
        # Combinar alertas reales con alertas de demo
        if 'alerts' not in intrusion_data:
            intrusion_data['alerts'] = []
        intrusion_data['alerts'].extend(demo_alerts)
        
        return jsonify(intrusion_data)
    except Exception as e:
        logging.error(f"Error in intrusion detection API: {e}")
        return jsonify({'total_registered': 0, 'total_active': 0, 'alerts': []})

if __name__ == '__main__':
    logging.info("Starting SSH + OpenProject Monitor Dashboard...")
    app.run(host='0.0.0.0', port=8091, debug=False)
