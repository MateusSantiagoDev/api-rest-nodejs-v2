import 'dotenv/config'
import { z } from 'zod'

// o z serve para criar um schema (formato de dado)
// que virá nas variáveis de ambiente

// basicamente estou dizendo para o zod que existe uma
// variável de ambiente "DATABASE_URL" obrigatória
// e que é uma string (não pode ser null ou vazia)

// a PORT é um number e se não for informado usa o valor default

// NODE_ENV para especificar em qual ambiente esta rodando a aplicação
// o enum esta sendo usado para passar as opções e o default é em caso
// de não ser informado o ambiente

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())
  throw new Error('Invalid environment variables!')
}

export const env = _env.data
