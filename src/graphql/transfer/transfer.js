import TransferSchema from "Transfer.graphql"
import { Transfer } from './transfer.entity'


const resolvers = {
  Mutation: {
    createTransfer(_, { createTransferInput }) {
      return Transfer.createTransfer(createTransferInput);
    }
  }
}
export const transfer = {
  typeDef: TransferSchema,
  resolvers
}
