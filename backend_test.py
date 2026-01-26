import requests
import sys
import json
from datetime import datetime

class CarAuctionAPITester:
    def __init__(self, base_url="https://venda-veiculos-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_cars(self):
        """Test getting available cars"""
        success, response = self.run_test("Get Available Cars", "GET", "cars?status=available", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} available cars")
            return response
        return []

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Login successful, token received")
            return True
        return False

    def test_admin_stats(self):
        """Test admin statistics endpoint"""
        success, response = self.run_test("Admin Statistics", "GET", "admin/stats", 200)
        if success:
            print(f"   Stats: {response}")
        return success, response

    def test_get_sellers(self):
        """Test getting sellers"""
        success, response = self.run_test("Get Sellers", "GET", "admin/sellers", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} sellers")
            return response
        return []

    def test_get_admin_cars(self):
        """Test getting all cars (admin view)"""
        success, response = self.run_test("Get Admin Cars", "GET", "admin/cars", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} cars in admin view")
            return response
        return []

    def test_create_seller(self):
        """Test creating a new seller"""
        test_seller = {
            "name": f"Test Seller {datetime.now().strftime('%H%M%S')}",
            "phone": "(11) 99999-9999",
            "whatsapp": "5511999999999",
            "email": "test@example.com"
        }
        
        success, response = self.run_test(
            "Create Seller",
            "POST",
            "admin/sellers",
            200,
            data=test_seller
        )
        
        if success and 'id' in response:
            print(f"   Created seller with ID: {response['id']}")
            return response['id']
        return None

    def test_create_car(self, seller_id):
        """Test creating a new car"""
        if not seller_id:
            self.log_test("Create Car", False, "No seller ID available")
            return None
            
        test_car = {
            "brand": "Test Brand",
            "model": "Test Model",
            "year": 2023,
            "km": 10000,
            "price": 50000.00,
            "description": "Test car description",
            "seller_id": seller_id,
            "status": "available",
            "images": ["https://via.placeholder.com/800x600?text=Test+Car"]
        }
        
        success, response = self.run_test(
            "Create Car",
            "POST",
            "admin/cars",
            200,
            data=test_car
        )
        
        if success and 'id' in response:
            print(f"   Created car with ID: {response['id']}")
            return response['id']
        return None

    def test_get_car_details(self, car_id):
        """Test getting car details"""
        if not car_id:
            self.log_test("Get Car Details", False, "No car ID available")
            return False
            
        success, response = self.run_test(
            "Get Car Details",
            "GET",
            f"cars/{car_id}",
            200
        )
        
        if success and 'seller' in response:
            print(f"   Car details include seller info: {response['seller']['name'] if response['seller'] else 'No seller'}")
        
        return success

    def test_update_car(self, car_id):
        """Test updating a car"""
        if not car_id:
            self.log_test("Update Car", False, "No car ID available")
            return False
            
        update_data = {
            "price": 55000.00,
            "description": "Updated test car description"
        }
        
        success, response = self.run_test(
            "Update Car",
            "PUT",
            f"admin/cars/{car_id}",
            200,
            data=update_data
        )
        
        return success

    def test_delete_car(self, car_id):
        """Test deleting a car"""
        if not car_id:
            self.log_test("Delete Car", False, "No car ID available")
            return False
            
        success, response = self.run_test(
            "Delete Car",
            "DELETE",
            f"admin/cars/{car_id}",
            200
        )
        
        return success

    def test_delete_seller(self, seller_id):
        """Test deleting a seller"""
        if not seller_id:
            self.log_test("Delete Seller", False, "No seller ID available")
            return False
            
        success, response = self.run_test(
            "Delete Seller",
            "DELETE",
            f"admin/sellers/{seller_id}",
            200
        )
        
        return success

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting Car Auction API Tests")
        print(f"   Base URL: {self.base_url}")
        print("=" * 60)

        # Test basic endpoints
        self.test_root_endpoint()
        
        # Test public endpoints
        cars = self.test_get_cars()
        
        # Test admin authentication
        if not self.test_admin_login():
            print("\n❌ Admin login failed - stopping admin tests")
            self.print_summary()
            return False

        # Test admin endpoints
        stats_success, stats = self.test_admin_stats()
        sellers = self.test_get_sellers()
        admin_cars = self.test_get_admin_cars()
        
        # Test CRUD operations
        seller_id = self.test_create_seller()
        car_id = self.test_create_car(seller_id)
        
        # Test car operations
        self.test_get_car_details(car_id)
        self.test_update_car(car_id)
        
        # Cleanup test data
        self.test_delete_car(car_id)
        self.test_delete_seller(seller_id)
        
        self.print_summary()
        return self.tests_passed == self.tests_run

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['test']}: {result['details']}")

def main():
    tester = CarAuctionAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())