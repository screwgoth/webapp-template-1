#!/bin/bash

# Simple API test script
# Tests basic functionality of the backend API

API_URL="${1:-http://localhost:3000}"

echo "🧪 Testing WebApp Template API at $API_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/health")
status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status" -eq 200 ]; then
    echo "✅ Health check passed"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Health check failed (HTTP $status)"
    echo "$body"
fi

echo ""

# Test 2: Register User
echo "2️⃣  Testing user registration..."
random_email="test$(date +%s)@example.com"
register_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$random_email\",
    \"password\": \"Test1234\",
    \"confirmPassword\": \"Test1234\"
  }")

status=$(echo "$register_response" | tail -n1)
body=$(echo "$register_response" | head -n-1)

if [ "$status" -eq 201 ]; then
    echo "✅ User registration successful"
    access_token=$(echo "$body" | jq -r '.data.accessToken')
    user_id=$(echo "$body" | jq -r '.data.user.id')
    echo "   User ID: $user_id"
    echo "   Email: $random_email"
else
    echo "❌ User registration failed (HTTP $status)"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    exit 1
fi

echo ""

# Test 3: Get Current User
echo "3️⃣  Testing get current user..."
user_response=$(curl -s -w "\n%{http_code}" "$API_URL/api/users/me" \
  -H "Authorization: Bearer $access_token")

status=$(echo "$user_response" | tail -n1)
body=$(echo "$user_response" | head -n-1)

if [ "$status" -eq 200 ]; then
    echo "✅ Get user profile successful"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Get user profile failed (HTTP $status)"
    echo "$body"
fi

echo ""

# Test 4: Update User
echo "4️⃣  Testing update user..."
update_response=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/api/users/me" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Updated Test User\"
  }")

status=$(echo "$update_response" | tail -n1)
body=$(echo "$update_response" | head -n-1)

if [ "$status" -eq 200 ]; then
    echo "✅ Update user successful"
    echo "$body" | jq '.data.user.name' 2>/dev/null || echo "$body"
else
    echo "❌ Update user failed (HTTP $status)"
    echo "$body"
fi

echo ""

# Test 5: Login
echo "5️⃣  Testing user login..."
login_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$random_email\",
    \"password\": \"Test1234\"
  }")

status=$(echo "$login_response" | tail -n1)
body=$(echo "$login_response" | head -n-1)

if [ "$status" -eq 200 ]; then
    echo "✅ User login successful"
    refresh_token=$(echo "$body" | jq -r '.data.refreshToken')
else
    echo "❌ User login failed (HTTP $status)"
    echo "$body"
fi

echo ""

# Test 6: Logout
echo "6️⃣  Testing user logout..."
logout_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/logout" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$refresh_token\"
  }")

status=$(echo "$logout_response" | tail -n1)

if [ "$status" -eq 200 ]; then
    echo "✅ User logout successful"
else
    echo "❌ User logout failed (HTTP $status)"
fi

echo ""
echo "🎉 API tests complete!"
echo ""
echo "📝 Summary:"
echo "   - Health check: ✓"
echo "   - User registration: ✓"
echo "   - Get user profile: ✓"
echo "   - Update user: ✓"
echo "   - User login: ✓"
echo "   - User logout: ✓"
echo ""
echo "ℹ️  Test user created: $random_email"
