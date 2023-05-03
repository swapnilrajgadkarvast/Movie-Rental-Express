const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { Customer } = require("../../../models/customer");
const { User } = require("../../../models/user");

describe("/customer", () => {
  afterEach(async () => {
    await Customer.deleteMany({});
  });
  describe("get /", () => {
    it("Should return all customer's data", async () => {
      await Customer.collection.insertMany([
        { name: "customer1" },
        { phone: "9889898989" },
        { isGold: true },
      ]);
      const res = await req.get("/customer");
      expect(res.body.some((c) => c.name === "customer1")).toBeTruthy();
      expect(res.body.some((c) => c.phone === "9889898989")).toBeTruthy();
      expect(res.body.some((c) => c.isGold === true)).toBeTruthy();
    });
  });
  describe("get /:id", () => {
    it("should return 400 if customer id is invalid", async () => {
      const res = await req.get("/customer/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if customer id is not found", async () => {
      const token = new User().getAuthToken();
      const customer = new mongoose.Types.ObjectId();
      const res = await req
        .get("/customer" + customer)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });
    it("should return customer if customer id is valid", async () => {
      const token = new User().getAuthToken();
      const customer = new Customer({
        name: "customer",
        phone: "9889898989",
        isGold: true,
      });
      //console.log(customer)
      await customer.save();
      const res = await req
        .get("/customer" + customer._id)
        .set("x-auth-token", token);

      // expect(res.status).toBe(404);
      expect(customer).toHaveProperty(
        "name",
        "customer",
        "phone",
        "9889898989",
        "isGold",
        "true"
      );
    });
  });

  describe("post /", () => {
    it("should return 404 if valid token is not provided", async () => {
      const token = new User().getAuthToken()
      const res = await req.post("/customer"+ token);
      expect(res.status).toBe(404);
    });

    it("should return 400 if customer name is less than 5 characters", async () => {
      const res = await req.post("/customer").send({ name: "abcd" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer phone is less than 7 characters", async () => {
      const res = await req.post("/customer").send({ phone: "988989" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer is isGold ", async () => {
      const res = await req.post("/customer").send({ isGold: true });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer name is greater than 50 characters", async () => {
      const res = await req.post("/customer").send({
        name: "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer phone is greater than 10 characters ", async () => {
      const res = await req.post("/customer").send({ phone: "98898989897" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer not a isGold  ", async () => {
      const res = await req.post("/customer").send({ isGold: false });
      expect(res.status).toBe(400);
    });

    // it("should return save the customer if customer is valid", async () => {
    //   const token = new User().getAuthToken();

    //   await req
    //     .post("/customer")
    //     .set("x-auth-token", token)
    //     .send({ name: "validcustomer", phone: "9889898989", isGold: true });

    //   const customer = await Customer.findOne({
    //     name: "validcustomer",
    //     phone: "9889898989",
    //     isGold: true,
    //   });


    //   expect(customer).not.toBe(null);
    //   expect(customer).toHaveProperty(
    //     "name",
    //     "validcustomer",
    //     "phone",
    //     "9889898989",
    //     "isGold",
    //     "true"
    //   );
    // });

  //   it("should return save the customer if valid", async () => {
  //     const token = new User().getAuthToken();
  //     await req
  //       .post("/customer")
  //       .set("x-auth-token", token)
  //       .send({ name: "savecustomer", phone: "9889898989", isGold: true });
  //     const customer = await Customer.findOne({
  //       name: "savecustomer",
  //       phone: "9889898989",
  //       isGold: true,
  //     });
  //     expect(customer).toHaveProperty(
  //       "name",
  //       "savecustomer",
  //       "phone",
  //       "9889898989",
  //       "isGold",
  //       "true"
  //     );
  //   });
  });

  describe("put /:id", () => {
    it("should return 404 if customer id is invalid", async () => {
      const customer = "abc";
      const res = await req.put("/customer" + customer);
      expect(res.status).toBe(404);
    });

    it("should return 404 if customer id is not found", async () => {
      const token = new User().getAuthToken();
      const customer = new mongoose.Types.ObjectId();
      const res = await req
        .put("/customer" + customer)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return customer if customer id is valid", async () => {
      const token = new User().getAuthToken();
      const customer = new Customer({
        name: "validCustomer",
        phone: "7838389898",
        isGold: true,
      });

      await customer.save();
      //   console.log(customer)
      const res = await req
        .put("/customer" + customer._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
      expect(customer).toHaveProperty(
        "name",
        "validCustomer",
        "phone",
        "7838389898",
        "isGold",
        "true"
      );
    });

    it("should return 400 if customer has name less than 5 characters", async () => {
      const customer = new mongoose.Types.ObjectId();
      const res = await req.put("/customer/" + customer).send({ name: "abcd" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer has name greater than 50 characters", async () => {
      const customer = new mongoose.Types.ObjectId();
      const res = await req.put("/customer/" + customer).send({
        name: "abjdkhkjdhkfjhkdjshkfjhkjsdhfkjhsdkjhfkjshdfkjhsdkjhfkjsdhfkjhkhdskjfhkjhdskjfhkjsdhgkjhdkjgh",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer has less than 7 characters", async () => {
      const customer = new mongoose.Types.ObjectId();
      const res = await req
        .put("/customer/" + customer)
        .send({ phone: "783838" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer has greater than 10 characters", async () => {
      const customer = new mongoose.Types.ObjectId();
      const res = await req
        .put("/customer/" + customer)
        .send({ phone: "78383889890" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer is isGold member", async () => {
      const customer = new mongoose.Types.ObjectId();
      const res = await req.put("/customer/" + customer).send({ isGold: true });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer is not isGold member", async () => {
      const customer = new mongoose.Types.ObjectId();
      const res = await req
        .put("/customer/" + customer)
        .send({ isGold: false });
      expect(res.status).toBe(400);
    });

    it("should update customer if the customerId is valid", async () => {
      const token = new User().getAuthToken();
      const customer = new Customer({ name: "updatecustomer" });

      //   console.log(customer)

      const res = req.get("/customer").set("x-auth-token", token);
      expect(customer).toHaveProperty("name", "updatecustomer");
    });
  });

  describe("delete /:id", () => {
    it("should return 404 if valid customer id is not provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/customer" + id);
      expect(res.status).toBe(404);
    });

    it("should return 404 if token is not provided", async () => {
      const token = new User().getAuthToken();
      const res = await req.delete("/customer").set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 403 if the user is not admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const customer = new Customer({
        name: "deletecustomer",
        phone: "9091919100",
        isGold: true,
      });

      await customer.save();
      const res = await req
        .delete(`/customer/${new mongoose.Types.ObjectId()}`)
        .set("x-auth-token", token)
        .send({ name: "deletecustomer", phone: "9091919100", isGold: true });
      expect(res.status).toBe(403);
    });

    it("should return 200 if the user is admin or authorized", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const customer = new Customer({
        name: "adminCustomer",
        phone: "9091919100",
        isGold: true
      });
      await customer.save();
      const res = await req
        .delete(`/customer/${customer._id}`)
        .set("x-auth-token", token)
        .send({ name: "adminCustomer", phone: "9091919100", isGold: true });
      expect(res.status).toBe(200);
    });
  });
});
