import express, { NextFunction, Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { PrismaClient, Role} from '@prisma/client'
import { createUser, findUser } from "../controller/userController";
import {addBoard, getBoards} from "../controller/boardController";

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
    
    try{
        const { email, password, fullname } = req.body;

        if (!email || !password || !fullname) {
            res.status(400).json({ message: "Données invalides" });
        }

        const message = await createUser(email, password, fullname);
        res.status(201).json({ message });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

app.post("/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await findUser(email)
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
    const boards= await getBoards(userId)
    res.json({boards});
});
app.post("/board", authenticateToken, async (req: Request, res: Response) => {
    const {name} = req.body;
    const userId: number = req.user.id;
    const role= Role.OWNER;
    if (!name) {
        res.status(401).json({ message: "Missing name" });
    }
    const newBoard = await addBoard(name, userId, role)
    res.status(201).json(newBoard);
})
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

