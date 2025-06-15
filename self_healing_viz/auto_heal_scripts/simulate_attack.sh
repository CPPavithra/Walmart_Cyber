#!/bin/bash

# Configuration
DEPLOYMENT="neuroretailx-service"
NAMESPACE="default"
SIMULATION_DELAY=5
SERVICE_URL="${DEPLOYMENT}.${NAMESPACE}.svc.cluster.local:80"  # Added port

echo "🚀 Starting Cyber Attack Simulations..."

# Phase 1: Ransomware
echo -e "\n💀 PHASE 1: Simulating RANSOMWARE ATTACK"
kubectl scale deployment -n $NAMESPACE $DEPLOYMENT --replicas=0
kubectl get pods -n $NAMESPACE -l app=neuroretailx -w &

# Phase 2: Self-Healing
echo -e "\n🛡️ PHASE 2: Triggering SELF-HEALING"
sleep $SIMULATION_DELAY
kubectl scale deployment -n $NAMESPACE $DEPLOYMENT --replicas=1

# Wait for pod
echo -n "⏳ Waiting for pod..."
while ! kubectl get pod -n $NAMESPACE -l app=neuroretailx -o jsonpath='{.items[0].status.containerStatuses[0].ready}' | grep -q "true"; do
  sleep 1
  echo -n "."
done
POD_NAME=$(kubectl get pod -n $NAMESPACE -l app=neuroretailx -o jsonpath='{.items[0].metadata.name}')
echo -e "\n✅ Pod $POD_NAME ready!"

# Phase 3: Brute Force (improved)
echo -e "\n💣 PHASE 3: Simulating BRUTE FORCE ATTACK"
kubectl exec -n $NAMESPACE $POD_NAME -- sh -c "for i in {1..10}; do dd if=/dev/urandom bs=1M count=10 | md5sum >/dev/null; done" &

# Phase 4: DDoS (fixed with proper URL)
echo -e "\n🌐 PHASE 4: Simulating DDoS ATTACK"
kubectl run -n $NAMESPACE ddos-simulator --image=alpine --restart=Never --rm -i -- sh -c "while true; do wget -qO- http://${SERVICE_URL}/health && sleep 0.1 || sleep 1; done" &

# Phase 5: Insider Threat (improved)
echo -e "\n🕵️ PHASE 5: Simulating INSIDER THREAT"
kubectl exec -n $NAMESPACE $POD_NAME -- sh -c "for i in {1..10}; do find /proc/ -maxdepth 1 -type f -exec cat {} + >/dev/null 2>&1; sleep 1; done" &

# Cleanup after 20 seconds
sleep 20
pkill -f "kubectl get pods -w"
kubectl delete pod -n $NAMESPACE ddos-simulator --force --grace-period=0 2>/dev/null
echo -e "\n🎉 All simulations completed! System should be self-healed."
