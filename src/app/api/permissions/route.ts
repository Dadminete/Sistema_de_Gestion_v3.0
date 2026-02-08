import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { permisos } from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export async function GET() {
    try {
        const allPermissions = await db.select().from(permisos).orderBy(asc(permisos.nombrePermiso));

        return NextResponse.json(JSON.parse(JSON.stringify(allPermissions, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )));
    } catch (error: any) {
        console.error("Error fetching permissions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nombrePermiso, descripcion, categoria, activo, esSistema } = body;

        if (!nombrePermiso) {
            return NextResponse.json({ error: "El nombre del permiso es obligatorio" }, { status: 400 });
        }

        const [newPermission] = await db.insert(permisos).values({
            nombrePermiso,
            descripcion,
            categoria: categoria || 'general',
            activo: activo ?? true,
            esSistema: esSistema ?? false,
            updatedAt: sql`CURRENT_TIMESTAMP`,
        }).returning();

        return NextResponse.json(JSON.parse(JSON.stringify({ success: true, permission: newPermission }, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )));
    } catch (error: any) {
        console.error("Error creating permission:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
