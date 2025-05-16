# Toropal Technical Interview Excercise (GrpahQL + SQLite)

A GraphQL API for managing shopping carts, built with Apollo Server and SQLite.

## Features
1. User authentication via token
2. Add items to cart
3. List cart contents with total price
4. Update item quantities
5. Remove items from cart
6. Clear entire cart (Bonus)

## Architecture
This service uses:

- Apollo Server for GraphQL implementation
- SQLite for data storage
- Token authentication for user identification

The application is organized into the following files:

- index.js - Server setup and initialization
- cartDataStore.js - Database initialization and cart functional logic
- graphql-schema.js - GraphQL schema and resolvers
- test/test.js - Test cases for API functionality

## Installation

Clone the repository:
```
git clone <repository-url>
cd Toropal-Graphql-API/server
```

Install dependencies:
```
npm install
```
Run the API:
```
npm start
```
The GraphQL endpoint is available at http://localhost:4000.


## Testing

For running the test suites, go to the **server** directory
```
npm test
```
## 
All requests to the API require authentication. You need to include a Bearer token in the Authorization header:

Authorization: Bearer <token>

GraphQL Endpoint
The GraphQL endpoint is available at http://localhost:4000.
##

## Example Queries

Get Cart Contents
```
query {
  cart {
    items {
      name
      quantity
      unit_price
    }
    total
  }
}
```

Add Item to Cart
```
mutation {
  addToCart(name: "MacBook Air", quantity: 1, unit_price: 1099.99) {
    items {
      name
      quantity
      unit_price
    }
    total
  }
}
```
Update Item Quantity
```
mutation {
  updateItemQuantity(name: "MacBook Air", quantity: 2) {
    items {
      name
      quantity
      unit_price
    }
    total
  }
}
```
Remove Item from Cart
```
mutation {
  removeItem(name: "MacBook Air") {
    items {
      name
      quantity
      unit_price
    }
    total
  }
}
```
Clear Cart
```
mutation {
  clearCart {
    items {
      name
      quantity
      unit_price
    }
    total
  }
}
```