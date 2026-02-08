"use client";

import { useState, useEffect } from "react";
import {
    Shield,
    Search,
    Edit,
    Trash2,
    RefreshCw,
    Plus,
    CheckCircle2,
    XCircle,
    Info,
    Fingerprint,
    Tags,
    Star,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Permission {
    id: string;
    nombrePermiso: string;
    descripcion: string | null;
    categoria: string;
    activo: boolean;
    esSistema: boolean;
    createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [formData, setFormData] = useState({
        nombrePermiso: "",
        descripcion: "",
        categoria: "general",
    });

    const fetchPermissions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/permissions");
            const data = await res.json();
            if (data.error) {
                toast.error("Error: " + data.error);
                return;
            }
            setPermissions(data);
            setCurrentPage(1); // Reset to first page on fetch
        } catch (error) {
            console.error(error);
            toast.error("Error al conectar con la base de datos");
        } finally {
            setIsLoading(false);
        }
    };

    const deletePermission = async (id: string, esSistema: boolean) => {
        if (esSistema) {
            toast.error("Los permisos del sistema no pueden eliminarse");
            return;
        }
        if (!confirm("¿Estás seguro de que deseas eliminar este permiso? Esto podría afectar la seguridad del sistema.")) return;

        try {
            const res = await fetch(`/api/permissions/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Permiso eliminado correctamente");
                fetchPermissions();
            } else {
                toast.error(data.error || "Error al eliminar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const toggleStatus = async (permission: Permission) => {
        try {
            const res = await fetch(`/api/permissions/${permission.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activo: !permission.activo })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Permiso ${!permission.activo ? "activado" : "desactivado"}`);
                // Optimistic update
                setPermissions(prev => prev.map(p => p.id === permission.id ? { ...p, activo: !p.activo } : p));
            } else {
                toast.error(data.error || "Error al actualizar estado");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = editingPermission ? `/api/permissions/${editingPermission.id}` : "/api/permissions";
            const method = editingPermission ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success || !data.error) {
                toast.success(editingPermission ? "Permiso actualizado" : "Permiso creado correctamente");
                setIsModalOpen(false);
                setEditingPermission(null);
                setFormData({ nombrePermiso: "", descripcion: "", categoria: "general" });
                fetchPermissions();
            } else {
                toast.error(data.error || "Error al procesar la solicitud");
            }
        } catch (error) {
            toast.error("Error de comunicación con el servidor");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (p: Permission) => {
        setEditingPermission(p);
        setFormData({
            nombrePermiso: p.nombrePermiso,
            descripcion: p.descripcion || "",
            categoria: p.categoria || "general",
        });
        setIsModalOpen(true);
    };

    const handleModalOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            setEditingPermission(null);
            setFormData({ nombrePermiso: "", descripcion: "", categoria: "general" });
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const categories = ["all", ...new Set(permissions.map(p => p.categoria))];

    const filteredPermissions = permissions.filter(p => {
        const matchesSearch = p.nombrePermiso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.descripcion?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || p.categoria === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredPermissions.length / ITEMS_PER_PAGE);
    const paginatedPermissions = filteredPermissions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = {
        total: permissions.length,
        system: permissions.filter(p => p.esSistema).length,
        custom: permissions.filter(p => !p.esSistema).length,
    };

    return (
        <div className="flex flex-col gap-6 p-2 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground underline decoration-primary/30 decoration-4 underline-offset-8">Diccionario de Permisos</h1>
                    <p className="text-muted-foreground mt-2">
                        Control granular de capacidades y seguridad atómica.
                    </p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            <Plus className="h-5 w-5" />
                            Nuevo Permiso
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    {editingPermission ? "Editar Permiso" : "Nuevo Permiso"}
                                </DialogTitle>
                                <DialogDescription>Define una nueva capacidad atómica para el sistema.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-sm">Nombre</Label>
                                    <Input
                                        className="col-span-3 h-9"
                                        required
                                        placeholder="Ej: usuarios:crear"
                                        value={formData.nombrePermiso}
                                        onChange={e => setFormData({ ...formData, nombrePermiso: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-sm">Categoría</Label>
                                    <Select
                                        value={formData.categoria}
                                        onValueChange={val => setFormData({ ...formData, categoria: val })}
                                    >
                                        <SelectTrigger className="col-span-3 h-9">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="usuarios">Usuarios</SelectItem>
                                            <SelectItem value="ventas">Ventas</SelectItem>
                                            <SelectItem value="contabilidad">Contabilidad</SelectItem>
                                            <SelectItem value="inventario">Inventario</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-sm">Descripción</Label>
                                    <Input
                                        className="col-span-3 h-9"
                                        placeholder="Descripción de la acción"
                                        value={formData.descripcion}
                                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="h-10 px-8">
                                    {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {editingPermission ? "Actualizar" : "Crear Permiso"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Pagination Controls Mobile - Top */}
            <div className="flex md:hidden items-center justify-between bg-muted/20 p-2 rounded-lg border">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <span className="text-sm font-medium">{currentPage} / {totalPages || 1}</span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500 shadow-sm transition-transform hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Permisos</CardTitle>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm transition-transform hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sistema</CardTitle>
                        <Star className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{stats.system}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500 shadow-sm transition-transform hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personalizados</CardTitle>
                        <Tags className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-600">{stats.custom}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="shadow-md border-none ring-1 ring-border/60">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shadow-inner">
                            <Fingerprint className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Listado Maestro</CardTitle>
                            <CardDescription>Mostrando {paginatedPermissions.length} de {filteredPermissions.length} registros.</CardDescription>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {categories.filter(c => c !== "all").map(c => (
                                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative w-full md:w-56">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filtrar..."
                                className="pl-9 h-9"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={fetchPermissions}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[200px] font-bold">Nombre</TableHead>
                                    <TableHead className="font-bold">Categoría</TableHead>
                                    <TableHead className="font-bold">Descripción</TableHead>
                                    <TableHead className="font-bold">Estado</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20">
                                            <RefreshCw className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                                            <p className="text-muted-foreground font-medium">Sincronizando con la base de datos...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedPermissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                            No hay registros para mostrar.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPermissions.map((p) => (
                                        <TableRow key={p.id} className="hover:bg-primary/5 transition-colors group">
                                            <TableCell className="font-mono text-[11px] font-bold text-primary py-4">
                                                <div className="flex items-center gap-2">
                                                    {p.esSistema && <Star className="h-3 w-3 text-amber-500 fill-amber-500" title="Sistema" />}
                                                    {p.nombrePermiso}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium bg-muted/50 border-muted-foreground/20 text-[10px] h-5 capitalize">
                                                    {p.categoria}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[250px] truncate text-muted-foreground text-xs leading-relaxed">
                                                {p.descripcion || <span className="text-muted-foreground/40">- Sin descripción -</span>}
                                            </TableCell>
                                            <TableCell>
                                                {p.activo ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/50 text-[10px] h-5 px-2">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Activo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200/50 text-[10px] h-5 px-2">
                                                        <XCircle className="h-3 w-3 mr-1" /> Inactivo
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                                        onClick={() => openEditModal(p)}
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 ${p.activo ? "text-orange-500 hover:bg-orange-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                                                        onClick={() => toggleStatus(p)}
                                                        title={p.activo ? "Inhabilitar" : "Habilitar"}
                                                    >
                                                        {p.activo ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    </Button>
                                                    {!p.esSistema && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                            onClick={() => deletePermission(p.id, p.esSistema)}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
                        <div className="text-xs text-muted-foreground font-medium">
                            Página <span className="text-foreground">{currentPage}</span> de <span className="text-foreground">{totalPages || 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[11px] font-bold"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`h-6 w-6 rounded-md text-[10px] font-bold transition-all ${currentPage === i + 1
                                                ? "bg-primary text-white shadow-sm"
                                                : "hover:bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[11px] font-bold"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex gap-4 text-sm text-amber-800 shadow-sm">
                <Info className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold flex items-center gap-2">
                        Guía de Uso Seguro
                    </p>
                    <p className="opacity-90 leading-relaxed text-xs">
                        • Los permisos con icono <Star className="inline h-3 w-3 mb-1" /> son estructurales y su eliminación está bloqueada por hardware. <br />
                        • Al <strong>inhabilitar</strong> un permiso, los cambios surten efecto inmediato en la próxima validación de sesión de los usuarios. <br />
                        • Se recomienda usar nombres en formato <code className="bg-amber-100 px-1 rounded text-amber-900">modulo:accion</code> para mantener la consistencia.
                    </p>
                </div>
            </div>
        </div>
    );
}
