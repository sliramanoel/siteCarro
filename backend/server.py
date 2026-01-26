from fastapi import FastAPI, APIRouter, HTTPException, status, Body
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    site_name: str = "AutoLeilão"
    logo_url: str = ""
    primary_color: str = "#DC2626"
    address: str = ""
    phone: str = ""
    email: str = ""
    facebook_url: str = ""
    instagram_url: str = ""
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None

class Seller(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    whatsapp: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SellerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    whatsapp: str

class SellerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None

class Car(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    model: str
    year: int
    km: int
    price: float
    description: str
    images: List[str] = []
    seller_id: str
    status: str = "available"
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    brand: str
    model: str
    year: int
    km: int
    price: float
    description: str
    images: List[str]
    status: str
    featured: bool
    created_at: datetime

class CarCreate(BaseModel):
    brand: str
    model: str
    year: int
    km: int
    price: float
    description: str
    images: List[str] = []
    seller_id: str
    status: str = "available"
    featured: bool = False

class CarUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    km: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    seller_id: Optional[str] = None
    status: Optional[str] = None
    featured: Optional[bool] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    token: str
    username: str

class CarWithSeller(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    brand: str
    model: str
    year: int
    km: int
    price: float
    description: str
    images: List[str]
    status: str
    created_at: datetime
    seller: Optional[Seller] = None

class StoreInfo(BaseModel):
    whatsapp: str
    name: str = "AutoLeilão"

# ============ HELPER FUNCTIONS ============

def create_access_token(username: str) -> str:
    payload = {"sub": username, "exp": datetime.now(timezone.utc).timestamp() + 86400}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except:
        return None

async def init_admin():
    admin_exists = await db.admins.find_one({"username": "admin"})
    if not admin_exists:
        hashed = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "username": "admin",
            "password": hashed.decode('utf-8')
        })
        logger.info("Admin user created: username=admin, password=admin123")

async def init_site_settings():
    settings_exists = await db.site_settings.find_one({"id": "site_settings"})
    if not settings_exists:
        default_settings = SiteSettings()
        doc = default_settings.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.site_settings.insert_one(doc)
        logger.info("Default site settings created")

# ============ PUBLIC ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Car Auction API"}

@api_router.get("/store-info", response_model=StoreInfo)
async def get_store_info():
    whatsapp = os.environ.get('WHATSAPP_LOJA', '5511999999999')
    return StoreInfo(whatsapp=whatsapp, name="AutoLeilão")

@api_router.get("/settings", response_model=SiteSettings)
async def get_public_settings():
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        default_settings = SiteSettings()
        return default_settings
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return SiteSettings(**settings)

@api_router.get("/cars", response_model=List[CarPublic])
async def get_cars(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    cars = await db.cars.find(query, {"_id": 0}).to_list(1000)
    
    result = []
    for car in cars:
        if isinstance(car.get('created_at'), str):
            car['created_at'] = datetime.fromisoformat(car['created_at'])
        
        # Remove seller_id from public view
        car_public = CarPublic(
            id=car['id'],
            brand=car['brand'],
            model=car['model'],
            year=car['year'],
            km=car['km'],
            price=car['price'],
            description=car['description'],
            images=car['images'],
            status=car['status'],
            created_at=car['created_at']
        )
        result.append(car_public)
    
    return result

@api_router.get("/cars/{car_id}", response_model=CarPublic)
async def get_car(car_id: str):
    car = await db.cars.find_one({"id": car_id}, {"_id": 0})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    if isinstance(car.get('created_at'), str):
        car['created_at'] = datetime.fromisoformat(car['created_at'])
    
    # Return without seller info for public view
    return CarPublic(
        id=car['id'],
        brand=car['brand'],
        model=car['model'],
        year=car['year'],
        km=car['km'],
        price=car['price'],
        description=car['description'],
        images=car['images'],
        status=car['status'],
        created_at=car['created_at']
    )

# ============ AUTH ROUTES ============

@api_router.post("/auth/login", response_model=AdminResponse)
async def admin_login(credentials: AdminLogin):
    admin = await db.admins.find_one({"username": credentials.username})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), admin['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(credentials.username)
    return AdminResponse(token=token, username=credentials.username)

# ============ ADMIN ROUTES - SETTINGS ============

@api_router.get("/admin/settings", response_model=SiteSettings)
async def get_admin_settings():
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        default_settings = SiteSettings()
        doc = default_settings.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.site_settings.insert_one(doc)
        return default_settings
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return SiteSettings(**settings)

@api_router.put("/admin/settings", response_model=SiteSettings)
async def update_settings(settings_data: SiteSettingsUpdate):
    update_data = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    if update_data:
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.site_settings.update_one(
            {"id": "site_settings"},
            {"$set": update_data},
            upsert=True
        )
    
    updated = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return SiteSettings(**updated)

# ============ ADMIN ROUTES - SELLERS ============

@api_router.get("/admin/sellers", response_model=List[Seller])
async def get_sellers():
    sellers = await db.sellers.find({}, {"_id": 0}).to_list(1000)
    for seller in sellers:
        if isinstance(seller.get('created_at'), str):
            seller['created_at'] = datetime.fromisoformat(seller['created_at'])
    return sellers

@api_router.post("/admin/sellers", response_model=Seller)
async def create_seller(seller_data: SellerCreate):
    seller = Seller(**seller_data.model_dump())
    doc = seller.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sellers.insert_one(doc)
    return seller

@api_router.put("/admin/sellers/{seller_id}", response_model=Seller)
async def update_seller(seller_id: str, seller_data: SellerUpdate):
    existing = await db.sellers.find_one({"id": seller_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    update_data = {k: v for k, v in seller_data.model_dump().items() if v is not None}
    if update_data:
        await db.sellers.update_one({"id": seller_id}, {"$set": update_data})
    
    updated = await db.sellers.find_one({"id": seller_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Seller(**updated)

@api_router.delete("/admin/sellers/{seller_id}")
async def delete_seller(seller_id: str):
    result = await db.sellers.delete_one({"id": seller_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Seller not found")
    return {"message": "Seller deleted successfully"}

# ============ ADMIN ROUTES - CARS ============

@api_router.get("/admin/cars", response_model=List[CarWithSeller])
async def get_admin_cars():
    cars = await db.cars.find({}, {"_id": 0}).to_list(1000)
    result = []
    for car in cars:
        if isinstance(car.get('created_at'), str):
            car['created_at'] = datetime.fromisoformat(car['created_at'])
        
        seller = await db.sellers.find_one({"id": car.get("seller_id")}, {"_id": 0})
        if seller and isinstance(seller.get('created_at'), str):
            seller['created_at'] = datetime.fromisoformat(seller['created_at'])
        
        car_with_seller = CarWithSeller(**car, seller=Seller(**seller) if seller else None)
        result.append(car_with_seller)
    
    return result

@api_router.post("/admin/cars", response_model=Car)
async def create_car(car_data: CarCreate):
    # Verify seller exists
    seller = await db.sellers.find_one({"id": car_data.seller_id})
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    car = Car(**car_data.model_dump())
    doc = car.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.cars.insert_one(doc)
    return car

@api_router.put("/admin/cars/{car_id}", response_model=Car)
async def update_car(car_id: str, car_data: CarUpdate):
    existing = await db.cars.find_one({"id": car_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Car not found")
    
    update_data = {k: v for k, v in car_data.model_dump().items() if v is not None}
    if update_data:
        await db.cars.update_one({"id": car_id}, {"$set": update_data})
    
    updated = await db.cars.find_one({"id": car_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Car(**updated)

@api_router.delete("/admin/cars/{car_id}")
async def delete_car(car_id: str):
    result = await db.cars.delete_one({"id": car_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    return {"message": "Car deleted successfully"}

@api_router.get("/admin/stats")
async def get_stats():
    total_cars = await db.cars.count_documents({})
    available_cars = await db.cars.count_documents({"status": "available"})
    sold_cars = await db.cars.count_documents({"status": "sold"})
    total_sellers = await db.sellers.count_documents({})
    
    return {
        "total_cars": total_cars,
        "available_cars": available_cars,
        "sold_cars": sold_cars,
        "total_sellers": total_sellers
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_admin()
    await init_site_settings()
    logger.info("Application started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
