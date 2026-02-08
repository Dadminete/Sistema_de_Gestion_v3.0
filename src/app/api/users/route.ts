import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usuarios, usuariosRoles } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET() {
    try {
        // @ts-ignore - Bypassing Drizzle typing error for query schema
        const allUsers = await (db.query as any).usuarios.findMany({
            orderBy: [desc(usuarios.createdAt)],
            with: {
                usuariosRoles_usuarioId: {
                    with: {
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(JSON.parse(JSON.stringify(allUsers, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )));
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, nombre, apellido, email, password, rolId } = body;

        if (!username || !nombre || !apellido || !password) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const result = await db.transaction(async (tx) => {
            // 1. Create the user
            const [newUser] = await tx.insert(usuarios).values({
                username,
                nombre,
                apellido,
                email: email || null,
                passwordHash: password, // FIXME: In a real app, hash the password
                activo: true,
                updatedAt: sql`CURRENT_TIMESTAMP`,
            }).returning();

            // 2. Assign the role if provided
            if (rolId) {
                await tx.insert(usuariosRoles).values({
                    usuarioId: newUser.id,
                    rolId: Number(rolId),
                    activo: true,
                    fechaAsignacion: sql`CURRENT_TIMESTAMP`,
                });
            }

            return newUser;
        });

        return NextResponse.json({ success: true, user: result });
    } catch (error: any) {
        console.error("Error creating user:", error);
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json({ error: "El nombre de usuario o email ya existe" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
