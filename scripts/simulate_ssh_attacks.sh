#!/bin/bash

# SSH Attack Simulator for Dashboard Demo
# Simulates realistic SSH attacks for testing the monitoring system

LOGFILE="/var/log/auth.log"
TIMESTAMP=$(date '+%Y-%m-%dT%H:%M:%S.%6N%z')  # ISO format like real logs
HOSTNAME=$(hostname)

# Array of attacker IPs from different countries
ATTACKER_IPS=(
    "103.41.124.45"      # China
    "185.220.101.182"    # Russia  
    "91.240.118.172"     # Ukraine
    "177.54.144.89"      # Brazil
    "196.200.54.123"     # Nigeria
    "103.92.114.45"      # India
    "185.234.218.123"    # Iran
    "41.230.62.211"      # Egypt
    "200.115.53.198"     # Mexico
    "94.156.174.23"      # Turkey
)

# Array of common attack usernames
ATTACK_USERS=(
    "admin"
    "root" 
    "user"
    "test"
    "guest"
    "administrator"
    "postgres"
    "mysql"
    "oracle"
    "backup"
    "ftpuser"
    "www-data"
    "nginx"
    "apache"
    "jenkins"
)

# Function to generate failed password attack
generate_failed_password() {
    local ip=$1
    local user=$2
    local port=${3:-22}
    
    echo "$TIMESTAMP $HOSTNAME sshd[$(shuf -i 10000-99999 -n 1)]: Failed password for $user from $ip port $(shuf -i 40000-65000 -n 1) ssh2" >> $LOGFILE
}

# Function to generate invalid user attack  
generate_invalid_user() {
    local ip=$1
    local user=$2
    local port=${3:-22}
    
    echo "$TIMESTAMP $HOSTNAME sshd[$(shuf -i 10000-99999 -n 1)]: Invalid user $user from $ip port $(shuf -i 40000-65000 -n 1)" >> $LOGFILE
}

# Function to generate connection closed attack
generate_connection_closed() {
    local ip=$1
    
    echo "$TIMESTAMP $HOSTNAME sshd[$(shuf -i 10000-99999 -n 1)]: Connection closed by $ip port $(shuf -i 40000-65000 -n 1) [preauth]" >> $LOGFILE
}

# Function to simulate a coordinated attack from one IP
simulate_brute_force_attack() {
    local attacker_ip=$1
    local attack_intensity=${2:-10}  # Number of attempts
    
    echo "🔴 Simulando ataque de fuerza bruta desde $attacker_ip ($attack_intensity intentos)..."
    
    for i in $(seq 1 $attack_intensity); do
        local user=${ATTACK_USERS[$((RANDOM % ${#ATTACK_USERS[@]}))]}
        
        # Mix of different attack types
        case $((RANDOM % 3)) in
            0) generate_failed_password $attacker_ip $user ;;
            1) generate_invalid_user $attacker_ip $user ;;
            2) generate_connection_closed $attacker_ip ;;
        esac
        
        # Small delay to make it realistic
        sleep 0.1
    done
}

# Function to simulate distributed attack
simulate_distributed_attack() {
    local num_attackers=${1:-5}
    local attacks_per_ip=${2:-5}
    
    echo "🌍 Simulando ataque distribuido desde $num_attackers IPs diferentes..."
    
    for i in $(seq 1 $num_attackers); do
        local attacker_ip=${ATTACKER_IPS[$((RANDOM % ${#ATTACKER_IPS[@]}))]}
        simulate_brute_force_attack $attacker_ip $attacks_per_ip &
    done
    
    wait # Wait for all background attacks to complete
}

# Function to simulate ongoing attack
simulate_ongoing_attack() {
    local duration=${1:-60}  # Duration in seconds
    echo "⚡ Simulando ataque continuo por $duration segundos..."
    
    local end_time=$(($(date +%s) + duration))
    
    while [ $(date +%s) -lt $end_time ]; do
        local attacker_ip=${ATTACKER_IPS[$((RANDOM % ${#ATTACKER_IPS[@]}))]}
        local user=${ATTACK_USERS[$((RANDOM % ${#ATTACK_USERS[@]}))]}
        
        generate_failed_password $attacker_ip $user
        
        # Random delay between 1-5 seconds
        sleep $(shuf -i 1-5 -n 1)
    done
}

# Main menu
show_menu() {
    echo "==============================================="
    echo "   🛡️  SSH ATTACK SIMULATOR FOR DEMO  🛡️"
    echo "==============================================="
    echo "1. Ataque de fuerza bruta (single IP)"
    echo "2. Ataque distribuido (múltiples IPs)"  
    echo "3. Ataque continuo (duración específica)"
    echo "4. Ataque masivo (para pruebas intensivas)"
    echo "5. Limpiar logs de ataques simulados"
    echo "6. Mostrar estadísticas actuales"
    echo "0. Salir"
    echo "==============================================="
}

# Statistics function
show_stats() {
    echo "📊 Estadísticas SSH actuales:"
    echo "Total ataques en logs: $(grep -c "Failed password\|Invalid user" $LOGFILE 2>/dev/null || echo "0")"
    echo "IPs únicas atacantes: $(grep "Failed password\|Invalid user" $LOGFILE 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -u | wc -l)"
    echo "Ataques en última hora: $(grep "$(date '+%b %d %H:')" $LOGFILE 2>/dev/null | grep -c "Failed password\|Invalid user" || echo "0")"
}

# Clean simulated attacks
clean_simulated_attacks() {
    echo "🧹 Limpiando logs de ataques simulados..."
    # Backup original log
    sudo cp $LOGFILE "${LOGFILE}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null
    
    # Remove lines with our simulated IPs
    for ip in "${ATTACKER_IPS[@]}"; do
        sudo sed -i "/$ip/d" $LOGFILE 2>/dev/null
    done
    
    echo "✅ Logs limpiados. Backup creado."
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root para modificar $LOGFILE"
    echo "Usa: sudo $0"
    exit 1
fi

# Main execution
case "$1" in
    "brute")
        simulate_brute_force_attack ${ATTACKER_IPS[0]} ${2:-15}
        ;;
    "distributed") 
        simulate_distributed_attack ${2:-3} ${3:-8}
        ;;
    "continuous")
        simulate_ongoing_attack ${2:-30}
        ;;
    "massive")
        echo "💥 Iniciando ataque masivo para demo..."
        simulate_distributed_attack 8 15
        ;;
    "clean")
        clean_simulated_attacks
        ;;
    "stats")
        show_stats
        ;;
    *)
        # Interactive mode
        while true; do
            show_menu
            read -p "Selecciona una opción: " choice
            
            case $choice in
                1)
                    read -p "Intensidad (número de intentos): " intensity
                    simulate_brute_force_attack ${ATTACKER_IPS[0]} ${intensity:-10}
                    ;;
                2)
                    read -p "Número de IPs atacantes: " num_ips
                    read -p "Ataques por IP: " attacks_per_ip
                    simulate_distributed_attack ${num_ips:-5} ${attacks_per_ip:-5}
                    ;;
                3)
                    read -p "Duración en segundos: " duration
                    simulate_ongoing_attack ${duration:-30}
                    ;;
                4)
                    simulate_distributed_attack 8 20
                    ;;
                5)
                    clean_simulated_attacks
                    ;;
                6)
                    show_stats
                    ;;
                0)
                    echo "👋 ¡Adiós!"
                    exit 0
                    ;;
                *)
                    echo "❌ Opción inválida"
                    ;;
            esac
            
            echo ""
            read -p "Presiona Enter para continuar..."
            clear
        done
        ;;
esac
