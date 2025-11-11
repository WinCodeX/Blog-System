# Blog System with Prisma ORM

A TypeScript-based blogging system demonstrating Prisma ORM capabilities with relational data queries.

## Prerequisites

- npm 
- Node.js

## Installation

```bash
npm install
```

## Setup

1. Generate Prisma Client:
```bash
npm run prisma:generate
```

2. Run database migrations:
```bash
npm run prisma:migrate
```
When prompted for migration name, enter: 'init' or any of your choosing.


## Running the Application
### Demo Mode (Interactive Demonstration)

```bash
npm run demo
```

This will:
- Create two users (Lisa and Glen)
- Create two posts about programming
- Add four comments to the posts
- Display all posts with their comments


## Running the Tests
Execute the test
```bash
npm test
```
Expected output: All 16 tests should pass, validating CRUD  operations and relational queries 

### What the Tests Demonstrate

The test suite includes a comprehensive scenario with:

**Two Users:**
- Lisa (lisa@example.com)
- Glen (glen@example.com)

**Two Posts:**
1. "What do you love about programming?" by Lisa
2. "Best programming practices" by Glen

**Four Comments:**
- Post 1: 2 comments (one from Glen, one from Lisa)
- Post 2: 2 comments (one from Lisa, one from Glen)

The tests verify:
- User creation and retrieval with posts and comments
- Post creation with author relationships
- Comment creation linking users and posts
- Relational queries that fetch nested data
- Cascade deletion behavior
- Complete blog functionality integration





Run tests in watch mode:
```bash
npm test:watch
```

## Project Structure

```
blog-system/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── src/
│   ├── index.ts               # Demo application
│   ├── blog.service.ts        # Core business logic
│   ├── blog.service.test.ts   # Test suite
│   └── prisma.ts              # Prisma client instance
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Approach

### Database Schema Design

The system implements a three-model relational structure:

**User Model**
- Primary entity representing system users
- Has one-to-many relationships with both Posts and Comments
- Includes standard audit fields (createdAt, updatedAt)

**Post Model**
- Represents blog posts authored by users
- Contains foreign key reference to User (authorId)
- Supports published/draft states via boolean flag
- Has one-to-many relationship with Comments
- Implements cascade deletion for data integrity

**Comment Model**
- Represents user comments on posts
- Contains foreign keys to both User (authorId) and Post (postId)
- Implements cascade deletion to maintain referential integrity

### Service Layer Implementation

The BlogService class provides a clean interface for all database operations:

**User Operations**
- Create users with email and name
- Retrieve users with their posts and comments
- Query all users in the system

**Post Operations**
- Create posts linked to specific authors
- Retrieve posts with author and comment data
- Filter posts by author
- Update post content and published status
- Delete posts with automatic comment cleanup

**Comment Operations**
- Create comments linked to posts and authors
- Query comments by post or author
- Delete individual comments

All queries utilize Prisma's include syntax to efficiently fetch related data in single operations, reducing database round trips.

### Testing Strategy

The test suite validates:

1. Basic CRUD operations for each model
2. Relational data loading and integrity
3. Cascade deletion behavior
4. Complex multi-relation queries
5. Update operations maintain data consistency

Tests use beforeEach hooks to ensure database isolation between test cases, preventing data pollution and ensuring reliable test execution.

### Technology Used

**SQLite**: Selected for development simplicity and zero configuration. Production systems would typically use PostgreSQL or MySQL.

**TypeScript**: Provides type safety and improved developer experience with Prisma's generated types.

**Jest**: Industry-standard testing framework with excellent TypeScript support and comprehensive assertion library.

## Additional Commands

View database in Prisma Studio:
```bash
npm run prisma:studio
```

Build TypeScript:
```bash
npm run build
```
