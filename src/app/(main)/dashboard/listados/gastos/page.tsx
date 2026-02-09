"use client";

import { useState, useEffect } from "react";
import {
    TrendingDown,
    Search,
    RefreshCw,
    Download,
    Calendar,
    ArrowDownCircle,
    DollarSign,
    Filter,
    CreditCard,
    FileText,
    PieChart,
    ChevronLeft,
    ChevronRight,
    ArrowDownRight
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

interface Expense {
    id: string;
    fecha: string;
    monto: number;
    beneficiario: string;
    concepto: string;
    tipo: 'PROVEEDOR' | 'FIJO' | 'OTRO';
    metodoPago: string;
    referencia?: string;
    detalles?: string;
}

interface ChartData {
    date: string;
    total: number;
}

const ITEMS_PER_PAGE = 8;
const COLORS = ['#ef4444', '#f97316', '#dc2626', '#ea580c', '#b91c1c', '#c2410c'];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
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

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/gastos");
            const data = await res.json();

            if (data.success) {
                setExpenses(data.data);
                setDailyStats(data.dailyStats.map((s: any) => ({ ...s, total: parseFloat(s.total) })));
                setSummary(data.summary);
            } else {
                toast.error("Error al cargar gastos: " + data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch =
            (expense.beneficiario?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (expense.concepto?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (expense.referencia?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || expense.tipo === typeFilter;
        return matchesSearch && matchesType;
    });

    const paginatedItems = filteredExpenses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-6 p-2 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground underline decoration-red-500/30 underline-offset-8">Reporte de Gastos</h1>
                    <p className="text-muted-foreground mt-2">Resumen detallado de egresos, pagos a proveedores y gastos operativos.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 shadow-sm border-red-500/20 text-red-600 hover:bg-red-50" onClick={fetchExpenses}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Sincronizar
                    </Button>
                    <Button className="gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 text-white">
                        <Download className="h-4 w-4" />
                        Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Gastos (Mes Actual)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total)}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Egresos del mes
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Transacciones (Mes)</CardTitle>
                        <FileText className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{summary.count}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Operaciones registradas
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Promedio (Mes)</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.average)}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Ticket promedio de egreso
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
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    Tendencia de Gastos Diarios
                                </CardTitle>
                                <CardDescription>Comportamiento de los egresos durante este mes.</CardDescription>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full">
                                <PieChart className="h-5 w-5 text-red-600" />
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
                                        formatter={(val: number) => [`RD$ ${val.toLocaleString()}`, 'Gasto']}
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

            {/* Expenses Table Card */}
            <Card className="shadow-md border-none ring-1 ring-border/60 overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <CardTitle className="text-xl">Historial Detallado</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Tipo Gasto" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="PROVEEDOR">Proveedores</SelectItem>
                                <SelectItem value="FIJO">Fijos</SelectItem>
                                <SelectItem value="OTRO">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar beneficiario, concepto..."
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
                                <TableHead className="font-bold">Beneficiario / Concepto</TableHead>
                                <TableHead className="font-bold text-center">Tipo</TableHead>
                                <TableHead className="font-bold">Método</TableHead>
                                <TableHead className="font-bold text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                        Procesando datos de egresos...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                        No se encontraron registros de gastos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedItems.map((expense) => (
                                    <TableRow key={expense.id} className="hover:bg-red-50/50 transition-colors group">
                                        <TableCell className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-foreground">{new Date(expense.fecha).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 uppercase tracking-tighter">
                                                    <Calendar className="h-3 w-3" /> {new Date(expense.fecha).toLocaleDateString('es-DO', { weekday: 'short' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${expense.tipo === 'PROVEEDOR' ? 'bg-blue-100 text-blue-600' : expense.tipo === 'FIJO' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    <ArrowDownRight className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground leading-tight">{expense.beneficiario}</span>
                                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[250px] truncate">{expense.concepto}</p>
                                                    {expense.referencia && (
                                                        <span className="text-[10px] font-mono text-primary/60 mt-0.5">REF: {expense.referencia}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-center">
                                            <Badge className={`
                                                font-normal text-[10px] uppercase shadow-none
                                                ${expense.tipo === 'PROVEEDOR' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                    expense.tipo === 'FIJO' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                                        'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                                            `}>
                                                {expense.tipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <Badge variant="outline" className="text-[9px] font-black uppercase border-red-200 text-red-700 bg-red-50 h-5 shadow-none">
                                                {expense.metodoPago}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-right">
                                            <span className="font-bold text-base text-red-600">
                                                - {formatCurrency(expense.monto)}
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
