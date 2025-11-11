import { BlogService } from './blog.service';
import prisma from './prisma';

async function runDemo() {
  const blogService = new BlogService();

  try {
    console.log('\n========================================');
    console.log('BLOG SYSTEM DEMONSTRATION');
    console.log('========================================\n');

    console.log('Creating users...');
    const lisa = await blogService.createUser({
      email: 'lisa@example.com',
      name: 'Lisa',
    });

    const glen = await blogService.createUser({
      email: 'glen@example.com',
      name: 'Glen',
    });
    console.log('✓ Created 2 users: Lisa and Glen\n');

    console.log('Creating posts...');
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
    console.log('✓ Created 2 posts\n');

    console.log('Adding comments...');
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
    console.log('✓ Created 4 comments\n');

    const fetchedPost1 = await blogService.getPostById(post1.id);
    const fetchedPost2 = await blogService.getPostById(post2.id);

    console.log('========================================');
    console.log('POST 1: What do you love about programming?');
    console.log('========================================');
    console.log(`Author: ${fetchedPost1?.author.name} (${fetchedPost1?.author.email})`);
    console.log(`Content: ${fetchedPost1?.content}`);
    console.log(`Published: ${fetchedPost1?.published}`);
    console.log(`\nComments (${fetchedPost1?.comments.length}):`);
    fetchedPost1?.comments.forEach((comment, index) => {
      console.log(`\n  ${index + 1}. ${comment.author.name} says:`);
      console.log(`     "${comment.content}"`);
    });
    console.log('\n');

    console.log('========================================');
    console.log('POST 2: Best programming practices');
    console.log('========================================');
    console.log(`Author: ${fetchedPost2?.author.name} (${fetchedPost2?.author.email})`);
    console.log(`Content: ${fetchedPost2?.content}`);
    console.log(`Published: ${fetchedPost2?.published}`);
    console.log(`\nComments (${fetchedPost2?.comments.length}):`);
    fetchedPost2?.comments.forEach((comment, index) => {
      console.log(`\n  ${index + 1}. ${comment.author.name} says:`);
      console.log(`     "${comment.content}"`);
    });
    console.log('\n');

    const lisaUser = await blogService.getUserById(lisa.id);
    const glenUser = await blogService.getUserById(glen.id);

    console.log('========================================');
    console.log('USER PROFILES WITH ACTIVITY');
    console.log('========================================\n');

    console.log(`LISA (${lisaUser?.email})`);
    console.log(`  Posts created: ${lisaUser?.posts.length}`);
    lisaUser?.posts.forEach((post) => {
      console.log(`    - "${post.title}"`);
    });
    console.log(`  Comments made: ${lisaUser?.comments.length}`);
    lisaUser?.comments.forEach((comment) => {
      console.log(`    - "${comment.content.substring(0, 50)}..."`);
    });

    console.log(`\nGLEN (${glenUser?.email})`);
    console.log(`  Posts created: ${glenUser?.posts.length}`);
    glenUser?.posts.forEach((post) => {
      console.log(`    - "${post.title}"`);
    });
    console.log(`  Comments made: ${glenUser?.comments.length}`);
    glenUser?.comments.forEach((comment) => {
      console.log(`    - "${comment.content.substring(0, 50)}..."`);
    });

    console.log('\n========================================');
    console.log('DEMONSTRATION COMPLETE');
    console.log('========================================\n');
  } catch (error) {
    console.error('Error running demo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runDemo();