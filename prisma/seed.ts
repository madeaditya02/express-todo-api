import { PrismaClient } from '@prisma/client'
import * as bcrypt from "bcrypt";
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.users.create({
    data: {
      name: 'Aditya',
      email: 'imadeaditya4@gmail.com',
      username: 'adityaa',
      password: await bcrypt.hash('password', 10)
    }
  })
  const todo = await prisma.todos.create({
    data: {
      title: 'Mengerjakan Matdis',
      date: new Date('2025-05-26'),
      userId: user.id
    }
  })
  console.log({ user, todo })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })