## TMS-CC-API
An API for managing user DreamGoal data, including saving, reading, updating, and deleting savings data.

## Cloud Architecture
![Cloud Architecture](assets/Screenshot%202024-12-13%20085600.png "Cloud Architecture")


## Base URL
http://0.0.0.0:8080/api

## Endpoints Documentation

### 1. **Save Data**
Menyimpan data *DreamGoal* baru ke database.

- **URL:**  
  `POST /addDreamProduct`

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
      "amount_saved": 0, // Default input 0, You can skip this
      "days_saved": 0,  // Default input 0, You can skip this
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
Error (400)
If required fields are missing or invalid:
```
{
  "error": "Missing required fields"
}
```
If the UID is missing:
```
{
  "error": "UID is missing"
}
```
Error (500)
Server-side errors, including invalid Base64 format or unsupported image types:
```
{
  "error": "Failed to save data",
  "details": "<error_details>"
}
```

### 2. **Get Dream Goals**
Mengambil semua data *DreamGoal* milik pengguna tertentu.

- **URL:**
`GET /getDreamProduct`

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

### 3. **Update Savings**
Memperbarui jumlah tabungan dan menghitung ulang status progres *DreamGoal*.

- **URL:**
`PATCH /updateSavings`

- **Headers:**  
  | Key             | Value             |
  |------------------|-------------------|
  | Authorization    | Bearer `<JWT_TOKEN>` |


```
{
    "goalId": "goal_id"
}
```
Response:
Success (200):
```
{
    "message": "Savings updated successfully",
    "data": {
        "amount_saved": 10000,
        "days_saved": 2,
        "days_remaining": 28,
        "daily_save": 5000
    }
}
```
Error (400/404/500):
```
{
    "error": "Failed to update savings",
    "details": "Error details"
}
```
### 4. **Delete Dream Goal**
Menghapus *DreamGoal* berdasarkan ID.

- **URL:**
`DELETE /deleteDreamProduct`

- **Headers:**  
  | Key             | Value             |
  |------------------|-------------------|
  | Authorization    | Bearer `<JWT_TOKEN>` |

```
{
    "goalId": "goal_id"
}
```
Response:

Success (200):
```
{
    "message": "Dream goal deleted successfully"
}
```
Error (404/500):
```
{
    "error": "Failed to delete dream goal",
    "details": "Error details"
}
```
Error Codes
Code	Description
```
200	Success
400	Bad Request (missing fields)
401	Unauthorized (missing/invalid token)
404	Not Found
500	Internal Server Error
```
