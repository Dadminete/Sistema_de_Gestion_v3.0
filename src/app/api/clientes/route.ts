import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientes } from "@/lib/db/schema";
import { asc, eq, sql, desc } from "drizzle-orm";

export async function GET() {
    try {
        const allClients = await db.select().from(clientes).orderBy(desc(clientes.createdAt));

        return NextResponse.json(JSON.parse(JSON.stringify(allClients, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )));
    } catch (error: any) {
        console.error("Error fetching clients:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nombre, apellidos, codigoCliente, ...otherData } = body;

        if (!nombre || !apellidos || !codigoCliente) {
            return NextResponse.json({ error: "Nombre, apellidos y código de cliente son obligatorios" }, { status: 400 });
        }

        const [newClient] = await db.insert(clientes).values({
            nombre,
            apellidos,
            codigoCliente,
            ...otherData,
            createdAt: sql`CURRENT_TIMESTAMP`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
        }).returning();

        return NextResponse.json(JSON.parse(JSON.stringify({ success: true, client: newClient }, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )));
    } catch (error: any) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
