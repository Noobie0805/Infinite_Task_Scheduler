---

##  `backend/README.md`

#  Backend – Schedule Management API

Express + TypeScript backend for managing weekly task schedules with common slots and date-specific exceptions.

---

## Tech Stack

- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL (External/Cloud instance)
- **ORM/Driver**: pg (PostgreSQL driver)
- **Development**: nodemon, tsx
- **Additional**: dotenv, cors, express middleware

---

## Project Structure

```
backend/
├── src/
│   ├── controllers/           
│   ├── routes/
│   ├── middlewares/          
│   ├── utils/                
│   ├── db/                   
│   └── app.ts               
├── dist/                     
├── package.json             
├── tsconfig.json           
├── nodemon.json            
└── .gitignore              
```

---

## Database Schema

### `common_slots`
Stores recurring weekly schedule patterns (max 2 slots per day).

| Column        | Type               | Description                        |
| ------------- | ------------------ | ---------------------------------- |
| `id`          | SERIAL PRIMARY KEY | Unique identifier                  |
| `day_of_week` | INTEGER            | Day of week (0-6: Sunday-Saturday) |
| `slot_number` | INTEGER            | Slot position (1 or 2)             |
| `start_time`  | TIME               | Slot start time                    |
| `end_time`    | TIME               | Slot end time                      |
| `title`       | VARCHAR(255)       | Slot description/title             |
| `created_at`  | TIMESTAMP          | Creation timestamp                 |

### `exception_tasks`
Stores date-specific overrides for common slots.

| Column        | Type               | Description            |
| ------------- | ------------------ | ---------------------- |
| `id`          | SERIAL PRIMARY KEY | Unique identifier      |
| `date`        | DATE               | Specific override date |
| `slot_number` | INTEGER            | Slot position (1 or 2) |
| `start_time`  | TIME               | Override start time    |
| `end_time`    | TIME               | Override end time      |
| `title`       | VARCHAR(255)       | Override description   |
| `created_at`  | TIMESTAMP          | Creation timestamp     |

---

## API Endpoints

### Common Slots
```http
GET    /api/common-slots          # Get all common weekly patterns
POST   /api/common-slots          # Create/update common slots
DELETE /api/common-slots/:day     # Delete common slots for a day
```

### Exception Tasks
```http
GET    /api/exception-tasks       # Get all date-specific overrides
POST   /api/exception-tasks       # Create date-specific override
DELETE /api/exception-tasks/:date # Delete exception for specific date
```

### Health Check
```http
GET    /                          # API status and health check
```

---

## Available Scripts

| Script      | Command              | Description                                |
| ----------- | -------------------- | ------------------------------------------ |
| Development | `npm run dev`        | Start development server with hot reload   |
| Build       | `npm run build`      | Compile TypeScript to JavaScript           |
| Production  | `npm start`          | Start production server (requires build)   |
| Type Check  | `npm run type-check` | Check TypeScript types without compilation |

---

## 🔧 Configuration Files

### `tsconfig.json`
TypeScript compilation settings with ES modules support.

### `nodemon.json`
Development server configuration for automatic restarts.

### `.gitignore`
Excludes sensitive files and build artifacts from version control.

---

