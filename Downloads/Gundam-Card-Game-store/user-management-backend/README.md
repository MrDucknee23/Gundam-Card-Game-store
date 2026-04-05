# User Management Backend

This project is a complete backend system for user management in an e-commerce admin panel, built using Node.js, Express, and MongoDB. It provides a RESTful API for managing users, including functionalities for authentication, authorization, and user statistics.

## Technologies Used

- **Node.js**: JavaScript runtime for building the server-side application.
- **Express**: Web framework for building the API.
- **MongoDB**: NoSQL database for storing user data.
- **Mongoose**: ODM for MongoDB to manage data relationships and schema validation.
- **JWT**: For secure authentication and authorization.
- **Joi / express-validator**: For input validation.
- **bcrypt**: For hashing passwords.

## Features

- User CRUD operations (Create, Read, Update, Delete)
- User blocking and unblocking
- Pagination, search, and filtering for user lists
- User statistics for dashboard insights
- JWT-based authentication and role-based access control
- Centralized error handling

## Project Structure

```
user-management-backend
├── src
│   ├── config
│   │   └── db.ts
│   ├── controllers
│   │   └── user.controller.ts
│   ├── middleware
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── models
│   │   └── user.model.ts
│   ├── routes
│   │   └── user.routes.ts
│   ├── services
│   │   └── user.service.ts
│   ├── utils
│   │   └── response.util.ts
│   ├── app.ts
│   └── server.ts
├── seed
│   └── users.seed.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd user-management-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env` and fill in the required values.

4. **Run the application**:
   ```bash
   npm start
   ```

5. **Access the API**:
   The API will be available at `http://localhost:3000/api/users`.

## API Endpoints

- **GET /api/users**: Retrieve a list of users with pagination, search, and filter options.
- **GET /api/users/:id**: Retrieve details of a specific user.
- **POST /api/users**: Create a new user.
- **PUT /api/users/:id**: Update an existing user.
- **DELETE /api/users/:id**: Delete a user.
- **PATCH /api/users/:id/block**: Block a user.
- **PATCH /api/users/:id/unblock**: Unblock a user.
- **GET /api/users/stats**: Retrieve user statistics.

## Contribution

Feel free to submit issues or pull requests for improvements or bug fixes. 

## License

This project is licensed under the MIT License.