import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);

export const backupService = {
    getBackupPath: () => process.env.BACKUP_PATH || path.join(process.cwd(), "backups"),
    getPostgresBin: () => process.env.POSTGRES_BIN_PATH || "",

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `backup-${timestamp}.sql`;
        const filePath = path.join(this.getBackupPath(), fileName);
        const pgDumpPath = this.getPostgresBin() ? path.join(this.getPostgresBin(), "pg_dump.exe") : "pg_dump";

        if (!fs.existsSync(this.getBackupPath())) {
            fs.mkdirSync(this.getBackupPath(), { recursive: true });
        }

        // Neon connection string is URL based, pg_dump handles it well
        const command = `"${pgDumpPath}" "${process.env.DATABASE_URL}" -f "${filePath}"`;

        try {
            await execPromise(command);
            return { success: true, fileName, filePath };
        } catch (error: any) {
            console.error("Backup failed:", error);
            throw new Error(`pg_dump failed: ${error.message}`);
        }
    },

    async listBackups() {
        const directory = this.getBackupPath();
        if (!fs.existsSync(directory)) return [];

        const files = fs.readdirSync(directory);
        return files
            .filter(f => f.endsWith(".sql"))
            .map(f => {
                const stats = fs.statSync(path.join(directory, f));
                return {
                    name: f,
                    size: stats.size,
                    createdAt: stats.birthtime,
                };
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    async deleteBackup(fileName: string) {
        const filePath = path.join(this.getBackupPath(), fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    },

    async restoreBackup(fileName: string) {
        const filePath = path.join(this.getBackupPath(), fileName);
        const psqlPath = this.getPostgresBin() ? path.join(this.getPostgresBin(), "psql.exe") : "psql";

        if (!fs.existsSync(filePath)) throw new Error("Backup file not found");

        // Warning: psql with URL will drop/recreate based on the script content
        const command = `"${psqlPath}" "${process.env.DATABASE_URL}" -f "${filePath}"`;

        try {
            await execPromise(command);
            return { success: true };
        } catch (error: any) {
            console.error("Restore failed:", error);
            throw new Error(`psql restore failed: ${error.message}`);
        }
    }
};
