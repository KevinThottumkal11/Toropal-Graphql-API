import { ApolloServer } from '@apollo/server';
import { typeDefs, resolvers } from '../graphql-schema.js';
import { initDatabase } from '../cartDataStore.js';
import gql from 'graphql-tag';

let server;

beforeAll(async () => {
  await initDatabase();
});

beforeEach(async () => {
  server = new ApolloServer({ typeDefs, resolvers });
});

const authContext = { userToken: 'user123' };

// test to Pass

test('Test to get cart contents for user123', async () => {
  const GET_CART = gql`
    query {
      cart {
        items { name quantity unit_price }
        total
      }
    }
  `;
  const res = await server.executeOperation({ query: GET_CART }, { contextValue: authContext });
  expect(res.body.kind).toBe('single');
  expect(res.body.singleResult.data.cart.items.length).toBeGreaterThan(0);
  expect(res.body.singleResult.data.cart.total).toBeGreaterThan(0);
});

test('Test to add new item to cart', async () => {
  const ADD_ITEM = gql`
    mutation {
      addToCart(name: "MacBook", quantity: 1, unit_price: 2099.99) {
        items { name quantity unit_price }
        total
      }
    }
  `;
  const res = await server.executeOperation({ query: ADD_ITEM }, { contextValue: authContext });
  expect(res.body.kind).toBe('single');
  const addedItem = res.body.singleResult.data.addToCart.items.find(i => i.name === "MacBook");
  expect(addedItem).toBeTruthy();
  expect(addedItem.quantity).toBe(1);
  expect(addedItem.unit_price).toBe(2099.99);
});

test('Test to update item quantity', async () => {
  const UPDATE = gql`
    mutation {
      updateItemQuantity(name: "Book", quantity: 10) {
        items { name quantity }
        total
      }
    }
  `;
  const res = await server.executeOperation({ query: UPDATE }, { contextValue: authContext });
  expect(res.body.kind).toBe('single');
  const updatedItem = res.body.singleResult.data.updateItemQuantity.items.find(i => i.name === "Book");
  expect(updatedItem.quantity).toBe(10);
});

test('Test to remove item from cart', async () => {
  const REMOVE = gql`
    mutation {
      removeItem(name: "Pen") {
        items { name }
        total
      }
    }
  `;
  const res = await server.executeOperation({ query: REMOVE }, { contextValue: authContext });
  expect(res.body.kind).toBe('single');
  const removedItem = res.body.singleResult.data.removeItem.items.find(i => i.name === "Pen");
  expect(removedItem).toBeUndefined();
});

test('Test to clear entire cart', async () => {
  const CLEAR = gql`
    mutation {
      clearCart {
        items { name }
        total
      }
    }
  `;
  const res = await server.executeOperation({ query: CLEAR }, { contextValue: authContext });
  expect(res.body.kind).toBe('single');
  expect(res.body.singleResult.data.clearCart.items).toHaveLength(0);
  expect(res.body.singleResult.data.clearCart.total).toBe(0);
});

// Test to Fail

test('Test to add item with negative quantity', async () => {
  const res = await server.executeOperation({
    query: gql`
      mutation {
        addToCart(name: "Apple", quantity: -1, unit_price: 1.99) {
          total
        }
      }
    `
  }, { contextValue: authContext });

  expect(res.body.kind).toBe('single');
  expect(res.body.singleResult.errors[0].message).toBe('Quantity must be positive');
  expect(res.body.singleResult.errors[0].extensions.code).toBe('BAD_REQUEST');
});

test('Test to update non existing item', async () => {
  const res = await server.executeOperation({
    query: gql`
      mutation {
        updateItemQuantity(name: "Item", quantity: 5) {
          total
        }
      }
    `
  }, { contextValue: authContext });

  expect(res.body.kind).toBe('single');
  expect(res.body.singleResult.errors[0].message).toBe('Item not found');
  expect(res.body.singleResult.errors[0].extensions.code).toBe('NOT_FOUND');
});

test('Test to Access without authorization token', async () => {
  const GET_CART = gql`
    query {
      cart {
        total
      }
    }
  `;
  const res = await server.executeOperation({ query: GET_CART }, { contextValue: {} });
  expect(res.body.kind).toBe('single');
  expect(res.body.singleResult.errors[0].message).toMatch(/Not Authorized!/i);
});
