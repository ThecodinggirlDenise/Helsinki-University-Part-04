jest.setTimeout(20000); // Increase timeout to 20 seconds

const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");

const api = supertest(app);

const initialBlogs = [
  {
    title: "Test Blog 1",
    author: "Author 1",
    url: "http://example.com/1",
    likes: 5,
  },
  {
    title: "Test Blog 2",
    author: "Author 2",
    url: "http://example.com/2",
    likes: 10,
  },
];

// ✅ Fix 1: Ensure MongoDB is connected before running tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// ✅ Fix 2: Ensure database is properly cleared before each test
beforeEach(async () => {
  await mongoose.connection.db.collection("blogs").deleteMany({});
  await Blog.insertMany(initialBlogs);
});

test("blogs are returned as JSON", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("blog identifier is named id instead of _id", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body[0].id).toBeDefined();
});

test("a valid blog can be added via", async () => {
  const newBlog = {
    title: "Testing -Tryout 1",
    author: "Test Deniz",
    url: "http://example.com/new",
    likes: 7,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(initialBlogs.length + 1);
});

test("if likes is missing, it correctly defaults to 0", async () => {
  const newBlog = {
    title: "Blog Without Likes",
    author: "No Likes Author",
    url: "http://example.com/nolikes",
  };

  const response = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  expect(response.body.likes).toBe(0);
});

test("a blog without Name title and URL  is not added", async () => {
  const newBlog = {
    author: "No Name Author",
    likes: 3,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);

  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(initialBlogs.length);
});

afterAll(async () => {
  await mongoose.connection.close();
});
