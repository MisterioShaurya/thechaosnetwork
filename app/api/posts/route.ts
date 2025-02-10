import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Db, ObjectId } from "mongodb";

const dbName = "yourDatabaseName"; // 🔹 Replace with your actual database name

// GET method to fetch all posts
export async function GET() {
  try {
    const client = await clientPromise;
    const db: Db = client.db(dbName);
    const posts = await db.collection("posts").find({}).toArray();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts", details: error },
      { status: 500 }
    );
  }
}

// POST method to create a new post
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db: Db = client.db(dbName);
    const { content, author } = await req.json();

    if (!content || !author) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await db.collection("posts").insertOne({
      content,
      author,
      createdAt: new Date(),
      replies: [], // ✅ Ensure replies start as an empty array
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post", details: error },
      { status: 500 }
    );
  }
}

// PATCH method to add a reply (supports nested replies)
export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db: Db = client.db(dbName);
    const { postId, parentReplyId, content, author } = await req.json();

    if (!postId || !content || !author) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const objectId = new ObjectId(postId);
    let result;

    if (parentReplyId) {
      // Add a sub-reply inside an existing reply
      const result = await db.collection("posts").updateOne(
        { "replies._id": parentReplyId },  // Match the parent reply
        {
          $set: {
            "replies.$.replies": {
              $each: [{
                _id: new ObjectId(),
                content,
                author,
                createdAt: new Date(),
                replies: [],
              }]
            }
          }
        }
      );
      
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add reply", details: error },
      { status: 500 }
    );
  }
}
