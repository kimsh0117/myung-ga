import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("counting-app");
    const collection = db.collection("counter");

    if (req.method === "GET") {
      let counter = await collection.findOne({ _id: "main" });
      if (!counter) {
        await collection.insertOne({ _id: "main", count: 0 });
        counter = { count: 0 };
      }
      return res.status(200).json({ count: counter.count });
    }

    if (req.method === "POST") {
      const { action, value } = req.body;
      let updateQuery = {};

      switch (action) {
        case "increase":
          updateQuery = { $inc: { count: 1 } };
          break;
        case "decrease":
          updateQuery = { $inc: { count: -1 } };
          break;
        case "set":
          updateQuery = { $set: { count: parseInt(value) || 0 } };
          break;
        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      const result = await collection.findOneAndUpdate(
        { _id: "main" },
        updateQuery,
        {
          upsert: true,
          returnDocument: "after",
        }
      );

      // 실시간 업데이트를 위한 이벤트 전송 (Vercel 최적화)
      if (global.sseClients && global.sseClients.size > 0) {
        const data = JSON.stringify({ count: result.count });
        const clientsToRemove = [];

        global.sseClients.forEach((client) => {
          try {
            if (!client.destroyed) {
              client.write(`data: ${data}\n\n`);
            } else {
              clientsToRemove.push(client);
            }
          } catch (error) {
            clientsToRemove.push(client);
          }
        });

        // 끊어진 연결 정리
        clientsToRemove.forEach((client) => {
          global.sseClients.delete(client);
        });
      }

      return res.status(200).json({ count: result.count });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
