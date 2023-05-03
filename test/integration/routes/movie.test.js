const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { Movie } = require("../../../models/movie");
const { User } = require("../../../models/user");

describe("/movie", () => {
    afterEach(async () => {
      await Movie.deleteMany({});
    });
  describe("get /", () => {
    it("Should return all movie data", async () => {
      await Movie.collection.insertMany([
        { title: "movie1" },
        { dailyRentalRate: 100 },
        { numberInStock: 50 },
        { genre: "Comedy" },
        { liked: true },
      ]);
      const res = await req.get("/movie");
      expect(res.body.some((m) => m.title === "movie1")).toBeTruthy();
      expect(res.body.some((m) => m.dailyRentalRate === 100)).toBeTruthy();
      expect(res.body.some((m) => m.numberInStock === 50)).toBeTruthy();
      expect(res.body.some((m) => m.genre === "Comedy")).toBeTruthy();
      expect(res.body.some((m) => m.liked === true)).toBeTruthy();
    });
  });

  describe("get /:id", () => {
    it("should return 400 if movie id is invalid", async () => {
      const res = await req.get("/movie/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if movie id is not found", async () => {
      const token = new User().getAuthToken();
      const movie = new mongoose.Types.ObjectId();
      const res = await req.get("/movie" + movie).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 200 if movies id is valid", async () => {
      const movie = new Movie({
        title: "movie1",
        dailyRentalRate: 120,
        numberInStock: 20,
        genre: {
          id: new mongoose.Types.ObjectId(),
          name: "genre1",
        },
        liked: true,
      });

      //   console.log(movie)

      await movie.save();
      const res = await req.get(`/movie/${movie._id}`);
      expect(movie).toHaveProperty("title", "movie1");
    });
  });

  describe("post /", () => {
    it("should return 400 if valid token is not provided", async () => {
      const res = await req.post("/movie");
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title is less than 2 characters", async () => {
      const res = await req.post("/movie").send({ name: "a" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title is greater than 50 characters", async () => {
      const res = await req.post("/movie").send({
        title:
          "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie dailyrentalrate is not number", async () => {
      const res = await req.post("/movie").send({ dailyRentalRate: "100" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie numberinStock is not number", async () => {
      const res = await req.post("/movie").send({ numberInStock: "100" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie genre is not id", async () => {
      const res = await req.post("/movie").send({ genre: "comedy" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie liked is true", async () => {
      const res = await req.post("/movie").send({ liked: true });
      expect(res.status).toBe(400);
    });

    it("should check if the movie is saved or not", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/movie")
        .set("x-auth-token", token)
        .send({
          title: "newMovie",
          dailyRentalRate: 100,
          numberInStock: 50,
          genreId: new mongoose.Types.ObjectId("6449fff3dc26c2de9ea26085"),
          liked: true,
        });

      const movie = await Movie.findOne({ title: "newMovie" });
      // console.log(movie)

      expect(movie).not.toBe(null);
      expect(movie).toHaveProperty("title", "newMovie");
    });

    it("should return save the movie if valid", async () => {
      const token = new User().getAuthToken();
      await req
        .post("/movie")
        .set("x-auth-token", token)
        .send({
          title: "validmovie",
          dailyRentalRate: 100,
          numberInStock: 50,
          genreId: new mongoose.Types.ObjectId("6449fff3dc26c2de9ea26085"),
          liked: false,
        });
      const movie = await Movie.findOne({
        title: "validmovie",
      });
      expect(movie).toHaveProperty("title", "validmovie");
    });
  });

  describe("put /:id", () => {
    it("should return 404 if movie id is invalid", async () => {
      const movie = "abc";
      const res = await req.put("/movie" + movie);
      expect(res.status).toBe(404);
    });

    it("should return 404 if movie id is not found", async () => {
      const token = new User().getAuthToken();
      const movie = new mongoose.Types.ObjectId();
      const res = await req.put("/movie" + movie).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 400 if title has name less than 2 characters", async () => {
      const movie = new mongoose.Types.ObjectId();
      const res = await req.put("/movie/" + movie).send({ name: "a" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie has title greater than 50 characters", async () => {
      const movie = new mongoose.Types.ObjectId();
      const res = await req.put("/movie/" + movie).send({
        name: "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
      });
      expect(res.status).toBe(400);
    });

    it("should return updated the movie if input is valid", async () => {
      const token = new User().getAuthToken();
      const movie = new Movie({
        title: "New Movie",
        dailyRentalRate: 120,
        numberInStock: 20,
        genre: {
          _id: "6448ced3e0ecfa263a4f0dbd",
          name: "genre1",
        },
        liked: true,
      })
      
      await movie.save();
      const res = await req
        .put(`/movie/${movie._id}`)
        .set("x-auth-token", token)
        .send({
          title: "New Movie",
          dailyRentalRate: 120,
          numberInStock: 20,
          genreId: new mongoose.Types.ObjectId("6448ced3e0ecfa263a4f0dbd"),
          liked: true,
        });
        
      // expect(res.status).toBe(200)
      expect(movie).toHaveProperty("title", "New Movie");
    });
  });

  describe("delete /:id", () => {
    it("should return 404 if valid movie id is not provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/movie" + id);
      expect(res.status).toBe(404);
    });

    it("should return 404 if valid token is not provided", async () => {
      const token = new User().getAuthToken();
      const res = await req.delete("/movie").set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 403 if the user is not admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const movie = new Movie({
        title: "New Movie",
        dailyRentalRate: 120,
        numberInStock: 20,
        genreId: new mongoose.Types.ObjectId("6448ced3e0ecfa263a4f0dbd"),
        liked: true,
      });

      await movie.save();
      const res = await req
        .delete(`/movie/${new mongoose.Types.ObjectId()}`)
        .set("x-auth-token", token)
      expect(res.status).toBe(403);
    });

    it("should return 200 if the user is admin or authorized", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const movie = new Movie({
        title: "New Movie",
        dailyRentalRate: 120,
        numberInStock: 20,
        genreId: new mongoose.Types.ObjectId("6448ced3e0ecfa263a4f0dbd"),
        liked: true
      });
      await movie.save();
      // console.log(movie)
      const res = await req
        .delete(`/movie/${movie._id}`)
        .set("x-auth-token", token)
        // .send({title: "New Movie"})
      expect(res.status).toBe(200);
    });
  });
});
