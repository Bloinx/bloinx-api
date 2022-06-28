import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const BASE_URL = 'https://api.thegraph.com/subgraphs/name/arturvargas/bloinx-data';

const allowList = ['http://localhost:3000'];
const corsOptions = {
  origin (origin: any, callback: any) {
    if (allowList.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.get('/', (req, res) => {
  res.send("Bloinx");
});

app.get('/score', cors(corsOptions), async (req, res) => {
  try {
    const result = await axios.post(BASE_URL,{
      query: `
        {
          savingGroupsDatas(first: 10, orderBy: block, orderDirection: desc) {
            id
            admin
            contract
            groupSize
            latePayments
            block
            timestamp
          }
        }
      `
    })
    // tslint:disable-next-line:no-console
    // console.log("Query Result: \n ", result.data.data.savingGroupsDatas);
    const { savingGroupsDatas } = result.data.data;
    let genScore = 0;

    await savingGroupsDatas.forEach((data: any) => {
      genScore += data.groupSize;
    });

    res.status(200).send({ score: genScore * 5 });

  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log("Error ", error);
    res.status(500).json({ status: "error", mensaje: "Error en la petición" })
  }
})
app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server running in port: ${PORT}`);
});
