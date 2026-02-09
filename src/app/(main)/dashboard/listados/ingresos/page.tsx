"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Search,
    RefreshCw,
    Download,
    Calendar,
    ArrowUpCircle,
    DollarSign,
    Filter,
    ArrowLeftRight,
    CreditCard,
    FileText,
    PieChart,
    ChevronLeft,
    ChevronRight,
    LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface Income {
    id: string;
    monto: string;
    fecha: string;
    metodo: string;
    referencia: string | null;
    cliente: string;
    tipo: "pago_cliente" | "movimiento_contable";
    descripcion: string;
}

interface ChartData {
    date: string;
    total: number;
}

const ITEMS_PER_PAGE = 10;

export default function IncomesPage() {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [dailyStats, setDailyStats] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [summary, setSummary] = useState({ total: 0, count: 0, average: 0 });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2
        }).format(amount);
    };

    const fetchIncomes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/ingresos");
            const data = await res.json();
            if (data.success) {
                setIncomes(data.data);
                setDailyStats(data.dailyStats.map((s: any) => ({ ...s, total: parseFloat(s.total) })));
                setSummary(data.summary);
            } else {
                toast.error("Error al cargar ingresos: " + data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, []);

    const filteredIncomes = incomes.filter(inc => {
        const matchesSearch =
            inc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inc.referencia?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || inc.tipo === typeFilter;
        return matchesSearch && matchesType;
    });

    const paginatedItems = filteredIncomes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE);

    // Prepare chart colors based on current theme/styles
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="flex flex-col gap-6 p-2 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground underline decoration-emerald-500/30 underline-offset-8">Reporte de Ingresos</h1>
                    <p className="text-muted-foreground mt-2">Seguimiento detallado y visual de los flujos de entrada de capital.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 shadow-sm border-emerald-500/20 text-emerald-600 hover:bg-emerald-50" onClick={fetchIncomes}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Sincronizar
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                        <Download className="h-4 w-4" />
                        Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Ingresos (Mes Actual)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total)}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Facturado este mes
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Transacciones (Mes)</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{summary.count}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Operaciones registradas
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Promedio (Mes)</CardTitle>
                        <DollarSign className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.average)}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Ticket promedio mensual
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-1">
                <Card className="shadow-xl border-none ring-1 ring-border/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    Visualización de Ingresos Diarios
                                </CardTitle>
                                <CardDescription>Tendencia de recaudación durante el mes en curso.</CardDescription>
                            </div>
                            <div className="p-2 bg-emerald-100 rounded-full">
                                <PieChart className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(val) => new Date(val).getDate().toString()}
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `RD$ ${val / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val: number) => [`RD$ ${val.toLocaleString()}`, 'Ingreso']}
                                        labelFormatter={(label) => `Fecha: ${new Date(label).toLocaleDateString()}`}
                                    />
                                    <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                                        {dailyStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Incomes Table Card */}
            <Card className="shadow-md border-none ring-1 ring-border/60 overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <CardTitle className="text-xl">Historial de Transacciones</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Tipo Ingreso" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="PAGO CLIENTE">Pagos de Clientes</SelectItem>
                                <SelectItem value="VENTA PAPELERIA">Ventas Papelería</SelectItem>
                                <SelectItem value="OTRO INGRESO">Otros Ingresos</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente o ref..."
                                className="pl-9 h-9"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-bold">Fecha</TableHead>
                                <TableHead className="font-bold">Origen / Cliente</TableHead>
                                <TableHead className="font-bold">Descripción</TableHead>
                                <TableHead className="font-bold">Metodo</TableHead>
                                <TableHead className="font-bold text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                        Procesando datos contables...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                        No se encontraron registros de ingresos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedItems.map((inc) => (
                                    <TableRow key={inc.id} className="hover:bg-emerald-50/50 transition-colors group">
                                        <TableCell className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-foreground">{new Date(inc.fecha).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 uppercase tracking-tighter">
                                                    <Calendar className="h-3 w-3" /> {new Date(inc.fecha).toLocaleDateString('es-DO', { weekday: 'short' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${inc.tipo === 'pago_cliente' ? 'bg-blue-500/10 text-blue-600' : 'bg-violet-500/10 text-violet-600'}`}>
                                                    {inc.tipo === 'pago_cliente' ? <CreditCard className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground leading-tight">{inc.cliente}</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                                                        {inc.tipo === 'pago_cliente' ? 'Cobro Servicio' : 'Op. Interna'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs text-muted-foreground leading-relaxed max-w-[300px] truncate">{inc.descripcion}</p>
                                                {inc.referencia && (
                                                    <span className="text-[10px] font-mono text-primary/60">REF: {inc.referencia}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <Badge variant="outline" className="text-[9px] font-black uppercase border-emerald-200 text-emerald-700 bg-emerald-50 h-5 shadow-none">
                                                {inc.metodo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-right">
                                            <span className="font-bold text-base text-emerald-600">
                                                RD$ {parseFloat(inc.monto).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
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
        </div>
    );
}
