# exercise-tracker
an express.js api that can serve user to create new-user, create new-exercise, get exercises with additional parameters.

# how to create new user
`POST - {url}/api/exercise/new-user`  
request body (json):  
```json
{
    "username": "your_username"
}
```

# how to create new exercise
`POST - {url}/api/exercise/add`  
request body (json):  
```json
{
    "userId": "5f466bf6577aae4e9c8d6ea8", // String (required)
    "description": "public speaking", // String (required)
    "duration": 30, // Integer (required)
    "date": "1920-12-30" // String 'yyyy-mm-dd' format (optional)
}
```
note: 
- `userId`, `description`, `duration` key-value pair are required
- `date` key-value pair is optional, if it's not added the api will set date as current date.

# how to get exercises data
`GET - {url}/api/exercise/log?userId=5f44991bdde8da2690cbf78b&from=1999-12-30&to=2050-12-30&limit=10` 

note: 
- `userId` query param is required
- `from`, `to`, `limit` query params are optional
- `from` and `to` value should be using `yyyy-mm-dd` format
# how to get all active users 
`GET - {url}/api/exercise/users`