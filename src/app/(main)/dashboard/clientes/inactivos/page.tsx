"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Edit,
    Trash2,
    RefreshCw,
    Plus,
    CheckCircle2,
    XCircle,
    Info,
    UserPlus,
    Phone,
    Mail,
    MapPin,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    MoreVertical,
    BadgeCheck,
    UserMinus,
    FileText,
    Wrench,
    Clock,
    History,
    Calendar,
    Target,
    LayoutDashboard
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Cliente {
    id: string;
    codigoCliente: string;
    nombre: string;
    apellidos: string;
    cedula: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    estado: string;
    tipoCliente: string;
    categoriaCliente: string;
    fotoUrl: string | null;
    createdAt: string;
}

interface Factura {
    id: string;
    numeroFactura: string;
    fechaFactura: string;
    total: string;
    estado: string;
}

interface Ticket {
    id: string;
    numeroTicket: string;
    asunto: string;
    fechaCreacion: string;
    estado: string;
    prioridad: string;
}

const ITEMS_PER_PAGE = 10;

export default function InactiveClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
    const [detailClient, setDetailClient] = useState<{
        client: Cliente;
        invoices: Factura[];
        tickets: Ticket[];
    } | null>(null);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        telefono: "",
        direccion: "",
        estado: "activo",
    });

    const fetchClientes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/clientes");
            const data = await res.json();
            if (data.error) {
                toast.error("Error: " + data.error);
                return;
            }
            // Filter only inactive, suspended or canceled
            const inactiveOnly = data.filter((c: Cliente) => ["inactivo", "cancelado", "suspendido"].includes(c.estado));
            setClientes(inactiveOnly);
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClientDetail = async (id: string) => {
        setIsFetchingDetail(true);
        setIsDetailModalOpen(true);
        try {
            const res = await fetch(`/api/clientes/${id}`);
            const data = await res.json();
            if (data.success) {
                setDetailClient(data);
            } else {
                toast.error(data.error || "No se pudo cargar el detalle");
                setIsDetailModalOpen(false);
            }
        } catch (error) {
            toast.error("Error al obtener detalles");
            setIsDetailModalOpen(false);
        } finally {
            setIsFetchingDetail(false);
        }
    };

    const toggleStatus = async (cliente: Cliente, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const nuevoEstado = cliente.estado === "activo" ? "inactivo" : "activo";
        try {
            const res = await fetch(`/api/clientes/${cliente.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Cliente ${nuevoEstado === "activo" ? "habilitado" : "actualizado"}`);
                fetchClientes(); // Refresh list to reflect changes in filter
            }
        } catch (error) {
            toast.error("Error al actualizar estado");
        }
    };

    const deleteCliente = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!confirm("¿Estás seguro de que deseas eliminar este cliente permanentemente?")) return;
        try {
            const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Cliente eliminado");
                fetchClientes();
            }
        } catch (error) {
            toast.error("Error al eliminar cliente");
        }
    };

    const handleEdit = (cliente: Cliente, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingCliente(cliente);
        setFormData({
            nombre: cliente.nombre,
            apellidos: cliente.apellidos,
            email: cliente.email || "",
            telefono: cliente.telefono || "",
            direccion: cliente.direccion || "",
            estado: cliente.estado,
        });
        setIsEditModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/clientes/${editingCliente?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Datos actualizados");
                setIsEditModalOpen(false);
                fetchClientes();
            }
        } catch (error) {
            toast.error("Error al guardar cambios");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const filteredClientes = clientes.filter(c => {
        const matchesSearch =
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.codigoCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.estado === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        const nameA = `${a.nombre} ${a.apellidos}`.toLowerCase();
        const nameB = `${b.nombre} ${b.apellidos}`.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredClientes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = {
        total: clientes.length,
        inactive: clientes.filter(c => c.estado === "inactivo").length,
        suspended: clientes.filter(c => c.estado === "suspendido").length,
        canceled: clientes.filter(c => c.estado === "cancelado").length,
    };

    return (
        <div className="flex flex-col gap-6 p-2 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground underline decoration-primary/30 underline-offset-8 text-orange-600">Clientes Inactivos</h1>
                    <p className="text-muted-foreground mt-2">Visión focalizada en clientes fuera de servicio, suspendidos o retirados.</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); window.location.href = '/dashboard/clientes/listado'; }}>
                    <Users className="h-5 w-5" />
                    Volver al Listado General
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-gray-400">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Inactivos</CardTitle>
                        <UserMinus className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.inactive}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Suspendidos</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{stats.suspended}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Cancelados</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{stats.canceled}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Card */}
            <Card className="shadow-md border-none ring-1 ring-border/60 overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-full">
                            <UserMinus className="h-5 w-5 text-orange-600" />
                        </div>
                        <CardTitle className="text-xl">Expedientes Inactivos</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Ver Todos</SelectItem>
                                <SelectItem value="inactivo">Inactivos</SelectItem>
                                <SelectItem value="suspendido">Suspendidos</SelectItem>
                                <SelectItem value="cancelado">Cancelados</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
                                className="pl-9 h-9"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); fetchClientes(); }}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-bold w-[220px]">Cliente</TableHead>
                                <TableHead className="font-bold w-[280px]">Contacto</TableHead>
                                <TableHead className="font-bold">Ubicación</TableHead>
                                <TableHead className="font-bold w-[100px]">Estado</TableHead>
                                <TableHead className="text-center font-bold w-[160px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                        Cargando información...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                        No se encontraron clientes inactivos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedItems.map((c) => (
                                    <TableRow
                                        key={c.id}
                                        className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                        onClick={() => fetchClientDetail(c.id)}
                                    >
                                        <TableCell className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-foreground">{c.nombre} {c.apellidos}</span>
                                                <span className="text-[10px] text-primary/70 font-mono font-bold tracking-tight uppercase">{c.codigoCliente}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Phone className="h-3 w-3 shrink-0 text-primary/60" /> {c.telefono || "N/A"}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3 shrink-0 text-primary/60" /> {c.email || "N/A"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 max-w-[300px] truncate text-xs text-muted-foreground italic">
                                            <div className="flex items-center gap-1.5 ">
                                                <MapPin className="h-3 w-3 shrink-0 text-primary/60" /> {c.direccion || "No registrada"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            {c.estado === "cancelado" ? (
                                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200/50 text-[10px] h-5 shadow-none transition-none">Cancelado</Badge>
                                            ) : c.estado === "suspendido" ? (
                                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 text-[10px] h-5 shadow-none transition-none">Suspendido</Badge>
                                            ) : (
                                                <Badge className="bg-gray-500/10 text-gray-600 border-gray-200/50 text-[10px] h-5 shadow-none transition-none">Inactivo</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    onClick={() => fetchClientDetail(c.id)}
                                                    title="Ver expediente"
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-8 w-8 text-emerald-500 hover:bg-emerald-50`}
                                                    onClick={(e) => toggleStatus(c, e)}
                                                    title='Reactivar Cliente'
                                                >
                                                    <BadgeCheck className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                                    onClick={(e) => deleteCliente(c.id, e)}
                                                    title="Eliminar Permanente"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
                        <span className="text-xs text-muted-foreground font-medium">Mostrando página {currentPage} de {totalPages || 1}</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[11px] font-bold"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[11px] font-bold"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="sm:max-w-[480px] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Expediente del Cliente</DialogTitle>
                        <DialogDescription>Información detallada sobre el perfil, facturación y servicios del cliente.</DialogDescription>
                    </DialogHeader>

                    {isFetchingDetail ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-muted-foreground font-medium">Obteniendo expediente del cliente...</p>
                        </div>
                    ) : detailClient ? (
                        <>
                            <div className="bg-primary/95 pt-8 pb-12 px-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <Users className="h-48 w-48 text-white" />
                                </div>
                                <div className="flex flex-col items-center gap-4 relative z-10 text-center">
                                    <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-4xl font-bold shadow-2xl rotate-3 group-hover:rotate-0 transition-transform overflow-hidden">
                                        {detailClient.client.fotoUrl ? (
                                            <img
                                                src={detailClient.client.fotoUrl}
                                                alt={`${detailClient.client.nombre} ${detailClient.client.apellidos}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{detailClient.client.nombre[0]}{detailClient.client.apellidos[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{detailClient.client.nombre} {detailClient.client.apellidos}</h2>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-md text-[10px] font-bold px-2 py-0 h-5">ID: {detailClient.client.codigoCliente}</Badge>
                                            <Badge className={`text-[10px] font-bold px-2 py-0 h-5 border-none ${detailClient.client.estado === 'activo' ? 'bg-emerald-400 text-emerald-950' : 'bg-red-400 text-red-950'}`}>
                                                {detailClient.client.estado.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Tabs defaultValue="info" className="flex-1 flex flex-col">
                                <TabsList className="w-full justify-start rounded-none h-14 bg-background border-b px-8 gap-8">
                                    <TabsTrigger value="info" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 gap-2 font-bold transition-none shadow-none text-muted-foreground data-[state=active]:text-primary">
                                        <Info className="h-4 w-4" /> Información
                                    </TabsTrigger>
                                    <TabsTrigger value="facturas" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 gap-2 font-bold transition-none shadow-none text-muted-foreground data-[state=active]:text-primary">
                                        <FileText className="h-4 w-4" /> Facturas
                                        {detailClient.invoices.length > 0 && <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] justify-center px-1.5 bg-primary/10 text-primary border-none">{detailClient.invoices.length}</Badge>}
                                    </TabsTrigger>
                                    <TabsTrigger value="averias" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 gap-2 font-bold transition-none shadow-none text-muted-foreground data-[state=active]:text-primary">
                                        <Wrench className="h-4 w-4" /> Averías
                                        {detailClient.tickets.length > 0 && <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] justify-center px-1.5 bg-primary/10 text-primary border-none">{detailClient.tickets.length}</Badge>}
                                    </TabsTrigger>
                                </TabsList>

                                <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
                                    <TabsContent value="info" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="space-y-6">
                                            {/* Identidad */}
                                            <div className="space-y-4">
                                                <h3 className="text-[11px] uppercase tracking-[0.2em] font-black flex items-center gap-2 text-primary/60 px-1">
                                                    Identidad y Clasificación
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <Card className="shadow-none border-none bg-background ring-1 ring-border/50">
                                                        <CardContent className="p-4 space-y-4">
                                                            <div className="flex justify-between items-center py-1 border-b border-muted/50">
                                                                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Cédula / RNC</Label>
                                                                <p className="text-sm font-bold text-foreground">{detailClient.client.cedula || "N/A"}</p>
                                                            </div>
                                                            <div className="flex justify-between items-center py-1 border-b border-muted/50">
                                                                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Categoría</Label>
                                                                <p className="text-sm font-bold capitalize text-foreground">{detailClient.client.categoriaCliente}</p>
                                                            </div>
                                                            <div className="flex justify-between items-center py-1">
                                                                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Tipo Cliente</Label>
                                                                <p className="text-sm font-bold capitalize text-foreground">{detailClient.client.tipoCliente}</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Contacto */}
                                            <div className="space-y-4">
                                                <h3 className="text-[11px] uppercase tracking-[0.2em] font-black flex items-center gap-2 text-primary/60 px-1">
                                                    Vías de Comunicación
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-4 p-4 bg-background rounded-2xl ring-1 ring-border/50 shadow-sm">
                                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                            <Phone className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-tighter">Teléfono Principal</Label>
                                                            <p className="text-sm font-bold text-foreground">{detailClient.client.telefono || "No especificado"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 p-4 bg-background rounded-2xl ring-1 ring-border/50 shadow-sm">
                                                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                                                            <Mail className="h-5 w-5" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-tighter">Email de Contacto</Label>
                                                            <p className="text-sm font-bold text-foreground truncate">{detailClient.client.email || "No especificado"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 p-4 bg-background rounded-2xl ring-1 ring-border/50 shadow-sm">
                                                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                                            <MapPin className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-tighter">Ubicación</Label>
                                                            <p className="text-sm font-bold text-foreground">{detailClient.client.direccion || "Sin dirección"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Card className="border-none bg-primary/5 ring-1 ring-primary/10">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-5 w-5 text-primary/70" />
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-primary/70 tracking-widest">Miembro desde</p>
                                                        <p className="text-sm font-bold text-foreground">
                                                            {new Date(detailClient.client.createdAt).toLocaleDateString('es-DO', {
                                                                year: 'numeric', month: 'long', day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <History className="h-8 w-8 text-primary/5" />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="facturas" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {detailClient.invoices.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground/50">
                                                <div className="p-4 rounded-full bg-muted/20">
                                                    <FileText className="h-12 w-12" />
                                                </div>
                                                <p className="font-bold text-sm">No se registra actividad financiera reciente.</p>
                                            </div>
                                        ) : (
                                            <Card className="border-none ring-1 ring-border/50 shadow-sm overflow-hidden">
                                                <Table>
                                                    <TableHeader className="bg-muted/30">
                                                        <TableRow>
                                                            <TableHead className="font-bold text-xs uppercase text-muted-foreground">Factura</TableHead>
                                                            <TableHead className="font-bold text-xs uppercase text-muted-foreground">Fecha</TableHead>
                                                            <TableHead className="font-bold text-xs uppercase text-muted-foreground">Importe</TableHead>
                                                            <TableHead className="font-bold text-xs uppercase text-muted-foreground">Estado</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {detailClient.invoices.map((inv) => (
                                                            <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors">
                                                                <TableCell className="font-mono font-bold text-primary text-xs">{inv.numeroFactura}</TableCell>
                                                                <TableCell className="text-xs font-medium">{new Date(inv.fechaFactura).toLocaleDateString()}</TableCell>
                                                                <TableCell className="font-bold text-foreground text-xs">RD$ {parseFloat(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                                <TableCell>
                                                                    <Badge className={`text-[9px] font-bold h-5 shadow-none border-none py-0 ${inv.estado === 'paga' ? 'bg-emerald-500/10 text-emerald-600' :
                                                                        inv.estado === 'pendiente' ? 'bg-red-500/10 text-red-600' :
                                                                            'bg-gray-500/10 text-gray-600'
                                                                        }`}>
                                                                        {inv.estado.toUpperCase()}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="averias" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {detailClient.tickets.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground/50">
                                                <div className="p-4 rounded-full bg-muted/20">
                                                    <Wrench className="h-12 w-12" />
                                                </div>
                                                <p className="font-bold text-sm">Sin reportes de averías o tickets técnicos.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {detailClient.tickets.map((t) => (
                                                    <Card key={t.id} className="border-none ring-1 ring-border/60 hover:ring-primary/20 transition-all shadow-sm group">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-muted rounded-md ring-1 ring-border/50">{t.numeroTicket}</span>
                                                                    <Badge className={`font-bold text-[9px] h-5 shadow-none border-none ${t.estado === 'abierto' ? 'bg-red-500/10 text-red-600' :
                                                                        t.estado === 'proceso' ? 'bg-amber-500/10 text-amber-600' :
                                                                            'bg-emerald-500/10 text-emerald-600'
                                                                        }`}>
                                                                        {t.estado === 'abierto' ? 'REPORTADA' : t.estado === 'cerrado' ? 'SOLUCIONADA' : 'PROCESANDO'}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center text-[10px] text-muted-foreground font-bold gap-1.5 opacity-70">
                                                                    <Clock className="h-3.5 w-3.5" /> {new Date(t.fechaCreacion).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{t.asunto}</h4>
                                                            <div className="mt-3 flex items-center justify-between">
                                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.prioridad === 'alta' ? 'bg-red-100 text-red-600' :
                                                                    t.prioridad === 'media' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                                                    }`}>Prioridad {t.prioridad}</span>
                                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-primary px-2 hover:bg-primary/5">Ver Informe</Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>

                            <div className="p-6 border-t bg-background flex flex-col sm:flex-row justify-between items-center gap-4">
                                <Button variant="ghost" className="text-muted-foreground text-xs font-bold uppercase tracking-widest hover:bg-muted/50" onClick={() => setIsDetailModalOpen(false)}>
                                    Cerrar Expediente
                                </Button>
                                <Button className="gap-2 shadow-xl shadow-primary/20 px-8 font-bold" onClick={(e) => toggleStatus(detailClient.client, e as any)}>
                                    <BadgeCheck className="h-4 w-4" /> Reactivar Cliente
                                </Button>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3 text-xs text-orange-800 shadow-sm">
                <Info className="h-5 w-5 text-orange-600 shrink-0" />
                <p>
                    <strong>Nota:</strong> Esta vista solo muestra clientes en estado <strong>Inactivo, Suspendido o Cancelado</strong>. Para ver todos los clientes o registrarlos, diríjase al listado general.
                </p>
            </div>
        </div>
    );
}
