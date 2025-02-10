import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // Correctly imports the MongoDB client
import { Db } from "mongodb"; // Removed unused MongoClient

// Use an environment variable for the database name
const dbName = "yourDatabaseName";

if (!dbName) {
  throw new Error("Please add your MongoDB database name to .env.local");
}

// GET method to fetch all posts
export async function GET() {
  try {
    const client = await clientPromise;
    const db: Db = client.db(dbName);
    const posts = await db.collection("posts").find({}).toArray();
    
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST method to create a new post
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db: Db = client.db(dbName);
    
    const body: { content?: string; author?: string } = await req.json();

    if (!body.content || !body.author) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await db.collection("posts").insertOne({
      content: body.content,
      author: body.author,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Post created successfully", result });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
