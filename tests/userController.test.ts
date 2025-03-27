import { createUser } from "../src/controller/userController";
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



describe("userService", () => {
    afterEach(() => {
        jest.clearAllMocks(); // Nettoyer les mocks après chaque test
    });

    it("devrait créer un utilisateur", async () => {
        const mockUser = { id: 1, email: "test@example.com", name: "Test" , fullname: "Test"};
        (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        
        const user = await createUser("test@example.com", "Test", "Test");

        expect(user).toEqual(mockUser);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: { email: "test@example.com", name: "Test", fullname: "Test" },
        });
    });
})
