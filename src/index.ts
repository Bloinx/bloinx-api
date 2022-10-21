import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const BASE_URL =
  "https://api.thegraph.com/subgraphs/name/arturvargas/bloinx-info";

const allowList = ["http://localhost:3000"];
const corsOptions = {
  origin(origin: any, callback: any) {
    if (allowList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.get("/", (req, res) => {
  res.send("Bloinx");
});

app.get("/score", async (req, res) => {
  // cors(corsOptions),
  try {
    const { address }: any = req.query;

    const result = await axios.post(BASE_URL, {
      query: `
        {
          rounds(where: { admin: "${address}"}) {
            id
            admin
            contract
            groupSize
          }
          userLatePayments(where: { user: "${address}"}) {
            user
            turn
            timestamp
          }
        }
      `,
    });
    // tslint:disable-next-line:no-console
    // console.log("Query Result: \n ", result.data.data);
    const { rounds, userLatePayments } = result.data.data;
    let genScore = 0;

    await rounds.forEach((data: any) => {
      genScore += data.groupSize;
    });

    const sumary = userLatePayments ? userLatePayments.length : 0;

    const calculateScore = ((genScore - sumary) / genScore) * 5;

    res.status(200).send({ score: calculateScore });
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log("Error ", error);
    res.status(500).json({ status: "error", mensaje: "Error en la petición" });
  }
});
app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server running in port: ${PORT}`);
});
