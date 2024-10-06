const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@codepee-database.kjs15.mongodb.net/?retryWrites=true&w=majority&appName=codepee-database`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const courseCollection = client.db("courseDB").collection("course");
    const cartCollection = client.db("courseDB").collection("mycourse");
    const enrollCollection = client.db("courseDB").collection("enrollcourse");

    //ADD DATA
    app.post("/course", async (req, res) => {
      const course = req.body;
      const result = await courseCollection.insertOne(course);
      // console.log(result);
      res.send(result);
    });
   

    //GET DATA
    app.get("/course", async (req, res) => {
      const result = await courseCollection.find().toArray();
      res.send(result);
    });

    app.get("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await courseCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.put("/course/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body; // This should be used to extract the update data

      // Validate the ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format");
      }

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }; // Adjust this if you don't want to create a new entry if none found
      const updatedUser = {
        $set: {
          title: data?.title,
          image_link: data?.image_link,
          price: data?.price,
          short_description: data?.short_description,
          description: data?.description,
        },
      };

      try {
        const result = await courseCollection.updateOne(
          filter,
          updatedUser,
          options
        );
        if (result.modifiedCount === 0) {
          return res.status(404).send("Course not found or no changes made");
        }
        res.send({ message: "Course updated successfully", result });
      } catch (error) {
        console.error("Update error:", error);
        res.status(500).send("Error updating course");
      }
    });

    //DELETE  single DATA
    app.delete("/course/:id", async (req, res) => {
      const id = req.params.id;
      console.log("delete", id);
      const query = {
        _id: new ObjectId(id),
      };

      const result = await courseCollection.deleteOne(query);
      console.log(result);

      if (result.deletedCount === 1) {
        res.status(200).send({ message: "Course deleted successfully" });
      } else {
        res.status(404).send({ message: "Course not found" });
      }
    });

    app.post("/mycourse", async (req, res) => {
      const {
        title,
        image_link,
        price,
        short_description,
        description,
        email,
        transactionID,
      } = req.body;

      // Validate incoming data
      if (!title || !email || !price || !transactionID) {
        return res.status(400).send("Missing required fields");
      }

      const newCartItem = {
        title,
        image_link,
        price,
        short_description,
        description,
        email,
        transactionID, // Store transaction ID
        addedAt: new Date(),
      };

      try {
        // Insert the cart item into MongoDB
        const result = await cartCollection.insertOne(newCartItem);
        res.status(201).send({ message: "Course added to cart", data: result });
      } catch (error) {
        console.error("Error adding course to cart:", error);
        res.status(500).send("Error adding course to cart");
      }
    });

    // get data
    app.get("/mycourse", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });


/**
 * 
 * Admin Data
 * 
 */

 //ADD DATA
 app.post("/enrollcourse", async (req, res) => {
  try {
      const course = req.body;
      const result = await enrollCollection.insertOne(course);
      res.status(201).send(result); 
  } catch (error) {
      console.error("Error inserting course:", error);
      res.status(500).send({ message: "Internal server error" });
  }
});


//Enroll data get
app.get("/enrollcourse", async (req, res) => {
  const result = await enrollCollection.find().toArray();
  res.send(result);
});


// Endpoint to remove an enrollment
app.delete("/enrollcourse/:id", async (req, res) => {
  const id = req.params.id;

  try {
      const result = await enrollCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Enrollment not found" });
      }
      res.send({ message: "Enrollment removed successfully" });
  } catch (error) {
      console.error("Error removing enrollment:", error);
      res.status(500).send({ message: "Internal server error" });
  }
});



















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running...");
});

app.listen(port, () => {
  console.log(`server is Running on port ${port}`);
});
