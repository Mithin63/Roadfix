import json
import os
import time
import math
from datetime import datetime
from typing import Dict, List, Optional, Any

DATA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "server", "src", "data", "database_store.json"))
FALLBACK_DATA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "database_store.json"))

class RoadfixDB:
    def __init__(self):
        self.users: Dict[str, dict] = {}
        self.vehicles: Dict[str, dict] = {}
        self.mechanic_profiles: Dict[str, dict] = {}
        self.bookings: Dict[str, dict] = {}
        self.reviews: Dict[str, dict] = {}
        self.chat_messages: Dict[str, List[dict]] = {}
        self.complaints: Dict[str, dict] = {}
        self.maintenance_records: Dict[str, Any] = {}
        self.emergency_contacts: Dict[str, Any] = {}
        self.sos_alerts: Dict[str, dict] = {}
        self.notifications: Dict[str, List[dict]] = {}
        self.load_data()

    def _get_active_file_path(self) -> str:
        if os.path.exists(DATA_FILE):
            return DATA_FILE
        return FALLBACK_DATA_FILE

    def load_data(self):
        target = self._get_active_file_path()
        if not os.path.exists(target):
            print(f"[Python DB] Initializing fresh database store at {target}")
            self._save_data()
            return

        try:
            with open(target, "r", encoding="utf-8") as f:
                data = json.load(f)

            def parse_map(raw):
                if isinstance(raw, list):
                    res = {}
                    for item in raw:
                        if isinstance(item, list) and len(item) == 2:
                            res[str(item[0])] = item[1]
                        elif isinstance(item, dict) and "id" in item:
                            res[str(item["id"])] = item
                    return res
                elif isinstance(raw, dict):
                    return raw
                return {}

            self.users = parse_map(data.get("users", []))
            self.vehicles = parse_map(data.get("vehicles", []))
            self.mechanic_profiles = parse_map(data.get("mechanics", []) or data.get("mechanicProfiles", []))
            self.bookings = parse_map(data.get("bookings", []))
            self.reviews = parse_map(data.get("reviews", []))
            self.complaints = parse_map(data.get("complaints", []))
            self.sos_alerts = parse_map(data.get("sosAlerts", []))
            self.chat_messages = parse_map(data.get("chatMessages", []))
            self.maintenance_records = parse_map(data.get("maintenanceRecords", []))
            self.emergency_contacts = parse_map(data.get("emergencyContacts", []))
            self.notifications = parse_map(data.get("notifications", []))

            print(f"[Python DB] Successfully loaded {len(self.users)} registered users, {len(self.vehicles)} vehicles, {len(self.mechanic_profiles)} mechanics from {target}")
        except Exception as e:
            print(f"[Python DB] Error loading database: {e}")

    def _save_data(self):
        target = self._get_active_file_path()
        os.makedirs(os.path.dirname(target), exist_ok=True)
        try:
            payload = {
                "users": list(self.users.items()),
                "vehicles": list(self.vehicles.items()),
                "mechanicProfiles": list(self.mechanic_profiles.items()),
                "bookings": list(self.bookings.items()),
                "reviews": list(self.reviews.items()),
                "chatMessages": list(self.chat_messages.items()),
                "complaints": list(self.complaints.items()),
                "maintenanceRecords": list(self.maintenance_records.items()),
                "emergencyContacts": list(self.emergency_contacts.items()),
                "sosAlerts": list(self.sos_alerts.items()),
                "notifications": list(self.notifications.items())
            }
            with open(target, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
        except Exception as e:
            print(f"[Python DB] Error saving data: {e}")

    # ================== USERS & REGISTRATION ==================
    def get_user_by_email(self, email: str) -> Optional[dict]:
        norm = email.strip().lower()
        for u in self.users.values():
            if u.get("email", "").strip().lower() == norm:
                return u
        return None

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        return self.users.get(user_id)

    def get_all_users(self) -> List[dict]:
        return list(self.users.values())

    def get_registered_users_details(self) -> List[dict]:
        """Returns all registered users with complete registration breakdown (vehicles, mechanic info, bookings)"""
        details = []
        for u in sorted(self.users.values(), key=lambda x: x.get("createdAt", ""), reverse=True):
            user_id = u.get("id")
            user_vehicles = [v for v in self.vehicles.values() if v.get("customerId") == user_id]
            mechanic_info = self.mechanic_profiles.get(user_id)
            user_bookings = [b for b in self.bookings.values() if b.get("customerId") == user_id or b.get("mechanicId") == user_id]
            
            details.append({
                "id": user_id,
                "name": u.get("name"),
                "email": u.get("email"),
                "phone": u.get("phone"),
                "role": u.get("role"),
                "address": u.get("address"),
                "lat": u.get("lat"),
                "lng": u.get("lng"),
                "createdAt": u.get("createdAt"),
                "isBlocked": u.get("isBlocked", False),
                "vehiclesCount": len(user_vehicles),
                "vehicles": user_vehicles,
                "mechanicProfile": mechanic_info,
                "totalBookings": len(user_bookings)
            })
        return details

    def add_user(self, user_data: dict) -> dict:
        uid = user_data.get("id") or f"usr-{int(time.time()*1000)}"
        user_data["id"] = uid
        if "createdAt" not in user_data:
            user_data["createdAt"] = datetime.utcnow().isoformat() + "Z"
        if "isBlocked" not in user_data:
            user_data["isBlocked"] = False
        self.users[uid] = user_data
        self._save_data()
        return user_data

    def update_user(self, user_id: str, updates: dict) -> Optional[dict]:
        if user_id not in self.users:
            return None
        self.users[user_id].update(updates)
        self._save_data()
        return self.users[user_id]

    # ================== VEHICLES ==================
    def get_vehicles_by_customer(self, customer_id: Optional[str] = None) -> List[dict]:
        if not customer_id:
            return list(self.vehicles.values())
        return [v for v in self.vehicles.values() if v.get("customerId") == customer_id]

    def add_vehicle(self, vehicle: dict) -> dict:
        vid = vehicle.get("id") or f"veh-{int(time.time()*1000)}"
        vehicle["id"] = vid
        if "createdAt" not in vehicle:
            vehicle["createdAt"] = datetime.utcnow().isoformat() + "Z"
        self.vehicles[vid] = vehicle
        self._save_data()
        return vehicle

    def delete_vehicle(self, vehicle_id: str) -> bool:
        if vehicle_id in self.vehicles:
            del self.vehicles[vehicle_id]
            self._save_data()
            return True
        return False

    # ================== MECHANICS ==================
    def get_all_mechanics(self, is_online_only: bool = False, vehicle_type: Optional[str] = None) -> List[dict]:
        mechanics = []
        for u in self.users.values():
            if u.get("role") == "mechanic":
                prof = self.mechanic_profiles.get(u["id"], {})
                if is_online_only and not prof.get("isOnline", False):
                    continue
                if vehicle_type and prof.get("vehicleSpecialization") and vehicle_type not in prof.get("vehicleSpecialization", []):
                    continue
                mechanics.append({**u, "profile": prof})
        return mechanics

    def get_mechanic_profile(self, mechanic_id: str) -> Optional[dict]:
        return self.mechanic_profiles.get(mechanic_id)

    def set_mechanic_profile(self, mechanic_id: str, profile: dict) -> dict:
        profile["userId"] = mechanic_id
        if "isOnline" not in profile:
            profile["isOnline"] = True
        if "isVerified" not in profile:
            profile["isVerified"] = True
        if "rating" not in profile:
            profile["rating"] = 4.8
        if "completedJobs" not in profile:
            profile["completedJobs"] = 0
        self.mechanic_profiles[mechanic_id] = profile
        self._save_data()
        return profile

    def update_mechanic_profile(self, mechanic_id: str, updates: dict) -> Optional[dict]:
        if mechanic_id not in self.mechanic_profiles:
            self.mechanic_profiles[mechanic_id] = {"userId": mechanic_id, **updates}
        else:
            self.mechanic_profiles[mechanic_id].update(updates)
        self._save_data()
        return self.mechanic_profiles[mechanic_id]

    def match_mechanics(self, customer_lat: float, customer_lng: float, vehicle_type: str = "car", problem_types: Optional[List[str]] = None) -> List[dict]:
        matches = []
        mechanics = self.get_all_mechanics(is_online_only=True)
        
        for m in mechanics:
            prof = m.get("profile", {})
            m_lat = prof.get("currentLat") or m.get("lat", customer_lat)
            m_lng = prof.get("currentLng") or m.get("lng", customer_lng)
            
            d_lat = math.radians(m_lat - customer_lat)
            d_lng = math.radians(m_lng - customer_lng)
            a = (math.sin(d_lat / 2) ** 2 +
                 math.cos(math.radians(customer_lat)) * math.cos(math.radians(m_lat)) *
                 math.sin(d_lng / 2) ** 2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            distance_km = round(6371 * c, 1)
            
            eta_minutes = max(8, int(distance_km * 2.5) + 5)
            score = round(max(70, min(99, 100 - (distance_km * 3) + (prof.get("rating", 4.5) * 5))), 1)

            matches.append({
                "mechanicId": m["id"],
                "mechanicName": m.get("name"),
                "mechanicPhone": m.get("phone"),
                "avatar": m.get("avatar"),
                "rating": prof.get("rating", 4.8),
                "reviewsCount": prof.get("reviewsCount", 42),
                "distanceKm": distance_km,
                "etaMinutes": eta_minutes,
                "matchScore": score,
                "matchReasons": [
                    f"{distance_km} km away from breakdown spot",
                    f"{prof.get('rating', 4.8)} top rated emergency responder",
                    "Certified equipment & tools onboard"
                ],
                "workshopName": prof.get("workshopName", "Roadfix Authorized Dispatch")
            })

        matches.sort(key=lambda x: x["distanceKm"])
        return matches[:6]

    # ================== BOOKINGS ==================
    def get_all_bookings(self, customer_id: Optional[str] = None, mechanic_id: Optional[str] = None, status: Optional[str] = None) -> List[dict]:
        res = list(self.bookings.values())
        if customer_id:
            res = [b for b in res if b.get("customerId") == customer_id]
        if mechanic_id:
            res = [b for b in res if b.get("mechanicId") == mechanic_id]
        if status:
            res = [b for b in res if b.get("status") == status]
        return sorted(res, key=lambda x: x.get("createdAt", ""), reverse=True)

    def get_booking_by_id(self, booking_id: str) -> Optional[dict]:
        return self.bookings.get(booking_id)

    def create_booking(self, booking_data: dict) -> dict:
        bid = booking_data.get("id") or f"RF-{datetime.utcnow().year}-{int(time.time()%100000):05d}"
        booking_data["id"] = bid
        if "createdAt" not in booking_data:
            booking_data["createdAt"] = datetime.utcnow().isoformat() + "Z"
        if "status" not in booking_data:
            booking_data["status"] = "assigned"
        self.bookings[bid] = booking_data
        self._save_data()
        return booking_data

    def update_booking(self, booking_id: str, updates: dict) -> Optional[dict]:
        if booking_id not in self.bookings:
            return None
        self.bookings[booking_id].update(updates)
        self._save_data()
        return self.bookings[booking_id]

    # ================== REVIEWS & COMPLAINTS ==================
    def get_all_reviews(self) -> List[dict]:
        return list(self.reviews.values())

    def add_review(self, review: dict) -> dict:
        rid = review.get("id") or f"rev-{int(time.time()*1000)}"
        review["id"] = rid
        if "createdAt" not in review:
            review["createdAt"] = datetime.utcnow().isoformat() + "Z"
        self.reviews[rid] = review
        self._save_data()
        return review

    def get_all_complaints(self) -> List[dict]:
        return list(self.complaints.values())

    def add_complaint(self, complaint: dict) -> dict:
        cid = complaint.get("id") or f"comp-{int(time.time()*1000)}"
        complaint["id"] = cid
        if "createdAt" not in complaint:
            complaint["createdAt"] = datetime.utcnow().isoformat() + "Z"
        if "status" not in complaint:
            complaint["status"] = "pending"
        self.complaints[cid] = complaint
        self._save_data()
        return complaint

    # ================== SOS & MAINTENANCE ==================
    def get_all_sos(self) -> List[dict]:
        return list(self.sos_alerts.values())

    def add_sos(self, sos: dict) -> dict:
        sid = sos.get("id") or f"sos-{int(time.time()*1000)}"
        sos["id"] = sid
        if "createdAt" not in sos:
            sos["createdAt"] = datetime.utcnow().isoformat() + "Z"
        if "status" not in sos:
            sos["status"] = "active"
        self.sos_alerts[sid] = sos
        self._save_data()
        return sos

    def get_maintenance(self, user_id: str) -> List[dict]:
        res = self.maintenance_records.get(user_id)
        if isinstance(res, list):
            return res
        return [
            {
                "id": f"maint-1-{user_id}",
                "vehicleId": "veh-1",
                "serviceType": "Engine Oil & Filter Replacement",
                "lastServiceDate": "2025-10-15",
                "nextDueDate": "2026-04-15",
                "mileage": 18500,
                "isDueSoon": True,
                "recommendation": "Engine oil change recommended within next 500 km."
            }
        ]

db = RoadfixDB()
