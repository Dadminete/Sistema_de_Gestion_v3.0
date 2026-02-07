import { NextResponse } from "next/server";
import { backupService } from "@/lib/db/backup-service";

export async function POST() {
    try {
        const result = await backupService.createBackup();
        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
