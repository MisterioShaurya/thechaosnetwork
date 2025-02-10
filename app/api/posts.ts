import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // Ensure this is correctly typed
import { Db, MongoClient } from "mongodb"; // Import MongoDB types

// Replace with your actual database name
const dbName = "yourDatabaseName"; 

// GET method to fetch all posts
export async function GET() {
  try {
    const client = await clientPromise;
    const db: Db = client.db(dbName); // Get database with type
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

    const result = await db
      .collection("posts")
      .insertOne({ content, author, createdAt: new Date() });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
