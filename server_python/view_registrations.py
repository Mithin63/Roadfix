"""
Roadfix - View Registered Users & Details
Run: python view_registrations.py
"""
import json
import os
from db import db

def print_banner():
    print("=" * 80)
    print(" ROADFIX - REGISTERED USERS & SYSTEM ACCOUNTS DATABASE")
    print("=" * 80)

def display_registrations():
    print_banner()
    regs = db.get_registered_users_details()
    
    print(f"\nTotal Registered Users in Python Database: {len(regs)}\n")
    
    for idx, u in enumerate(regs, 1):
        role_badge = f"[{u['role'].upper()}]"
        blocked_badge = " [SUSPENDED/BLOCKED]" if u.get("isBlocked") else ""
        print(f"{idx}. {u['name']} ({u['email']}) {role_badge}{blocked_badge}")
        print(f"   |-- User ID:    {u['id']}")
        print(f"   |-- Phone:      {u['phone']}")
        print(f"   |-- Address:    {u['address']} (Lat: {u.get('lat')}, Lng: {u.get('lng')})")
        print(f"   |-- Joined:     {u['createdAt']}")
        
        if u["role"] == "customer":
            vehicles = u.get("vehicles", [])
            print(f"   |-- Vehicles Registered ({len(vehicles)}):")
            if vehicles:
                for v in vehicles:
                    print(f"   |   * {v.get('year', '')} {v.get('make', '')} {v.get('model', '')} | Reg: {v.get('regNo', 'N/A')} | Fuel: {v.get('fuelType', 'petrol')}")
            else:
                print("   |   * No vehicles registered yet.")
                
        elif u["role"] == "mechanic":
            prof = u.get("mechanicProfile") or {}
            print(f"   |-- Workshop:   {prof.get('workshopName', 'Authorized Dispatch')}")
            print(f"   |-- Rating:     {prof.get('rating', 5.0)} ({prof.get('reviewsCount', 0)} reviews)")
            print(f"   |-- Status:     {'ONLINE' if prof.get('isOnline') else 'OFFLINE'} | Verified: {prof.get('isVerified', False)}")
            skills = prof.get("skills", [])
            print(f"   |-- Skills:     {', '.join(skills) if skills else 'General Repairs'}")
            
        print("   " + "-" * 70)

if __name__ == "__main__":
    display_registrations()
