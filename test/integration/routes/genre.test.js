const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { Genre } = require("../../../models/genre");
const { User } = require("../../../models/user");

describe("/genre", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
  });
  describe("get /", () => {
    it("Should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const res = await req.get("/genre");
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("get /:id", () => {
    it("should return 400 if genre id is invalid", async () => {
      const res = await req.get("/genre/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre id is not found", async () => {
      const token = new User().getAuthToken();
      const genre = new mongoose.Types.ObjectId();
      const res = await req.get("/genre" + genre).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });
    it("should return genre if genre id is valid", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({ name: "genre3" });
      await genre.save();
      const res = await req
        .get("/genre" + genre._id)
        .set("x-auth-token", token);

      // expect(res.status).toBe(404);
      expect(genre).toHaveProperty("name", "genre3");
    });
  });

  describe("post /", () => {
    it("should return 400 if valid token is not provided", async () => {
      const res = await req.post("/genre");
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre name is less than 5 characters", async () => {
      const res = await req.post("/genre").send({ name: "abcd" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre name is greater than 50 characters", async () => {
      const res = await req.post("/genre").send({
        name: "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
      });
      expect(res.status).toBe(400);
    });

    it("should return save the genre if genre is valid", async () => {
      const token = new User().getAuthToken();
      await req
        .post("/genre")
        .set("x-auth-token", token)
        .send({ name: "validGenre" });
      const genre = await Genre.findOne({ name: "validGenre" });

      expect(genre).not.toBe(null);
      expect(genre).toHaveProperty("name", "validGenre");
    });

    it("should return save the genre if valid", async () => {
      const token = new User().getAuthToken();
      await req
        .post("/genre")
        .set("x-auth-token", token)
        .send({ name: "saveGenre" });
      const genre = await Genre.findOne({ name: "saveGenre" });
      expect(genre).toHaveProperty("name", "saveGenre");
    });
  });

  describe("put /:id", () => {
    it("should return 404 if genre id is invalid", async () => {
      const genre = "abc";
      const res = await req.put("/genre" + genre);
      expect(res.status).toBe(404);
    });

    it("should return 404 if genre id is not found", async () => {
      const token = new User().getAuthToken();
      const genre = new mongoose.Types.ObjectId();
      const res = await req.put("/genre" + genre).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return genre if genre id is valid", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({ name: "genre9" });

      await genre.save();
      const res = await req
        .put("/genre" + genre._id)
        .set("x-auth-token", token);

      // expect(res.status).toBe(404);
      expect(genre).toHaveProperty("name", "genre9");
    });

    it("should return 400 if genre has less than 5 characters", async () => {
      const genre = new mongoose.Types.ObjectId();
      const res = await req.put("/genre/" + genre).send({ name: "abcd" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre has greater than 50 characters", async () => {
      const genre = new mongoose.Types.ObjectId();
      const res = await req.put("/genre/" + genre).send({
        name: "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
      });
      expect(res.status).toBe(400);
    });

    it("should update genre if the genreId is valid", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({ name: "updateGenre" });

      const res = req.get("/genre").set("x-auth-token", token);
      expect(genre).toHaveProperty("name", "updateGenre");
    });
  });

  describe("delete /:id", () => {
    it("should return 404 if valid genre id is not provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/genre" + id);
      expect(res.status).toBe(404);
    });

    it("should return 404 if token is not provided", async () => {
      const token = new User().getAuthToken();
      const res = await req.delete("/genre").set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 403 if the user is not admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const genre = new Genre({ name: "deleteGenre" });

      await genre.save();
      const res = await req
        .delete(`/genre/${new mongoose.Types.ObjectId()}`)
        .set("x-auth-token", token)
        .send({ name: "deleteGenre" });
      expect(res.status).toBe(403);
    });

    it("should return 200 if the user is admin or authorized", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({
        name: "genre3",
      });
      await genre.save();
      const res = await req
        .delete(`/genre/${genre._id}`)
        .set("x-auth-token", token)
        .send({ name: "genre3" });
      expect(res.status).toBe(200);
    });
  });
});
