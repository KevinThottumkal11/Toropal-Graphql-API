import { gql } from 'graphql-tag';
import { addToCart, listCartContents, updateItemQuantity, removeItem, clearCart } from './cartDataStore.js';
import { GraphQLError } from 'graphql';

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
            if (!userToken) {
                throw new GraphQLError('Not Authorized!', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                });
            }
            try {
                return await listCartContents(userToken);
            } catch (error) {
                throw formatError(error);
            }
        }
    },
    Mutation: {
        addToCart: async (_, { name, quantity, unit_price }, { userToken }) => {
            if (!userToken) {
                throw new GraphQLError('Not Authorized!', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                });
            }
            try {
                await addToCart(userToken, name, quantity, unit_price);
                return await listCartContents(userToken);
            } catch (error) {
                throw formatError(error);
            }
        },
        updateItemQuantity: async (_, { name, quantity }, { userToken }) => {
            if (!userToken) {
                throw new GraphQLError('Not Authorized!', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                });
            }
            try {
                await updateItemQuantity(userToken, name, quantity);
                return await listCartContents(userToken);
            } catch (error) {
                throw formatError(error);
            }
        },
        removeItem: async (_, { name }, { userToken }) => {
            if (!userToken) {
                throw new GraphQLError('Not Authorized!', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                });
            }
            try {
                await removeItem(userToken, name);
                return await listCartContents(userToken);
            } catch (error) {
                throw formatError(error);
            }
        },
        clearCart: async (_, __, { userToken }) => {
            if (!userToken) {
                throw new GraphQLError('Not Authorized!', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                });
            }
            try {
                await clearCart(userToken);
                return await listCartContents(userToken);
            } catch (error) {
                throw formatError(error);
            }
        }
    }
};

function formatError(error) {
    const status = error.status || 500;
    let code = 'INTERNAL_SERVER_ERROR';
    
    if (status === 400) code = 'BAD_REQUEST';
    if (status === 404) code = 'NOT_FOUND';
    
    return new GraphQLError(error.message, {
        extensions: {
            code,
            http: { status }
        }
    });
}
  

export { typeDefs, resolvers };