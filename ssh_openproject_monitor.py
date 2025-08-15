#!/usr/bin/env python3
import re
import subprocess
import json
import logging
import socket
from datetime import datetime, timedelta
from flask import Flask, jsonify, render_template
import geoip2.database
import folium
import os
from collections import defaultdict, Counter

app = Flask(__name__)

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
                            
                            # Try to resolve IP from host
                            ip = 'unknown'
                            if host != 'unknown' and host != 'localhost':
                                try:
                                    # Try to resolve hostname to IP
                                    ip = socket.gethostbyname(host.split(':')[0])
                                except:
                                    # If it's already an IP or can't resolve, use as is
                                    if re.match(r'^\d+\.\d+\.\d+\.\d+', host):
                                        ip = host.split(':')[0]
                                    else:
                                        ip = host
                            
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
        # Get SSH network connections using netstat for SSH port 22
        netstat_output = run_command("netstat -tn | grep ':22 ' | grep ESTABLISHED")
        
        for line in netstat_output.split('\n'):
            if line.strip() and 'ESTABLISHED' in line:
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
                            
                            sessions_data['network_connections'].append({
                                'remote_ip': remote_ip,
                                'remote_port': remote_port,
                                'local_port': local_port,
                                'service': 'SSH',
                                'country': geo_info['country'],
                                'is_trusted': is_trusted,
                                'connection_time': 'Activa'
                            })
                    except Exception as e:
                        logging.error(f"Error parsing SSH connection: {e}")
                        continue
        
        # Try to get user sessions from 'w' command
        w_output = run_command("w")
        lines = w_output.split('\n')
        for line in lines[2:]:  # Skip header lines
            if line.strip() and not line.startswith('USER'):
                parts = line.split()
                if len(parts) >= 8:
                    user = parts[0]
                    tty = parts[1] if parts[1] != '' else 'notty'
                    from_ip = parts[2] if parts[2] != '' else 'local'
                    login_time = parts[3] if len(parts) > 3 else 'unknown'
                    
                    if re.match(r'^\d+\.\d+\.\d+\.\d+$', from_ip):
                        geo_info = get_geo_info(from_ip)
                        is_trusted = from_ip in trusted_ips.get('ips', [])
                        
                        sessions_data['user_sessions'].append({
                            'user': user,
                            'terminal': tty,
                            'login_time': login_time,
                            'ip': from_ip,
                            'service': 'SSH',
                            'country': geo_info['country'],
                            'is_trusted': is_trusted
                        })
        
        total_connections = len(sessions_data['user_sessions']) + len(sessions_data['network_connections'])
        logging.info(f"Active SSH sessions: {total_connections} total")
        
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
        
        for (lat, lon, ip), count in attack_counts.items():
            folium.CircleMarker(
                location=[lat, lon],
                radius=min(count * 2, 20),
                popup=f"🔴 SSH Ataques desde {ip}<br>Total: {count}",
                color='red',
                fill=True,
                fillColor='red',
                fillOpacity=0.6
            ).add_to(m)
        
        # Add SSH successful connections (green circles)
        ssh_success_counts = Counter()
        for conn in ssh_successful[-50:]:
            geo_info = get_geo_info(conn['ip'])
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                ssh_success_counts[(geo_info['lat'], geo_info['lon'], conn['ip'])] += 1
        
        for (lat, lon, ip), count in ssh_success_counts.items():
            is_trusted = ip in trusted_ips.get('ips', [])
            color = 'blue' if is_trusted else 'green'
            icon = '🔵' if is_trusted else '🟢'
            
            folium.CircleMarker(
                location=[lat, lon],
                radius=8,
                popup=f"{icon} SSH Exitosa desde {ip}<br>{'(IP Confiable)' if is_trusted else ''}",
                color=color,
                fill=True,
                fillColor=color,
                fillOpacity=0.7
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
                color=color,
                fill=True,
                fillColor=color,
                fillOpacity=0.8
            ).add_to(m)
        
        # Add active SSH sessions (large blue circles)
        for session in active_ssh.get('network_connections', []):
            geo_info = get_geo_info(session['remote_ip'])
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                folium.CircleMarker(
                    location=[geo_info['lat'], geo_info['lon']],
                    radius=12,
                    popup=f"🔵 SSH Activa desde {session['remote_ip']}<br>{'(IP Confiable)' if session['is_trusted'] else ''}<br>Puerto: {session['remote_port']}",
                    color='blue',
                    fill=True,
                    fillColor='blue',
                    fillOpacity=0.9
                ).add_to(m)
        
        # Add active web connections (large purple circles)
        for conn in active_web:
            geo_info = get_geo_info(conn['remote_ip'])
            if geo_info['lat'] != 0 and geo_info['lon'] != 0:
                folium.CircleMarker(
                    location=[geo_info['lat'], geo_info['lon']],
                    radius=10,
                    popup=f"🟣 {conn['protocol']} Activa desde {conn['remote_ip']}<br>{'(IP Confiable)' if conn['is_trusted'] else ''}<br>Puerto: {conn['remote_port']}",
                    color='purple',
                    fill=True,
                    fillColor='purple',
                    fillOpacity=0.9
                ).add_to(m)
        
        return m._repr_html_()
        
    except Exception as e:
        logging.error(f"Error creating combined map: {e}")
        return "<p>Error generando mapa</p>"

@app.route('/')
def dashboard():
    """Main dashboard page"""
    return render_template('dashboard_combined.html')

@app.route('/api/summary')
def api_summary():
    """API endpoint for summary statistics including SSH and OpenProject"""
    try:
        ssh_entries = get_ssh_log_entries(24)
        op_entries, op_users = get_openproject_logs(24)
        active_ssh = get_active_ssh_sessions()
        active_web = get_active_web_connections()
        fail2ban_data = get_fail2ban_status()
        
        ssh_attacks = [e for e in ssh_entries if e['type'] == 'attack']
        ssh_successful = [e for e in ssh_entries if e['type'] == 'success']
        
        # Count OpenProject access
        op_successful = [e for e in op_entries if e['status'] < 400]
        op_errors = [e for e in op_entries if e['status'] >= 400]
        
        total_ssh_active = len(active_ssh['user_sessions']) + len(active_ssh['network_connections'])
        total_web_active = len(active_web)
        unique_op_users = len(set(user['user_id'] for user in op_users if user['user_id'] != 'anonymous'))
        
        summary = {
            # SSH Stats
            'ssh_attacks_24h': len(ssh_attacks),
            'ssh_successful_24h': len(ssh_successful),
            'ssh_active_sessions': total_ssh_active,
            'ssh_banned_ips': len(fail2ban_data['banned_ips']),
            'ssh_unique_attack_ips': len(set(attack['ip'] for attack in ssh_attacks)),
            
            # OpenProject Stats
            'op_requests_24h': len(op_entries),
            'op_successful_24h': len(op_successful),
            'op_errors_24h': len(op_errors),
            'op_active_users': unique_op_users,
            'op_active_connections': total_web_active,
            
            # Combined Stats
            'total_active_connections': total_ssh_active + total_web_active
        }
        
        logging.info(f"API Summary: {summary}")
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
    """API endpoint for the combined world map"""
    try:
        ssh_entries = get_ssh_log_entries(24)
        op_entries, _ = get_openproject_logs(24)
        
        ssh_attacks = [e for e in ssh_entries if e['type'] == 'attack']
        ssh_successful = [e for e in ssh_entries if e['type'] == 'success']
        
        active_ssh = get_active_ssh_sessions()
        active_web = get_active_web_connections()
        
        map_html = create_combined_map(ssh_attacks, ssh_successful, op_entries, active_ssh, active_web)
        return jsonify({'map_html': map_html})
    except Exception as e:
        logging.error(f"Error in map API: {e}")
        return jsonify({'map_html': '<p>Error generando mapa</p>'})

if __name__ == '__main__':
    logging.info("Starting SSH + OpenProject Monitor Dashboard...")
    app.run(host='0.0.0.0', port=8080, debug=False)
