import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// obs: os plugins do fastify precisam ser asyncronos sempre
export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()
      // retornando um objeto pois se em algum
      // momento precisar de mais informações fica
      // mais facil de buscar
      return { transactions }
    }
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      // criando um schema (tipo) para o request.params
      // que vem da requisição
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      // o first() garante que só vai retornar um único elemento
      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()
      return { transaction }
    }
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      // rota de resumo
      // faz uma busca na collectio de transactions e soma todos os amounts
      // do usuário especifico, o resultado insere em um campo único amount
      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    }
  )

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

    // verifico se ja existe o sessionId
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      // se não existir crio um passando o randomUUID()
      sessionId = randomUUID()

      // salvo nos coockies uma informação chamada
      // 'sessionId' com o valor sessionId
      // indico as rotas do backend que vão ter acesso ao cookie
      // informo quanto tempo em (milissegundos) esse cookie vai ser válido
      // no navegador do usuário. Obs: depois desse período ele expira
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    // agora vou inserir no banco de dados
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })
}
