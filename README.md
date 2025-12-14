# 🍬 Sweet Shop Management System

A full-stack Sweet Shop Management System built with **Java Spring Boot**, **MySQL**, and **React**. This project demonstrates Test-Driven Development (TDD) practices, clean coding principles, and modern development workflows.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [My AI Usage](#my-ai-usage)
- [Screenshots](#screenshots)
- [License](#license)

## ✨ Features

### Authentication

- User registration with email and password
- JWT-based authentication
- Role-based access control (User/Admin)
- Protected API endpoints

### Sweet Management

- Create, read, update, and delete sweets
- Search sweets by name, category, and price range
- Pagination support
- Categories: Chocolate, Candy, Cake, Cookie, Pastry, Ice Cream, Other

### Inventory Management

- Purchase sweets (decreases quantity)
- Restock sweets (Admin only - increases quantity)
- Stock level indicators (In Stock, Low Stock, Out of Stock)

### Frontend Features

- Modern, responsive React SPA
- User-friendly registration and login forms
- Dashboard with sweet listings and statistics
- Search and filter functionality
- Purchase button (disabled when out of stock)
- Admin panel for inventory management

## 🛠 Tech Stack

### Backend

- **Language**: Java 17
- **Framework**: Spring Boot 3.2
- **Database**: MySQL with Spring Data JPA
- **Authentication**: JWT (jjwt)
- **Password Hashing**: BCrypt (Spring Security)
- **Validation**: Jakarta Bean Validation
- **Testing**: JUnit 5 + Spring Boot Test (H2 in-memory for tests)

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Styling**: Custom CSS with CSS Variables

## 📁 Project Structure

```
SweetShop/
├── backend/
│   ├── src/main/java/com/sweetshop/
│   │   ├── config/          # Security configuration
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Exception handlers
│   │   ├── repository/      # JPA repositories
│   │   ├── security/        # JWT utilities
│   │   ├── service/         # Business logic
│   │   └── SweetShopApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/            # Test files
│   └── pom.xml
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── context/         # React context
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── styles/          # Global styles
    │   ├── types/           # TypeScript types
    │   ├── App.tsx
    │   └── index.tsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Java 17** or higher
- **Maven** (3.8+)
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher, local installation or cloud service)
- **Git**

### Backend Setup

1. **Navigate to the backend directory**

   ```bash
   cd SweetShop/backend
   ```

2. **Configure database connection**

   Edit `src/main/resources/application.properties`:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/sweetshop?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

3. **Build and run the application**

   ```bash
   mvn spring-boot:run
   ```

   Or build and run the JAR:

   ```bash
   mvn clean package
   java -jar target/sweetshop-backend-1.0.0.jar
   ```

   The API will be available at `http://localhost:5000`
   (Tables will be created automatically on first run)

### Frontend Setup

1. **Navigate to the frontend directory**

   ```bash
   cd SweetShop/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   The `.env` file should contain:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description              | Auth |
| ------ | -------------------- | ------------------------ | ---- |
| POST   | `/api/auth/register` | Register a new user      | No   |
| POST   | `/api/auth/login`    | Login user               | No   |
| GET    | `/api/auth/profile`  | Get current user profile | Yes  |

### Sweet Endpoints

| Method | Endpoint             | Description                | Auth  |
| ------ | -------------------- | -------------------------- | ----- |
| GET    | `/api/sweets`        | Get all sweets (paginated) | Yes   |
| GET    | `/api/sweets/search` | Search sweets              | Yes   |
| GET    | `/api/sweets/:id`    | Get sweet by ID            | Yes   |
| POST   | `/api/sweets`        | Create new sweet           | Yes   |
| PUT    | `/api/sweets/:id`    | Update sweet               | Yes   |
| DELETE | `/api/sweets/:id`    | Delete sweet               | Admin |

### Inventory Endpoints

| Method | Endpoint                   | Description    | Auth  |
| ------ | -------------------------- | -------------- | ----- |
| POST   | `/api/sweets/:id/purchase` | Purchase sweet | Yes   |
| POST   | `/api/sweets/:id/restock`  | Restock sweet  | Admin |

### Request/Response Examples

**Register User**

```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user"
}
```

**Create Sweet**

```json
POST /api/sweets
{
  "name": "Chocolate Truffle",
  "category": "Chocolate",
  "price": 3.99,
  "quantity": 50,
  "description": "Delicious milk chocolate truffle"
}
```

## 🧪 Testing

### Running Backend Tests

```bash
cd backend
mvn test
```

### Test Coverage Report

```bash
mvn test jacoco:report
```

### Test Structure

The project follows TDD practices with tests organized by feature:

- `AuthControllerTest.java` - Authentication tests
- `SweetControllerTest.java` - Sweet CRUD and inventory tests

## 🤖 My AI Usage

### Tools Used

- **GitHub Copilot** - VS Code extension for code completion and suggestions

### How I Used AI

1. **Project Scaffolding**: I used GitHub Copilot to help generate the initial project structure, including package.json configurations, TypeScript configurations, and boilerplate code for Express setup.

2. **Test Writing**: AI assisted in generating test cases for both authentication and sweet management endpoints. I reviewed and modified the generated tests to ensure they properly tested the edge cases and business logic.

3. **Model Definitions**: Copilot helped with Mongoose schema definitions, including validation rules and index configurations.

4. **Frontend Components**: AI suggestions helped speed up the creation of React components, especially for repetitive patterns like form handling and API calls.

5. **CSS Styling**: Copilot provided suggestions for CSS styling, which I customized to match the sweet shop theme with pink and purple gradients.

6. **Error Handling**: AI helped implement consistent error handling patterns across the backend controllers and frontend API service.

### Reflection on AI Impact

Using AI tools significantly accelerated development speed, particularly for:

- Boilerplate code generation
- Consistent coding patterns
- Test case ideation
- CSS styling suggestions

However, I still needed to:

- Review and validate all generated code
- Ensure business logic correctness
- Customize styling to match the desired aesthetic
- Debug and fix edge cases
- Understand and document all code thoroughly

AI served as a powerful productivity multiplier while I maintained full ownership of the codebase quality and architecture decisions.

## 📸 Screenshots

### Home Page

The landing page features an attractive hero section with floating candy emojis, feature highlights, and category previews.

### Dashboard

Displays statistics (total sweets, in stock, low stock, out of stock), search filters, and a grid of sweet cards with purchase functionality.

### Admin Panel

Shows inventory management table with restock and delete actions, stock status indicators, and quick statistics.

### Sweet Details

Individual sweet page with large image display, stock status, quantity selector, and admin actions for editing and restocking.

## 📄 License

This project is created as part of a TDD Kata exercise. Feel free to use it for learning purposes.

---

**Built with ❤️ using Java Spring Boot, React, and MySQL**
