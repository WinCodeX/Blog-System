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
        email: 'lisa@example.com',
        name: 'Lisa',
      };

      const user = await blogService.createUser(userData);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should get user by id with posts and comments', async () => {
      const user = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
      });

      const post = await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: user.id,
        published: true,
      });

      await blogService.createComment({
        content: 'I love the problem-solving aspect. Every bug is a puzzle waiting to be solved.',
        postId: post.id,
        authorId: user.id,
      });

      const fetchedUser = await blogService.getUserById(user.id);

      expect(fetchedUser).not.toBeNull();
      expect(fetchedUser?.id).toBe(user.id);
      expect(fetchedUser?.posts).toHaveLength(1);
      expect(fetchedUser?.posts[0].title).toBe('What do you love about programming?');
      expect(fetchedUser?.comments).toHaveLength(1);
      expect(fetchedUser?.comments[0].content).toContain('problem-solving');
    });

    it('should get all users', async () => {
      await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });
      await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
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
        email: 'lisa@example.com',
        name: 'Lisa',
      });

      const postData = {
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: user.id,
        published: true,
      };

      const post = await blogService.createPost(postData);

      expect(post).toHaveProperty('id');
      expect(post.title).toBe(postData.title);
      expect(post.content).toBe(postData.content);
      expect(post.authorId).toBe(user.id);
      expect(post.published).toBe(true);
      expect(post).toHaveProperty('author');
      expect(post.author.name).toBe('Lisa');
    });

    it('should get post by id with author and comments', async () => {
      const lisa = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });

      const glen = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
      });

      const post = await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: lisa.id,
        published: true,
      });

      await blogService.createComment({
        content: 'I love the problem-solving aspect. Every bug is a puzzle waiting to be solved.',
        postId: post.id,
        authorId: glen.id,
      });

      await blogService.createComment({
        content: 'The creativity! Building something from nothing with just code is incredible.',
        postId: post.id,
        authorId: lisa.id,
      });

      const fetchedPost = await blogService.getPostById(post.id);

      expect(fetchedPost).not.toBeNull();
      expect(fetchedPost?.id).toBe(post.id);
      expect(fetchedPost?.author).toBeDefined();
      expect(fetchedPost?.author.name).toBe('Lisa');
      expect(fetchedPost?.comments).toHaveLength(2);
      expect(fetchedPost?.comments[0].author.name).toBe('Glen');
      expect(fetchedPost?.comments[1].author.name).toBe('Lisa');
    });

    it('should get posts by user id', async () => {
      const user = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
      });

      await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: user.id,
        published: true,
      });
      await blogService.createPost({
        title: 'Best programming practices',
        content: 'Let us discuss the best practices in software development.',
        authorId: user.id,
        published: true,
      });

      const posts = await blogService.getPostsByUserId(user.id);

      expect(posts).toHaveLength(2);
      expect(posts[0].authorId).toBe(user.id);
      expect(posts[1].authorId).toBe(user.id);
    });

    it('should get all posts', async () => {
      const lisa = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });
      const glen = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
      });

      await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: lisa.id,
        published: true,
      });
      await blogService.createPost({
        title: 'Best programming practices',
        content: 'Let us discuss the best practices in software development.',
        authorId: glen.id,
        published: true,
      });

      const posts = await blogService.getAllPosts();

      expect(posts).toHaveLength(2);
    });

    it('should update a post', async () => {
      const user = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });

      const post = await blogService.createPost({
        title: 'Draft Post',
        content: 'This is a draft',
        authorId: user.id,
      });

      const updatedPost = await blogService.updatePost(post.id, {
        title: 'What do you love about programming?',
        published: true,
      });

      expect(updatedPost.title).toBe('What do you love about programming?');
      expect(updatedPost.published).toBe(true);
    });

    it('should delete a post', async () => {
      const user = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
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
      const lisa = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });

      const post = await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: lisa.id,
        published: true,
      });

      const glen = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
      });

      const commentData = {
        content: 'I love the problem-solving aspect. Every bug is a puzzle waiting to be solved.',
        postId: post.id,
        authorId: glen.id,
      };

      const comment = await blogService.createComment(commentData);

      expect(comment).toHaveProperty('id');
      expect(comment.content).toBe(commentData.content);
      expect(comment.postId).toBe(post.id);
      expect(comment.authorId).toBe(glen.id);
      expect(comment.author.name).toBe('Glen');
      expect(comment.post.title).toBe('What do you love about programming?');
    });

    it('should get comments by post id', async () => {
      const lisa = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });

      const post = await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: lisa.id,
        published: true,
      });

      const glen = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
      });

      await blogService.createComment({
        content: 'I love the problem-solving aspect. Every bug is a puzzle waiting to be solved.',
        postId: post.id,
        authorId: glen.id,
      });
      await blogService.createComment({
        content: 'The creativity! Building something from nothing with just code is incredible.',
        postId: post.id,
        authorId: lisa.id,
      });

      const comments = await blogService.getCommentsByPostId(post.id);

      expect(comments).toHaveLength(2);
      expect(comments[0].postId).toBe(post.id);
      expect(comments[1].postId).toBe(post.id);
      expect(comments[0].author.name).toBe('Glen');
      expect(comments[1].author.name).toBe('Lisa');
    });

    it('should get comments by user id', async () => {
      const lisa = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });

      const post1 = await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: lisa.id,
        published: true,
      });

      const post2 = await blogService.createPost({
        title: 'Best programming practices',
        content: 'Let us discuss the best practices in software development.',
        authorId: lisa.id,
        published: true,
      });

      const glen = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
      });

      await blogService.createComment({
        content: 'I love the problem-solving aspect. Every bug is a puzzle waiting to be solved.',
        postId: post1.id,
        authorId: glen.id,
      });
      await blogService.createComment({
        content: 'Clean code is so satisfying. When everything just works beautifully together.',
        postId: post2.id,
        authorId: glen.id,
      });

      const comments = await blogService.getCommentsByUserId(glen.id);

      expect(comments).toHaveLength(2);
      expect(comments[0].authorId).toBe(glen.id);
      expect(comments[1].authorId).toBe(glen.id);
      expect(comments[0].post.title).toBe('What do you love about programming?');
      expect(comments[1].post.title).toBe('Best programming practices');
    });

    it('should delete a comment', async () => {
      const lisa = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });

      const post = await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts.',
        authorId: lisa.id,
      });

      const comment = await blogService.createComment({
        content: 'Test comment',
        postId: post.id,
        authorId: lisa.id,
      });

      await blogService.deleteComment(comment.id);

      const comments = await blogService.getCommentsByPostId(post.id);
      expect(comments).toHaveLength(0);
    });
  });

  describe('Complete Blog Scenario', () => {
    it('should demonstrate full blog functionality with two posts and comments', async () => {
      const lisa = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
      });

      const glen = await blogService.createUser({
        email: 'glen@example.com',
        name: 'Glen',
      });

      const post1 = await blogService.createPost({
        title: 'What do you love about programming?',
        content: 'Share your thoughts about what makes programming special to you.',
        authorId: lisa.id,
        published: true,
      });

      const post2 = await blogService.createPost({
        title: 'Best programming practices',
        content: 'Let us discuss the best practices in software development.',
        authorId: glen.id,
        published: true,
      });

      await blogService.createComment({
        content: 'I love the problem-solving aspect. Every bug is a puzzle waiting to be solved.',
        postId: post1.id,
        authorId: glen.id,
      });

      await blogService.createComment({
        content: 'The creativity! Building something from nothing with just code is incredible.',
        postId: post1.id,
        authorId: lisa.id,
      });

      await blogService.createComment({
        content: 'Writing clean, maintainable code is an art form. It makes collaboration so much better.',
        postId: post2.id,
        authorId: lisa.id,
      });

      await blogService.createComment({
        content: 'Testing is key! A well-tested codebase gives you confidence to ship features faster.',
        postId: post2.id,
        authorId: glen.id,
      });

      const fetchedPost1 = await blogService.getPostById(post1.id);
      const fetchedPost2 = await blogService.getPostById(post2.id);
      const lisaUser = await blogService.getUserById(lisa.id);
      const glenUser = await blogService.getUserById(glen.id);

      expect(fetchedPost1?.comments).toHaveLength(2);
      expect(fetchedPost2?.comments).toHaveLength(2);
      expect(fetchedPost1?.author.name).toBe('Lisa');
      expect(fetchedPost2?.author.name).toBe('Glen');
      expect(lisaUser?.posts).toHaveLength(1);
      expect(glenUser?.posts).toHaveLength(1);
      expect(lisaUser?.comments).toHaveLength(2);
      expect(glenUser?.comments).toHaveLength(2);
    });
  });

  describe('Relational Queries', () => {
    it('should verify cascade delete - deleting post deletes comments', async () => {
      const author = await blogService.createUser({
        email: 'lisa@example.com',
        name: 'Lisa',
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
  });
});