import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export const createUser = async (email: string, password: string, fullname : string): Promise<any> => {

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) { 
        throw new Error ("Utilisateur déjà existant")
    }

    const user = await prisma.user.create({
        data: {
            fullname,
            email,
            password,
        },
    });
    console.log(user)
    return user;
}

export const findUser = async(email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    return user
}
