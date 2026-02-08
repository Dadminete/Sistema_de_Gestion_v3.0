import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export async function GET() {
    try {
        // Fetch all roles ordered by name
        const allRoles = await db.select().from(roles).orderBy(asc(roles.nombreRol));

        return NextResponse.json(JSON.parse(JSON.stringify(allRoles, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )));
    } catch (error: any) {
        console.error("Error fetching roles:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nombreRol, descripcion } = body;

        if (!nombreRol) {
            return NextResponse.json({ error: "El nombre del rol es obligatorio" }, { status: 400 });
        }

        const [newRole] = await db.insert(roles).values({
            nombreRol,
            descripcion,
            activo: true,
            createdAt: sql`CURRENT_TIMESTAMP`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
        }).returning();

        return NextResponse.json(JSON.parse(JSON.stringify({ success: true, role: newRole }, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )));
    } catch (error: any) {
        console.error("Error creating role:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
