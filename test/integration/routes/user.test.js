const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { User } = require("../../../models/user");
const { use } = require("express/lib/router");

describe("/user", () => {
    afterEach(async () => {
      await User.deleteMany({});
    });
  describe("get /", () => {
    it("Should return all users", async () => {
      await User.collection.insertMany([
        { name: "swapnil" },
        { email: "swapnil@gmail.com" },
        { password: "123456" },
        { isAdmin: true },
      ]);
      const res = await req.get("/user");
      expect(res.body.some((u) => u.name === "swapnil")).toBeTruthy();
      expect(
        res.body.some((u) => u.email === "swapnil@gmail.com")
      ).toBeTruthy();
      expect(res.body.some((u) => u.password === "123456")).toBeTruthy();
      expect(res.body.some((u) => u.isAdmin === true)).toBeTruthy();
    });
  });

  describe("get /:id", () => {
    it("should return 400 if invalid is passed", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/user/" + id);
      expect(res.status).toBe(400);
    });

    it("should return 404 if user id is not found", async () => {
      const token = new User().getAuthToken();
      const user = new mongoose.Types.ObjectId();
      const res = await req.get("/user" + user).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return user property if valid user id is provided", async () => {
      const token = new User().getAuthToken();
      const user = new User({
        name: "Swapnil R",
        email: "swapnil@gmail.com",
        password: "swapnil123",
        isAdmin: true,
      });

      await user.save();
      const res = await req.get(`/user/${user._id}`).set("x-auth-token", token);
      expect(res.body).toHaveProperty("name", "Swapnil R");
    });
  });

  describe("post /", () => {
    it("should return 400 if valid token is not provided", async () => {
      const res = await req.post("/user");
      expect(res.status).toBe(400);
    });

    it("should return 404 if valid id is not provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.post("/user" + id);
      expect(res.status).toBe(404);
    });

    // it("should return 400 if name is less than 5 characters", async () => {
    //   const res = await req.post("/rental").send({ name: "mov" });
    //   expect(res.status).toBe(400);
    // });

    // it("should return 400 if name is greater than 50 characters", async () => {
    //   const res = await req.post("/rental").send({
    //     name: "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
    //   });
    //   expect(res.status).toBe(400);
    // });

    it("should return 400 if email is already registered", async () => {
      const user = new User({
        name: "Aditya K",
        email: "aditya@gmail.com",
        password: "aditya123",
        isAdmin: true,
      });
      await user.save();

      const res = await req
        .post("/rental/" + user._id)
        .send({ email: "aditya@gmail.com" });

      // console.log(res.body);

      expect(user).toHaveProperty("email", "aditya@gmail.com");
    });
  });

  describe("put /:id", () => {
    it("should return 400 if invalid id is provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.put("/user/" + id);
      expect(res.status).toBe(400);
    });

    it("should return 404 if invalid token is provided", async () => {
      const token = new User().getAuthToken();
      const res = await req.put("/user/").set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return user if user id is valid", async () => {
      const token = new User().getAuthToken();
      const user = new User({
        name: "Sharukh Khan",
        email: "sharukh@gmail.com",
        password: "sharukh123",
        isAdmin: true,
      });

      await user.save();
      // console.log(user);
      const res = await req.put("/user" + user._id).set("x-auth-token", token);

      expect(res.status).toBe(404);
      expect(user).toHaveProperty("name", "Sharukh Khan");
    });

    it("should update the user data if id is valid", async () => {
      const token = new User().getAuthToken();
      const user = new User({
        name: "Sharukh Khan",
        email: "sharukh@gmail.com",
        password: "sharukh123",
        isAdmin: true,
      });

      await user.save();

      const res = await req.put(`/user/${user._id}`).set("x-auth-token", token);
      expect(user).toHaveProperty("name", "Sharukh Khan");
    });
  });

  describe("delete /:id", () => {
    it("should return 404 if id is invalid", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/user/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 404 if token is not provided", async () => {
      const token = new User().getAuthToken();
      const res = await req.delete("/user").set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 403 if the user is not admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/rental/" + id).set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 200 if the user is admin or authorized", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const user = new User({
        name: "adminUser",
        email: "user@gmail.com",
        password: "delete",
        isAdmin: false,
      });
      await user.save();
      const res = await req
        .delete(`/user/${user._id}`)
        .set("x-auth-token", token)
        .send({
          name: "adminUser",
          email: "user@gmail.com",
          password: "delete",
          isAdmin: false,
        });
      expect(res.status).toBe(200);
    });
  });
});
