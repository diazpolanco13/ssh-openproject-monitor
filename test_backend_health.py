#!/usr/bin/env python3
"""
Script para validar que el backend Flask funciona correctamente
sin depender del frontend HTML legacy.
"""

import requests
import json
import sys
from datetime import datetime

def test_backend_health(base_url="http://127.0.0.1:8090"):
    """Test all backend APIs to ensure they're working"""
    
    endpoints_to_test = [
        "/api/summary",
        "/api/server/status", 
        "/api/ssh/attacks",
        "/api/ssh/successful",
        "/api/ssh/active",
        "/api/openproject/users",
        "/api/openproject/connections",
        "/api/fail2ban",
        "/api/map",
        "/api/geo-data"
    ]
    
    print(f"🔍 Testing Backend Health - {datetime.now()}")
    print(f"🌐 Base URL: {base_url}")
    print("=" * 50)
    
    working_apis = []
    failing_apis = []
    
    for endpoint in endpoints_to_test:
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"✅ {endpoint} - OK (Status: {response.status_code})")
                try:
                    data = response.json()
                    print(f"   📊 Response size: {len(json.dumps(data))} chars")
                except:
                    print(f"   📄 Response size: {len(response.text)} chars")
                working_apis.append(endpoint)
            else:
                print(f"⚠️  {endpoint} - HTTP {response.status_code}")
                failing_apis.append(f"{endpoint} (HTTP {response.status_code})")
                
        except requests.exceptions.Timeout:
            print(f"⏰ {endpoint} - TIMEOUT")
            failing_apis.append(f"{endpoint} (TIMEOUT)")
            
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint} - CONNECTION ERROR")
            failing_apis.append(f"{endpoint} (CONNECTION ERROR)")
            
        except Exception as e:
            print(f"🔴 {endpoint} - ERROR: {str(e)}")
            failing_apis.append(f"{endpoint} (ERROR: {str(e)})")
    
    print("=" * 50)
    print(f"📈 SUMMARY:")
    print(f"   ✅ Working APIs: {len(working_apis)}")
    print(f"   ❌ Failing APIs: {len(failing_apis)}")
    
    if failing_apis:
        print(f"\n🔴 Failed endpoints:")
        for fail in failing_apis:
            print(f"   - {fail}")
    
    success_rate = len(working_apis) / len(endpoints_to_test) * 100
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🟢 Backend is HEALTHY")
        return True
    else:
        print("🔴 Backend has ISSUES")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://127.0.0.1:8090"
    
    is_healthy = test_backend_health(base_url)
    sys.exit(0 if is_healthy else 1)
