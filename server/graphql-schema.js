import { gql } from 'graphql-tag';
import { addToCart, listCartContents, updateItemQuantity, removeItem, clearCart } from './cartDataStore.js';

const typeDefs = gql`
  type Item {
    name: String!
    quantity: Int!
    unit_price: Float!
  }

  type Cart {
    items: [Item!]!
    total: Float!
  }

  type Query {
    cart: Cart!
  }

  type Mutation {
    addToCart(name: String!, quantity: Int!, unit_price: Float!): Cart!
    updateItemQuantity(name: String!, quantity: Int!): Cart!
    removeItem(name: String!): Cart!
    clearCart: Cart!
  }
`;


const resolvers = {
    Query: {
        cart: async (_, __, { userToken }) => {
            return await listCartContents(userToken);
        }
    },
    Mutation: {
      addToCart: async (_, { name, quantity, unit_price }, { userToken }) => {
        if (quantity < 0 || unit_price < 0) throw new Error('Quantity and price must be non-negative');
        await addToCart(userToken, name, quantity, unit_price);
        return await listCartContents(userToken);
      },
      updateItemQuantity: async (_, { name, quantity }, { userToken }) => {
        if (quantity < 0) throw new Error('Quantity must be non-negative');
        await updateItemQuantity(userToken, name, quantity);
        return await listCartContents(userToken);
      },
      removeItem: async (_, { name }, { userToken }) => {
        await removeItem(userToken, name);
        return await listCartContents(userToken);
      },
      clearCart: async (_, __, { userToken }) => {
        await clearCart(userToken);
        return await listCartContents(userToken);
      }
    }
  };
  

export { typeDefs, resolvers };