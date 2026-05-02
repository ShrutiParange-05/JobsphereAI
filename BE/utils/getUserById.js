  import { PrismaClient } from '@prisma/client'
  const prisma = new PrismaClient()

  async function getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: parseInt(userId)
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: false,
          created_at: true,
          post: false,
          comment: false
        }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Transform user data to include default values for missing fields
      return {
        ...user,
        skills: ["JavaScript", "Web Development"], // Default skills
        summary: "Aspiring developer looking to enhance skills" // Default summary
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  export default getUserById;
