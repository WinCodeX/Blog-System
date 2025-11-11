import prisma from './prisma';

interface CreateUserInput {
  email: string;
  name: string;
}

interface CreatePostInput {
  title: string;
  content: string;
  authorId: number;
  published?: boolean;
}

interface CreateCommentInput {
  content: string;
  postId: number;
  authorId: number;
}

export class BlogService {
  async createUser(data: CreateUserInput) {
    return await prisma.user.create({
      data,
    });
  }

  async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,
        comments: true,
      },
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      include: {
        posts: true,
        comments: true,
      },
    });
  }

  async createPost(data: CreatePostInput) {
    return await prisma.post.create({
      data,
      include: {
        author: true,
      },
    });
  }

  async getPostById(id: number) {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async getPostsByUserId(authorId: number) {
    return await prisma.post.findMany({
      where: { authorId },
      include: {
        author: true,
        comments: true,
      },
    });
  }

  async getAllPosts() {
    return await prisma.post.findMany({
      include: {
        author: true,
        comments: true,
      },
    });
  }

  async updatePost(id: number, data: Partial<CreatePostInput>) {
    return await prisma.post.update({
      where: { id },
      data,
      include: {
        author: true,
        comments: true,
      },
    });
  }

  async deletePost(id: number) {
    return await prisma.post.delete({
      where: { id },
    });
  }

  async createComment(data: CreateCommentInput) {
    return await prisma.comment.create({
      data,
      include: {
        author: true,
        post: true,
      },
    });
  }

  async getCommentsByPostId(postId: number) {
    return await prisma.comment.findMany({
      where: { postId },
      include: {
        author: true,
        post: true,
      },
    });
  }

  async getCommentsByUserId(authorId: number) {
    return await prisma.comment.findMany({
      where: { authorId },
      include: {
        author: true,
        post: true,
      },
    });
  }

  async deleteComment(id: number) {
    return await prisma.comment.delete({
      where: { id },
    });
  }
}
