import { BlogService } from './blog.service';
import prisma from './prisma';

describe('BlogService', () => {
  let blogService: BlogService;

  beforeAll(async () => {
    blogService = new BlogService();
  });

  beforeEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await blogService.createUser(userData);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should get user by id with relations', async () => {
      const user = await blogService.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      const fetchedUser = await blogService.getUserById(user.id);

      expect(fetchedUser).not.toBeNull();
      expect(fetchedUser?.id).toBe(user.id);
      expect(fetchedUser).toHaveProperty('posts');
      expect(fetchedUser).toHaveProperty('comments');
    });

    it('should get all users', async () => {
      await blogService.createUser({
        email: 'user1@example.com',
        name: 'User One',
      });
      await blogService.createUser({
        email: 'user2@example.com',
        name: 'User Two',
      });

      const users = await blogService.getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty('posts');
      expect(users[0]).toHaveProperty('comments');
    });
  });

  describe('Post Operations', () => {
    it('should create a post for a user', async () => {
      const user = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const postData = {
        title: 'Test Post',
        content: 'This is a test post content',
        authorId: user.id,
      };

      const post = await blogService.createPost(postData);

      expect(post).toHaveProperty('id');
      expect(post.title).toBe(postData.title);
      expect(post.content).toBe(postData.content);
      expect(post.authorId).toBe(user.id);
      expect(post.published).toBe(false);
      expect(post).toHaveProperty('author');
      expect(post.author.id).toBe(user.id);
    });

    it('should get post by id with author and comments', async () => {
      const user = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post = await blogService.createPost({
        title: 'Test Post',
        content: 'Content',
        authorId: user.id,
      });

      const fetchedPost = await blogService.getPostById(post.id);

      expect(fetchedPost).not.toBeNull();
      expect(fetchedPost?.id).toBe(post.id);
      expect(fetchedPost?.author).toBeDefined();
      expect(fetchedPost?.comments).toBeDefined();
      expect(Array.isArray(fetchedPost?.comments)).toBe(true);
    });

    it('should get posts by user id', async () => {
      const user = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      await blogService.createPost({
        title: 'Post 1',
        content: 'Content 1',
        authorId: user.id,
      });
      await blogService.createPost({
        title: 'Post 2',
        content: 'Content 2',
        authorId: user.id,
      });

      const posts = await blogService.getPostsByUserId(user.id);

      expect(posts).toHaveLength(2);
      expect(posts[0].authorId).toBe(user.id);
      expect(posts[1].authorId).toBe(user.id);
    });

    it('should get all posts', async () => {
      const user1 = await blogService.createUser({
        email: 'user1@example.com',
        name: 'User One',
      });
      const user2 = await blogService.createUser({
        email: 'user2@example.com',
        name: 'User Two',
      });

      await blogService.createPost({
        title: 'Post 1',
        content: 'Content 1',
        authorId: user1.id,
      });
      await blogService.createPost({
        title: 'Post 2',
        content: 'Content 2',
        authorId: user2.id,
      });

      const posts = await blogService.getAllPosts();

      expect(posts).toHaveLength(2);
    });

    it('should update a post', async () => {
      const user = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post = await blogService.createPost({
        title: 'Original Title',
        content: 'Original Content',
        authorId: user.id,
      });

      const updatedPost = await blogService.updatePost(post.id, {
        title: 'Updated Title',
        published: true,
      });

      expect(updatedPost.title).toBe('Updated Title');
      expect(updatedPost.content).toBe('Original Content');
      expect(updatedPost.published).toBe(true);
    });

    it('should delete a post', async () => {
      const user = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post = await blogService.createPost({
        title: 'Test Post',
        content: 'Content',
        authorId: user.id,
      });

      await blogService.deletePost(post.id);

      const deletedPost = await blogService.getPostById(post.id);
      expect(deletedPost).toBeNull();
    });
  });

  describe('Comment Operations', () => {
    it('should create a comment on a post', async () => {
      const author = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post = await blogService.createPost({
        title: 'Test Post',
        content: 'Content',
        authorId: author.id,
      });

      const commenter = await blogService.createUser({
        email: 'commenter@example.com',
        name: 'Commenter',
      });

      const commentData = {
        content: 'This is a comment',
        postId: post.id,
        authorId: commenter.id,
      };

      const comment = await blogService.createComment(commentData);

      expect(comment).toHaveProperty('id');
      expect(comment.content).toBe(commentData.content);
      expect(comment.postId).toBe(post.id);
      expect(comment.authorId).toBe(commenter.id);
      expect(comment).toHaveProperty('author');
      expect(comment).toHaveProperty('post');
    });

    it('should get comments by post id', async () => {
      const author = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post = await blogService.createPost({
        title: 'Test Post',
        content: 'Content',
        authorId: author.id,
      });

      const commenter = await blogService.createUser({
        email: 'commenter@example.com',
        name: 'Commenter',
      });

      await blogService.createComment({
        content: 'Comment 1',
        postId: post.id,
        authorId: commenter.id,
      });
      await blogService.createComment({
        content: 'Comment 2',
        postId: post.id,
        authorId: commenter.id,
      });

      const comments = await blogService.getCommentsByPostId(post.id);

      expect(comments).toHaveLength(2);
      expect(comments[0].postId).toBe(post.id);
      expect(comments[1].postId).toBe(post.id);
    });

    it('should get comments by user id', async () => {
      const author = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post1 = await blogService.createPost({
        title: 'Post 1',
        content: 'Content 1',
        authorId: author.id,
      });

      const post2 = await blogService.createPost({
        title: 'Post 2',
        content: 'Content 2',
        authorId: author.id,
      });

      const commenter = await blogService.createUser({
        email: 'commenter@example.com',
        name: 'Commenter',
      });

      await blogService.createComment({
        content: 'Comment on Post 1',
        postId: post1.id,
        authorId: commenter.id,
      });
      await blogService.createComment({
        content: 'Comment on Post 2',
        postId: post2.id,
        authorId: commenter.id,
      });

      const comments = await blogService.getCommentsByUserId(commenter.id);

      expect(comments).toHaveLength(2);
      expect(comments[0].authorId).toBe(commenter.id);
      expect(comments[1].authorId).toBe(commenter.id);
    });

    it('should delete a comment', async () => {
      const author = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post = await blogService.createPost({
        title: 'Test Post',
        content: 'Content',
        authorId: author.id,
      });

      const commenter = await blogService.createUser({
        email: 'commenter@example.com',
        name: 'Commenter',
      });

      const comment = await blogService.createComment({
        content: 'Test Comment',
        postId: post.id,
        authorId: commenter.id,
      });

      await blogService.deleteComment(comment.id);

      const comments = await blogService.getCommentsByPostId(post.id);
      expect(comments).toHaveLength(0);
    });
  });

  describe('Relational Queries', () => {
    it('should verify cascade delete - deleting post deletes comments', async () => {
      const author = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post = await blogService.createPost({
        title: 'Test Post',
        content: 'Content',
        authorId: author.id,
      });

      await blogService.createComment({
        content: 'Comment 1',
        postId: post.id,
        authorId: author.id,
      });

      await blogService.deletePost(post.id);

      const comments = await blogService.getCommentsByPostId(post.id);
      expect(comments).toHaveLength(0);
    });

    it('should include all relations in complex query', async () => {
      const author = await blogService.createUser({
        email: 'author@example.com',
        name: 'Author',
      });

      const post = await blogService.createPost({
        title: 'Test Post',
        content: 'Content',
        authorId: author.id,
        published: true,
      });

      const commenter = await blogService.createUser({
        email: 'commenter@example.com',
        name: 'Commenter',
      });

      await blogService.createComment({
        content: 'Great post!',
        postId: post.id,
        authorId: commenter.id,
      });

      const fetchedPost = await blogService.getPostById(post.id);

      expect(fetchedPost).not.toBeNull();
      expect(fetchedPost?.author.name).toBe('Author');
      expect(fetchedPost?.comments).toHaveLength(1);
      expect(fetchedPost?.comments[0].author.name).toBe('Commenter');
    });
  });
});
