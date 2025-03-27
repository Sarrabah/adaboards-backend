import { PrismaClient} from '@prisma/client'

export class UserController {
    prismaClient: PrismaClient

    public constructor(prismaClient: PrismaClient) {
        this.prismaClient = prismaClient;
    }

    public async createUser(email: string, password: string, fullname : string): Promise<any> {
        const existingUser = await this.prismaClient.user.findUnique({ where: { email } });
        if (existingUser) { 
            throw new Error ("Utilisateur déjà existant")
        }

        const user = await this.prismaClient.user.create({
            data: {
                fullname,
                email,
                password,
            },
        });
        console.log(user)
        return user;
    }

    public async findUser(email: string): Promise<any> {
        const user = await this.prismaClient.user.findUnique({ where: { email } });
        return user
    }
}
