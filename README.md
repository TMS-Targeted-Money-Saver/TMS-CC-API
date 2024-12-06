# TMS-CC-API

# DreamGoal API

API untuk mengelola data *DreamGoal* pengguna, termasuk menyimpan, membaca, memperbarui, dan menghapus data tabungan.

## Base URL
https://targetted-money-saver.et.r.appspot.com/api

## Endpoints

### 1. **Save Data**
Menyimpan data *DreamGoal* baru ke database.

- **URL:**  
  `POST /dreamGoals`

- **Headers:**  
  | Key             | Value             |
  |------------------|-------------------|
  | Authorization    | Bearer `<JWT_TOKEN>` |

- **Request Body:**
  ```json
  {
      "goal_image": "<base64_encoded_image>",
      "goal_title": "My Dream Goal",
      "goal_amount": 100000,
      "goal_description": "Description of the goal",
      "goal_category": "Category of the goal",
      "goal_period": 30,
      "goal_date_started": "2024-12-06",
      "amount_saved": 0,
      "days_saved": 0,
      "daily_save": 5000
  }
Response:
Success (200):
```
{
    "message": "Data saved successfully",
    "id": "generated_goal_id",
    "imageURL": "https://storage.googleapis.com/<bucket_name>/<file_path>"
}
```
Response:
Error (400/500):
```
{
    "error": "Failed to save data",
    "details": "Error details"
}
```

### 2. **Get Dream Goals**
Mengambil semua data *DreamGoal* milik pengguna tertentu.

-**URL:**
`GET /dreamGoals`

- **Headers:**  
  | Key             | Value             |
  |------------------|-------------------|
  | Authorization    | Bearer `<JWT_TOKEN>` |

Response:
Success (200):
```
{
    "message": "Dream goals fetched successfully",
    "data": [
        {
            "id": "goal_id",
            "goal": {
                "image": "https://storage.googleapis.com/<bucket_name>/<file_path>",
                "title": "My Dream Goal",
                "amount": 100000,
                "description": "Description of the goal",
                "category": "Category of the goal",
                "period": 30,
                "date_started": "2024-12-06"
            },
            "tracker": {
                "amount_saved": 5000,
                "days_saved": 1,
                "days_remaining": 29,
                "daily_save": 5000
            }
        }
    ]
}
```
Error (404/500):
```
Salin kode
{
    "error": "Failed to fetch dream goals",
    "details": "Error details"
}
```

3. Update Savings
Memperbarui jumlah tabungan dan menghitung ulang status progres DreamGoal.

URL:
PUT /dreamGoals/updateSavings

Headers:

Key	Value
Authorization	Bearer <JWT_TOKEN>
Request Body:

json
Salin kode
{
    "goalId": "goal_id"
}
Response:

Success (200):
json
Salin kode
{
    "message": "Savings updated successfully",
    "data": {
        "amount_saved": 10000,
        "days_saved": 2,
        "days_remaining": 28,
        "daily_save": 5000
    }
}
Error (400/404/500):
json
Salin kode
{
    "error": "Failed to update savings",
    "details": "Error details"
}
4. Delete Dream Goal
Menghapus DreamGoal berdasarkan ID.

URL:
DELETE /dreamGoals

Headers:

Key	Value
Authorization	Bearer <JWT_TOKEN>
Request Body:

json
Salin kode
{
    "goalId": "goal_id"
}
Response:

Success (200):
json
Salin kode
{
    "message": "Dream goal deleted successfully"
}
Error (404/500):
json
Salin kode
{
    "error": "Failed to delete dream goal",
    "details": "Error details"
}
Error Codes
Code	Description
200	Success
400	Bad Request (missing fields)
401	Unauthorized (missing/invalid token)
404	Not Found
500	Internal Server Error
