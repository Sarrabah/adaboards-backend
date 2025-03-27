import { UserController } from "../src/controller/userController";
import { PrismaClient } from "@prisma/client";

jest.mock("@prisma/client", () => {
    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            user: {
                create: jest.fn(),
                findUnique: jest.fn(),
            },
            $disconnect: jest.fn(),
        })),
    };
});

const prisma = new PrismaClient();


describe("userController", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("devrait créer un utilisateur", async () => {
        const mockUser = { id: 1, email: "test@example.com", name: "Test" , fullname: "Test"};
        (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const userController = new UserController(prisma)
        const user = await userController.createUser("test@example.com", "Test", "Test");

        expect(user).toEqual(mockUser);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: { email: "test@example.com", fullname: "Test", password: "Test" },
        });
    });
})
