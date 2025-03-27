import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export const createUser = async (email: string, password: string, fullname : string): Promise<string> => {

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) { 
        throw new Error ("Utilisateur déjà existant")
    }

    await prisma.user.create({
        data: {
            fullname,
            email,
            password,
        },
    });
    return ("Utilisateur créé avec succès");
}

export const findUser = async(email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    return user
}
