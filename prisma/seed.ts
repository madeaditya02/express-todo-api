import { PrismaClient } from '@prisma/client'
import * as bcrypt from "bcrypt";
const prisma = new PrismaClient()
async function main() {
  const alice = await prisma.users.create({
    data: {
      name: 'Aditya',
      email: 'imadeaditya4@gmail.com',
      username: 'adityaa',
      password: await bcrypt.hash('password', 10),
      phone: '08973891362',
      address: 'Denpasar'
    }
  })
  console.log({ alice })
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