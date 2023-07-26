import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

// obs: os plugins do fastify precisam ser asyncronos sempre
export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    // usando o zod para tipar (criando um schema) os dados
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    // validando os dados do "request.body" para ver se estão de acordo
    // com os dados do schema "createTransactionBodySchema" que defini
    // se algo estiver incorreto o parse da um thow e para a aplicação
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    )

    // agora vou inserir no banco de dados
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send()
  })
}
