import { PrismaClient, Role} from '@prisma/client'

const prisma = new PrismaClient()

export const getBoards = async(userId :number) => {
    const userBoards = await prisma.user_Board.findMany({
        where: { userId },
        include: {
            board: true
        },
    });

    const boards = userBoards.map((ub : any) => ub.board);
    return boards
}

export const addBoard = async(name: string, userId : number, role: Role)=> {
    const newBoard = await prisma.board.create({
        data: {
            name,
            User_Board: {
                create: {
                   userId,
                    role
                }
            }
        },
        include: {
            User_Board: true
        }
    });
    return newBoard;
}