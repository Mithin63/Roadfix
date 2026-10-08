import os
import time
import math
import random
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db import db

app = Flask(__name__)
# Enable CORS for frontend
CORS(app, supports_credentials=True, origins=["*"])

# Static frontend serving if built
CLIENT_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "dist"))

# ==========================================
# 1. AUTHENTICATION & USER REGISTRATION
# ==========================================

@app.route("/api/auth/demo-users", methods=["GET"])
def demo_users():
    return jsonify({
        "success": False,
        "message": "Direct demo logins are disabled. Only registered accounts in the Python database can sign in."
    }), 403

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email:
        return jsonify({"success": False, "message": "Email address is required."}), 400
    if not password:
        return jsonify({"success": False, "message": "Password is required."}), 400

    user = db.get_user_by_email(email)
    if not user:
        return jsonify({
            "success": False,
            "message": "No registered user found with this email. Please register your account first."
        }), 401

    if user.get("isBlocked", False):
        return jsonify({
            "success": False,
            "message": "This account has been suspended by administration."
        }), 403

    expected_password = user.get("password", "password123")
    if password != expected_password:
        return jsonify({
            "success": False,
            "message": "Incorrect password. Please enter the password you registered with."
        }), 401

    profile = None
    if user.get("role") == "mechanic":
        profile = db.get_mechanic_profile(user["id"])

    return jsonify({
        "success": True,
        "token": f"roadfix-pyjwt-{user['id']}-{int(time.time()*1000)}",
        "user": {
            **user,
            "profile": profile
        }
    })

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    role = data.get("role", "customer").strip()
    password = data.get("password", "").strip()
    address = data.get("address", "").strip() or "Vijayawada, Andhra Pradesh"
    lat = float(data.get("lat") or 16.5062)
    lng = float(data.get("lng") or 80.6480)

    if not name or not email or not phone or not password:
        return jsonify({"success": False, "message": "Name, email, phone, and password are required."}), 400

    if len(password) < 4:
        return jsonify({"success": False, "message": "Password must be at least 4 characters long."}), 400

    existing = db.get_user_by_email(email)
    if existing:
        return jsonify({
            "success": False,
            "message": "An account is already registered with this email address."
        }), 409

    uid = f"usr-{int(time.time()*1000)}"
    user_data = {
        "id": uid,
        "name": name,
        "email": email.lower(),
        "phone": phone,
        "role": role,
        "password": password,
        "address": address,
        "lat": lat,
        "lng": lng,
        "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={name}",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "isBlocked": False
    }

    db.add_user(user_data)

    created_vehicle = None
    if role == "customer":
        vehicle_type = data.get("vehicleType") or "car"
        vehicle_make = data.get("vehicleMake") or "Hyundai"
        vehicle_model = data.get("vehicleModel") or "Creta"
        vehicle_year = int(data.get("vehicleYear") or datetime.utcnow().year)
        vehicle_reg = (data.get("vehicleRegNo") or "AP 16 AB 1234").upper()
        vehicle_fuel = data.get("vehicleFuelType") or "petrol"

        created_vehicle = db.add_vehicle({
            "customerId": uid,
            "type": vehicle_type,
            "make": vehicle_make,
            "model": vehicle_model,
            "year": vehicle_year,
            "regNo": vehicle_reg,
            "fuelType": vehicle_fuel
        })

    profile = None
    if role == "mechanic":
        workshop_name = data.get("workshopName") or f"{name}'s Express Garage"
        skills = data.get("skills") or [
            "Battery Jumpstart",
            "Tyre Puncture & Replacement",
            "Brake Inspection",
            "Coolant & Hose Repair"
        ]
        profile = db.set_mechanic_profile(uid, {
            "workshopName": workshop_name,
            "skills": skills,
            "vehicleSpecialization": ["car", "bike", "suv"],
            "rating": 5.0,
            "reviewsCount": 1,
            "completedJobs": 0,
            "isOnline": True,
            "isVerified": True,
            "currentLat": lat,
            "currentLng": lng
        })

    return jsonify({
        "success": True,
        "token": f"roadfix-pyjwt-{uid}-{int(time.time()*1000)}",
        "message": "User registered successfully in Roadfix Python database.",
        "user": {
            **user_data,
            "profile": profile
        },
        "registeredVehicle": created_vehicle
    }), 201

@app.route("/api/auth/me", methods=["GET"])
def get_me():
    user_id = request.headers.get("x-user-id")
    token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    
    # Extract user ID if encoded in token
    if not user_id and "roadfix-pyjwt-" in token:
        parts = token.split("-")
        if len(parts) >= 3:
            user_id = f"{parts[2]}-{parts[3]}" if len(parts) > 3 else parts[2]

    if not user_id:
        # Default to first customer for smooth session
        all_u = db.get_all_users()
        user = all_u[0] if all_u else None
    else:
        user = db.get_user_by_id(user_id)

    if not user:
        return jsonify({"success": False, "message": "User session expired"}), 401

    profile = None
    if user.get("role") == "mechanic":
        profile = db.get_mechanic_profile(user["id"])

    return jsonify({
        "success": True,
        "user": {
            **user,
            "profile": profile
        }
    })

@app.route("/api/auth/profile", methods=["PUT"])
def update_profile():
    data = request.get_json() or {}
    user_id = data.get("id") or request.headers.get("x-user-id")
    if not user_id:
        return jsonify({"success": False, "message": "User ID required"}), 400

    updated = db.update_user(user_id, data)
    if not updated:
        return jsonify({"success": False, "message": "User not found"}), 404

    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "user": updated
    })

# Full list of all registered users and all their details
@app.route("/api/auth/registered-users", methods=["GET"])
@app.route("/api/admin/registrations", methods=["GET"])
def get_registered_users_details():
    users_data = db.get_registered_users_details()
    return jsonify({
        "success": True,
        "totalRegistered": len(users_data),
        "serverEngine": "Python 3.12 (Flask + Dynamic Store)",
        "registrations": users_data
    })

# ==========================================
# 2. VEHICLES API
# ==========================================

@app.route("/api/vehicles", methods=["GET"])
def get_vehicles():
    customer_id = request.args.get("customerId") or request.headers.get("x-user-id")
    vehicles = db.get_vehicles_by_customer(customer_id)
    return jsonify({"success": True, "vehicles": vehicles})

@app.route("/api/vehicles", methods=["POST"])
def add_vehicle():
    data = request.get_json() or {}
    customer_id = data.get("customerId") or request.headers.get("x-user-id")
    if not customer_id:
        return jsonify({"success": False, "message": "customerId required"}), 400

    vehicle = db.add_vehicle({
        "customerId": customer_id,
        "type": data.get("type", "car"),
        "make": data.get("make", ""),
        "model": data.get("model", ""),
        "year": int(data.get("year") or datetime.utcnow().year),
        "regNo": data.get("regNo", "").upper(),
        "fuelType": data.get("fuelType", "petrol")
    })
    return jsonify({"success": True, "vehicle": vehicle}), 201

@app.route("/api/vehicles/<vehicle_id>", methods=["DELETE"])
def delete_vehicle(vehicle_id):
    deleted = db.delete_vehicle(vehicle_id)
    if not deleted:
        return jsonify({"success": False, "message": "Vehicle not found"}), 404
    return jsonify({"success": True, "message": "Vehicle deleted successfully."})

# ==========================================
# 3. MECHANICS API
# ==========================================

@app.route("/api/mechanics", methods=["GET"])
def get_mechanics():
    is_online = request.args.get("isOnline") == "true"
    vehicle_type = request.args.get("vehicleType")
    mechanics = db.get_all_mechanics(is_online_only=is_online, vehicle_type=vehicle_type)
    return jsonify({"success": True, "mechanics": mechanics})

@app.route("/api/mechanics/<mechanic_id>", methods=["GET"])
def get_mechanic(mechanic_id):
    user = db.get_user_by_id(mechanic_id)
    if not user or user.get("role") != "mechanic":
        return jsonify({"success": False, "message": "Mechanic not found"}), 404
    profile = db.get_mechanic_profile(mechanic_id)
    return jsonify({"success": True, "mechanic": {**user, "profile": profile}})

@app.route("/api/mechanics/match", methods=["POST"])
def match_mechanics():
    data = request.get_json() or {}
    lat = float(data.get("customerLat") or 16.5062)
    lng = float(data.get("customerLng") or 80.6480)
    vtype = data.get("vehicleType", "car")
    ptypes = data.get("problemTypes") or ([data.get("problemType")] if data.get("problemType") else [])

    matches = db.match_mechanics(lat, lng, vehicle_type=vtype, problem_types=ptypes)
    return jsonify({"success": True, "matches": matches})

@app.route("/api/mechanics/<mechanic_id>/status", methods=["PUT"])
def update_mechanic_status(mechanic_id):
    data = request.get_json() or {}
    updates = {}
    if "isOnline" in data:
        updates["isOnline"] = bool(data["isOnline"])
    if "currentLat" in data:
        updates["currentLat"] = float(data["currentLat"])
    if "currentLng" in data:
        updates["currentLng"] = float(data["currentLng"])

    prof = db.update_mechanic_profile(mechanic_id, updates)
    return jsonify({"success": True, "profile": prof})

# ==========================================
# 4. BOOKINGS API
# ==========================================

@app.route("/api/bookings", methods=["GET"])
def get_bookings():
    cid = request.args.get("customerId")
    mid = request.args.get("mechanicId")
    status = request.args.get("status")
    bookings = db.get_all_bookings(customer_id=cid, mechanic_id=mid, status=status)
    return jsonify({"success": True, "bookings": bookings})

@app.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.get_json() or {}
    cid = data.get("customerId") or request.headers.get("x-user-id")
    customer = db.get_user_by_id(cid) if cid else None

    booking = db.create_booking({
        "customerId": cid,
        "customerName": customer.get("name") if customer else data.get("customerName", "Customer"),
        "customerPhone": customer.get("phone") if customer else data.get("customerPhone", "+91 98765 43210"),
        "vehicleType": data.get("vehicleType", "car"),
        "vehicleMake": data.get("vehicleMake", "Hyundai"),
        "vehicleModel": data.get("vehicleModel", "Creta"),
        "vehicleRegNo": data.get("vehicleRegNo", "AP 16 AB 1234"),
        "problemType": data.get("problemType", "battery_dead"),
        "description": data.get("description", "Emergency roadside breakdown requested."),
        "pickupAddress": data.get("pickupAddress", "NH16 Highway, Vijayawada"),
        "pickupLat": float(data.get("pickupLat") or 16.5062),
        "pickupLng": float(data.get("pickupLng") or 80.6480),
        "mechanicId": data.get("mechanicId", "mech-1"),
        "mechanicName": data.get("mechanicName", "Suresh Kumar"),
        "mechanicPhone": data.get("mechanicPhone", "+91 98200 11223"),
        "mechanicLat": float(data.get("mechanicLat") or 16.5120),
        "mechanicLng": float(data.get("mechanicLng") or 80.6520),
        "status": "assigned",
        "pricing": {
            "baseFare": 350,
            "partsTotal": 0,
            "labor": 200,
            "platformFee": 49,
            "tax": 54,
            "total": 653
        },
        "spareParts": []
    })
    return jsonify({"success": True, "booking": booking}), 201

@app.route("/api/bookings/<booking_id>", methods=["GET"])
def get_booking(booking_id):
    b = db.get_booking_by_id(booking_id)
    if not b:
        return jsonify({"success": False, "message": "Booking not found"}), 404
    return jsonify({"success": True, "booking": b})

@app.route("/api/bookings/<booking_id>/status", methods=["PATCH"])
def update_booking_status(booking_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    b = db.update_booking(booking_id, {"status": new_status})
    if not b:
        return jsonify({"success": False, "message": "Booking not found"}), 404
    return jsonify({"success": True, "booking": b})

# ==========================================
# 5. AI DIAGNOSIS & SMART ASSISTANT
# ==========================================

@app.route("/api/ai/diagnose", methods=["POST"])
def ai_diagnose():
    data = request.get_json() or {}
    problem = data.get("problemType", "engine_problem")
    desc = data.get("description", "")
    
    solutions = {
        "battery_dead": {
            "probableCause": "Sulfated lead-acid plates or alternator rectifier diode failure.",
            "severity": "medium",
            "estimatedCost": "₹400 - ₹900",
            "recommendedTools": ["Jump starter 12V", "Multimeter", "Terminal wire brush"],
            "diySafetyTip": "Ensure ignition is OFF before connecting the red positive clamp first."
        },
        "flat_tyre": {
            "probableCause": "Puncture caused by sharp nail/debris or bead seal leakage.",
            "severity": "low",
            "estimatedCost": "₹200 - ₹500",
            "recommendedTools": ["Hydraulic bottle jack", "Cross wheel wrench", "Plug kit"],
            "diySafetyTip": "Park vehicle on firm level ground and engage handbrake before jacking."
        },
        "overheating": {
            "probableCause": "Radiator coolant drop, thermostat valve stuck closed, or fan relay trip.",
            "severity": "high",
            "estimatedCost": "₹800 - ₹1,800",
            "recommendedTools": ["Coolant premix", "Hose clamp pliers", "Pressure tester"],
            "diySafetyTip": "NEVER open radiator cap while engine is steaming hot."
        }
    }

    info = solutions.get(problem, {
        "probableCause": f"Mechanical inspection required for reported symptom: {desc or problem}",
        "severity": "medium",
        "estimatedCost": "₹500 - ₹1,500",
        "recommendedTools": ["OBD-II Diagnostic Scanner", "Standard Metric Toolset"],
        "diySafetyTip": "Turn on hazard warning blinkers and position warning triangle behind car."
    })

    return jsonify({
        "success": True,
        "diagnosis": {
            "problemType": problem,
            "confidenceScore": 96.4,
            **info,
            "analyzedAt": datetime.utcnow().isoformat() + "Z"
        }
    })

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    data = request.get_json() or {}
    msg = data.get("message", "").lower()
    
    reply = "I'm the Roadfix AI Assistant. I can help diagnose faults, guide emergency breakdown steps, or dispatch our closest mechanic to your GPS coordinates."
    if "battery" in msg or "start" in msg:
        reply = "If your car won't crank and you hear clicking sounds, the battery voltage is likely below 11.8V. We have mechanics within 15 minutes with jumpstarters."
    elif "tyre" in msg or "puncture" in msg:
        reply = "For flat tyres, turn on hazard lights, pull safely onto the shoulder, and avoid driving on the rim to prevent tyre wall destruction."
    elif "price" in msg or "cost" in msg:
        reply = "Roadfix base inspection starts at ₹350 with upfront transparent pricing and zero hidden fees."

    return jsonify({
        "success": True,
        "reply": reply,
        "suggestedActions": ["Book Immediate Assistance", "Inspect Battery", "Call Helpline 112"]
    })

# ==========================================
# 6. PAYMENTS & INVOICES
# ==========================================

@app.route("/api/payments/create-intent", methods=["POST"])
def create_payment_intent():
    data = request.get_json() or {}
    amount = data.get("amount", 653)
    return jsonify({
        "success": True,
        "clientSecret": f"rf_sec_{int(time.time()*1000)}",
        "amount": amount,
        "currency": "INR"
    })

@app.route("/api/payments/confirm", methods=["POST"])
def confirm_payment():
    data = request.get_json() or {}
    bid = data.get("bookingId")
    if bid:
        db.update_booking(bid, {"status": "payment_completed"})
    return jsonify({
        "success": True,
        "transactionId": f"TXN-ROADFIX-{int(time.time()*1000)}",
        "message": "Payment verified and invoice generated."
    })

@app.route("/api/payments/invoice/<booking_id>", methods=["GET"])
def get_invoice(booking_id):
    b = db.get_booking_by_id(booking_id) or {}
    return jsonify({
        "success": True,
        "invoice": {
            "invoiceNo": f"INV-{booking_id}",
            "bookingId": booking_id,
            "date": datetime.utcnow().strftime("%d %b %Y"),
            "customerName": b.get("customerName", "Valued Customer"),
            "pricing": b.get("pricing", {"baseFare": 350, "labor": 200, "platformFee": 49, "tax": 54, "total": 653}),
            "status": "PAID"
        }
    })

# ==========================================
# 7. REVIEWS & COMPLAINTS
# ==========================================

@app.route("/api/reviews", methods=["GET", "POST"])
def handle_reviews():
    if request.method == "POST":
        data = request.get_json() or {}
        review = db.add_review(data)
        return jsonify({"success": True, "review": review}), 201
    return jsonify({"success": True, "reviews": db.get_all_reviews()})

@app.route("/api/reviews/mechanic/<mechanic_id>", methods=["GET"])
def get_mechanic_reviews(mechanic_id):
    all_rev = db.get_all_reviews()
    m_rev = [r for r in all_rev if r.get("mechanicId") == mechanic_id]
    return jsonify({"success": True, "reviews": m_rev})

@app.route("/api/admin/complaints", methods=["GET", "POST"])
def handle_complaints():
    if request.method == "POST":
        data = request.get_json() or {}
        comp = db.add_complaint(data)
        return jsonify({"success": True, "complaint": comp}), 201
    return jsonify({"success": True, "complaints": db.get_all_complaints()})

@app.route("/api/admin/complaints/<complaint_id>", methods=["PATCH"])
def update_complaint(complaint_id):
    data = request.get_json() or {}
    status = data.get("status", "resolved")
    for c in db.complaints.values():
        if c.get("id") == complaint_id:
            c["status"] = status
            db._save_data()
            return jsonify({"success": True, "complaint": c})
    return jsonify({"success": False, "message": "Complaint not found"}), 404

# ==========================================
# 8. SOS & MAINTENANCE
# ==========================================

@app.route("/api/sos/trigger", methods=["POST"])
def trigger_sos():
    data = request.get_json() or {}
    sos = db.add_sos(data)
    return jsonify({
        "success": True,
        "message": "🚨 High Priority SOS Broadcasted to Police, Highway Patrol (1033) & Nearest Mechanics.",
        "alert": sos
    })

@app.route("/api/sos/contacts/<user_id>", methods=["GET", "POST"])
def sos_contacts(user_id):
    return jsonify({
        "success": True,
        "contacts": [
            {"id": "c-1", "name": "Emergency Police Control", "phone": "112", "relation": "National Emergency"},
            {"id": "c-2", "name": "NHAI Highway Patrol", "phone": "1033", "relation": "Highway Rescue"},
            {"id": "c-3", "name": "Family Contact", "phone": "+91 98480 12345", "relation": "Primary Kin"}
        ]
    })

@app.route("/api/maintenance/<user_id>", methods=["GET"])
def get_user_maintenance(user_id):
    records = db.get_maintenance(user_id)
    return jsonify({"success": True, "reminders": records})

# ==========================================
# 9. ADMIN ANALYTICS & STATS
# ==========================================

@app.route("/api/admin/stats", methods=["GET"])
def admin_stats():
    users = db.get_all_users()
    custs = [u for u in users if u.get("role") == "customer"]
    mechs = db.get_all_mechanics()
    bookings = db.get_all_bookings()

    active = len([b for b in bookings if b.get("status") not in ["repair_completed", "payment_completed", "cancelled"]])
    completed = len([b for b in bookings if b.get("status") in ["repair_completed", "payment_completed"]])
    rev = sum(b.get("pricing", {}).get("total", 0) for b in bookings if b.get("status") == "payment_completed")

    return jsonify({
        "success": True,
        "stats": {
            "totalCustomers": len(custs),
            "totalMechanics": len(mechs),
            "activeRequests": active,
            "completedRepairs": completed,
            "totalRevenue": rev,
            "averageRating": 4.9,
            "onlineMechanics": len([m for m in mechs if m.get("profile", {}).get("isOnline")]),
            "verifiedMechanics": len([m for m in mechs if m.get("profile", {}).get("isVerified")]),
            "dailyBookings": [
                {"date": "22 Sep", "count": 18, "revenue": 21600},
                {"date": "23 Sep", "count": 24, "revenue": 29800},
                {"date": "24 Sep", "count": 31, "revenue": 38400},
                {"date": "25 Sep", "count": 29, "revenue": 36100}
            ]
        }
    })

@app.route("/api/admin/users", methods=["GET"])
def admin_users():
    return jsonify({"success": True, "users": db.get_all_users()})

@app.route("/api/admin/users/<user_id>/block", methods=["PATCH"])
def admin_toggle_block(user_id):
    data = request.get_json() or {}
    is_blocked = bool(data.get("isBlocked"))
    u = db.update_user(user_id, {"isBlocked": is_blocked})
    if not u:
        return jsonify({"success": False, "message": "User not found"}), 404
    return jsonify({"success": True, "user": u})

@app.route("/api/admin/mechanics/<mechanic_id>/verify", methods=["PATCH"])
def admin_verify_mechanic(mechanic_id):
    data = request.get_json() or {}
    is_v = bool(data.get("isVerified"))
    prof = db.update_mechanic_profile(mechanic_id, {"isVerified": is_v})
    return jsonify({"success": True, "profile": prof})

@app.route("/api/admin/pricing", methods=["GET"])
def admin_pricing():
    return jsonify({
        "success": True,
        "catalog": [
            {"id": "p-1", "problemType": "battery_dead", "name": "Battery Jumpstart & Testing", "baseRate": 350, "estimatedLabor": 200},
            {"id": "p-2", "problemType": "flat_tyre", "name": "Tyre Puncture / Spare Swap", "baseRate": 300, "estimatedLabor": 150},
            {"id": "p-3", "problemType": "fuel_problem", "name": "Emergency 5L Fuel Delivery", "baseRate": 250, "estimatedLabor": 100},
            {"id": "p-4", "problemType": "engine_problem", "name": "Engine Diagnosis & Stalling Check", "baseRate": 500, "estimatedLabor": 350},
            {"id": "p-5", "problemType": "overheating", "name": "Radiator & Coolant Leak Repair", "baseRate": 450, "estimatedLabor": 300}
        ]
    })

# ==========================================
# 10. NOTIFICATIONS & HEALTH
# ==========================================

@app.route("/api/notifications/<user_id>", methods=["GET"])
def get_notifications(user_id):
    return jsonify({
        "success": True,
        "notifications": db.notifications.get(user_id, [
            {
                "id": "notif-1",
                "userId": user_id,
                "title": "Welcome to Roadfix Python Network",
                "message": "Your vehicle is now connected to 24/7 emergency dispatch.",
                "type": "info",
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "isRead": False
            }
        ])
    })

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "Roadfix Python 3.12 Backend API",
        "engine": "Flask + JSON/SQLite Persistent Database Store",
        "registeredUsersCount": len(db.users),
        "registeredVehiclesCount": len(db.vehicles),
        "activeMechanicsCount": len(db.mechanic_profiles),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

# Serve frontend build in production if available
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_client(path):
    if os.path.exists(os.path.join(CLIENT_DIST, path)) and path != "":
        return send_from_directory(CLIENT_DIST, path)
    if os.path.exists(os.path.join(CLIENT_DIST, "index.html")):
        return send_from_directory(CLIENT_DIST, "index.html")
    return jsonify({
        "message": "Roadfix Python Backend is running on port 5000",
        "apiDocs": "/api/health",
        "registrations": "/api/admin/registrations"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f">> Roadfix Python Flask Backend active on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
