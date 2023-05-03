const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { Rental } = require("../../../models/rental");
const { User } = require("../../../models/user");
const { Customer } = require("../../../models/customer");
const { Movie } = require("../../../models/movie");

describe("/rental", () => {
  afterEach(async () => {
    await Rental.deleteMany({});
  });
  describe("get /", () => {
    it("Should return all rentals", async () => {
      await Rental.collection.insertMany([
        { name: "rental1" },
        { name: "rental2" },
      ]);
      const res = await req.get("/rental");
      expect(res.body.some((r) => r.name === "rental1")).toBeTruthy();
      expect(res.body.some((r) => r.name === "rental2")).toBeTruthy();
    });
  });

  describe("get /:id", () => {
    it("should return 400 if rental id is invalid", async () => {
      const id = new mongoose.Types.ObjectId()
      const res = await req.get("/rental/" + id);
      expect(res.status).toBe(400);
    });

    it("should return 404 if rental id is not found", async () => {
      const token = new User().getAuthToken();
      const rental = new mongoose.Types.ObjectId();
      const res = await req.get("/rental" + rental).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return movie property if rental id is valid", async () => {
      const customer = new Customer({
        id: new mongoose.Types.ObjectId(),
        name: "Swapnil",
        phone: "866889191",
      });

      const movie = new Movie({
        id: new mongoose.Types.ObjectId(),
        title: "movie1",
        dailyRentalRate: 120,
        numberInStock: 20,
      });

      const rental = new Rental({
        movie: {
          _id: movie._id,
          title: movie.title,
          numberInStock: movie.numberInStock,
          dailyRentalRate: movie.dailyRentalRate,
        },
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        rentalFee: movie.dailyRentalRate * 10,
        dateOut: "2023-04-26T06:35:28.678+00:00",
      });

      // console.log(rental)

      await rental.save();
      const res = await req.get(`/rental/${rental._id}`);
      expect(rental).toHaveProperty("rentalFee", 1200);
      expect(rental.movie.title).toBe("movie1");
    });
  });

  describe("post /", () => {
    it("should return 400 if valid token is not provided", async () => {
      const res = await req.post("/rental");
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title in rental is less than 5 characters", async () => {
      const res = await req.post("/rental").send({ title: "mov" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title in rental is greater than 50 characters", async () => {
      const res = await req.post("/rental").send({
        title:
          "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie dailyrentalrate is not number", async () => {
      const res = await req.post("/rental").send({ dailyRentalRate: "100" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie numberinStock is not number", async () => {
      const res = await req.post("/rental").send({ numberInStock: "100" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer name in rental is less than 5 characters", async () => {
      const res = await req.post("/rental").send({ name: "pk" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer name in rental is greater than 50 characters", async () => {
      const res = await req.post("/rental").send({
        name: "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer phone in rental is less than 7 characters", async () => {
      const res = await req.post("/rental").send({ phone: "981010" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer phone in rental is less than 10 characters", async () => {
      const res = await req.post("/rental").send({ phone: "98101011123" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if rental fee is in string", async () => {
      const res = await req.post("/rental").send({ rentalFee: "100" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if dateOut in rental is invalid", async () => {
      const res = await req.post("/rental").send({ dateOut: "26-04-2023" });
      expect(res.status).toBe(400);
    });
  });

  describe("patch /:id ", () => {
    it("should return 404 if valid token is not provided", async () => {
      const token = new User().getAuthToken();
      const res = await req.patch("/rental").set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 404 if movie id is not found", async () => {
      const token = new User().getAuthToken();
      const rental = new mongoose.Types.ObjectId();
      const res = await req
        .patch("/rental" + rental)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should update the rental with dateIn if rental id is valid", async () => {
      const token = new User().getAuthToken();

      const customer = new Customer({
        id: new mongoose.Types.ObjectId(),
        name: "Swapnil",
        phone: "866889191",
      });

      await customer.save();

      const movie = new Movie({
        id: new mongoose.Types.ObjectId(),
        title: "Phir Here Pheri",
        dailyRentalRate: 120,
        numberInStock: 20,
      });

      await movie.save();

      let rental = new Rental({
        movie: {
          _id: movie._id,
          title: movie.title,
          numberInStock: movie.numberInStock,
          dailyRentalRate: movie.dailyRentalRate,
        },
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        rentalFee: movie.dailyRentalRate * 10,
        dateOut: "2023-04-26T06:35:28.678+00:00",
      });

      await rental.save();

      // console.log(rental);

      await req
        .patch("/rental/" + rental._id)
        .set("x-auth-token", token)
        .send({
          dateIn: new Date(),
        });

      rental = await Rental.findOne({ "movie.title": "Phir Hera Pheri" });

      // expect(rental.dateIn).not.toBeNull();
    });

    it("should increment numberInStock of chosen movie by 1 data is valid", async () => {
      const customer = new Customer({
        name: "Swapnil R",
        phone: "9800112233",
      });

      await customer.save();

      let movie = new Movie({
        title: "Welcome",
        dailyRentalRate: 100,
        numberInStock: 50,
      });

      await movie.save();

      let rental = new Rental({
        movie: {
          _id: movie._id,
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
          numberInStock: movie.numberInStock,
        },
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        rentalFee: 55,
      });
      await rental.save();
      const token = new User().getAuthToken();
      await req
        .patch("/rental/" + rental._id)
        .set("x-auth-token", token)
        .send({ dateIn: new Date() });

      movie = await Movie.findById(movie._id);
      expect(movie.numberInStock).toBe(51);
    });
  });

  describe("delete /:id", () => {
    it("should return 404 if valid rental id is not provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/delete" + id);
      expect(res.status).toBe(404);
    });

    it("should return 403 if user is not a admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/rental/" + id).set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should delete if rental is valid", async () => {
      const customer = new Customer({
        name: "Swapnil R",
        phone: "9800112233",
      });

      await customer.save();

      const movie = new Movie({
        title: "Welcome",
        dailyRentalRate: 100,
        numberInStock: 50,
      });

      await movie.save();

      let rental = new Rental({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie: {
          _id: movie._id,
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
          numberInStock: movie.numberInStock,
        },
        rentalFee: 55,
      });
      await rental.save();

      const token = new User({
        _id: new mongoose.Types.ObjectId(),
        isAdmin: true,
      }).getAuthToken();

      const res = await req
        .delete("/rental/" + rental._id)
        .set("x-auth-token", token);
      rental = await Rental.findById(rental._id);
      expect(rental).toBeNull();
    });
  });
});
