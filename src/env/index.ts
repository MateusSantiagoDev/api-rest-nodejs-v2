import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

// o z serve para criar um schema (formato de dado)
// que virá nas variáveis de ambiente

// basicamente estou dizendo para o zod que existe uma
// variável de ambiente "DATABASE_URL" obrigatória
// e que é uma string (não pode ser null ou vazia)

// a PORT é um number e se não for informado usa o valor default

// NODE_ENV para especificar em qual ambiente esta rodando a aplicação
// o enum esta sendo usado para passar as opções e o default é em caso
// de não ser informado o ambiente

// obs: linha 27 => pg para o knex entender que é postgress (deploy)

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())
  throw new Error('Invalid environment variables!')
}

export const env = _env.data
