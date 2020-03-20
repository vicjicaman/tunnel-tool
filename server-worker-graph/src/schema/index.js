import * as ViewerSchema from "Schema/viewer";
const { GraphQLDate, GraphQLDateTime } = require("graphql-iso-date");

const schema = [
  ...ViewerSchema.schema,
  `
  scalar DateTime
  scalar Date

  type Label {
    name: String!
    value: String!
  }

  type Query {
    viewer: Viewer
  }

  type Mutation {
    viewer: ViewerMutations
  }
`
];

const resolvers = {
  ...ViewerSchema.resolvers,
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Query: {
    viewer: async (parent, args, cxt) => ({})
  },
  Mutation: {
    viewer: async (parent, args, cxt) => ({})
  }
};

export { schema, resolvers };
