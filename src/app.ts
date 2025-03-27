import express, { NextFunction, Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { PrismaClient, Role} from '@prisma/client'

const app = express();
const port = 3004;
app.use(express.json())

const prisma = new PrismaClient()
const SECRET_KEY = "secret"

declare module 'express' {
    interface Request {
        user?: any;
    }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
    const authHeader = req.headers.authorization;
    const token =  authHeader ?.split(" ")[1];

    if (!token) return res.status(401).json({message: "Token refusé"});
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({message: "Token invalide"});
        req.user = user;
        next();
    });
};

app.post('/auth/register', async (req: Request, res: Response) => {
    const { email, password, fullname } = req.body;

    if (!email || !password || !fullname) {
        res.status(400).json({ message: "Données invalides" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    await prisma.user.create({
        data: {
            fullname,
            email,
            password,
        },
    });

    res.status(201).json({ message: "Utilisateur créé avec succès" });
});

app.post("/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !password) {
        res.status(401).json({ message: "Identifiants invalides" });
        return 
    }

    const token = jwt.sign({email: email, id: user.id}, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token });
});

app.get('/protected', authenticateToken, async (req: Request, res: Response) => {
    const userId: number = req.user.id
    console.log(req.user)
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
          },
      })
    res.json({ message: `Bienvenue ${user?.fullname}` });
});

app.get('/boards', authenticateToken, async (req: Request, res: Response) => {
    const userId: number = req.user.userId;
    const userBoards = await prisma.user_Board.findMany({
        where: { userId },
        include: {
            board: true
        },
    });

    const boards = userBoards.map(ub => ub.board);

    res.json({boards});
});
app.post("/boards", authenticateToken, async (req: Request, res: Response) => {
    const {name} = req.body;
    const userId: number = req.user.id;
    const role= Role.OWNER;
    if (!name) {
        res.status(401).json({ message: "Missing name" });
    }
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
    res.status(201).json(newBoard);
})
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

