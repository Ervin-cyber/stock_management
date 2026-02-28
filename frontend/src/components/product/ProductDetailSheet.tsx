import { Package, MapPin, Activity, Clock, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDateTime, formatNumber } from '@/utils/formatter';
import type { ProductDetailSheetProps } from '@/types';
import { useProductDetails } from '@/hooks/useProducts';

export default function ProductDetailSheet({ productId, isOpen, onClose }: ProductDetailSheetProps) {
    const { data: product, isLoading } = useProductDetails(productId);

    const totalStock = product?.stocks?.reduce((sum: number, stock: any) => sum + stock.stockQuantity, 0) || 0;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-[45vw] overflow-y-auto bg-slate-50 px-3">

                <SheetHeader>
                    <SheetTitle className="text-xl font-bold text-slate-800">Product Detail</SheetTitle>
                    <SheetDescription>Detailed view of product stock and history.</SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                ) : !product ? (
                    <div className="p-6 text-center text-slate-500">Product not found.</div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Package className="h-6 w-6 text-blue-600" />
                                        {product.name}
                                    </h2>
                                    <p className="text-base text-slate-500 mt-1">
                                        SKU: <span className="font-mono font-medium text-slate-700">{product.sku}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 mb-1">Total Stock</p>
                                    <Badge variant={totalStock > 0 ? "default" : "destructive"} className="text-lg px-3 py-1">
                                        {formatNumber(totalStock)} pcs
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="stock" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-2">
                                <TabsTrigger value="stock">Inventory</TabsTrigger>
                                <TabsTrigger value="history">Recent Movements</TabsTrigger>
                            </TabsList>

                            <TabsContent value="stock" className="space-y-4">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2 px-1">
                                    <MapPin className="h-4 w-4 text-slate-500" /> Stock per Warehouse
                                </h3>

                                {product.stocks?.length === 0 ? (
                                    <div className="p-8 text-center bg-white border rounded-lg text-slate-500 shadow-sm">
                                        It is not in stock in any warehouse.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {product.stocks?.map((stock: any) => (
                                            <div key={stock.id} className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm">
                                                <div>
                                                    <p className="font-medium text-slate-900">{stock.warehouse.name}</p>
                                                    {stock.warehouse.location && (
                                                        <p className="text-sm text-slate-500">{stock.warehouse.location}</p>
                                                    )}
                                                </div>
                                                <div className="text-xl font-bold text-slate-800">
                                                    {formatNumber(stock.stockQuantity)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2 px-1">
                                    <Activity className="h-4 w-4 text-slate-500" /> Last 5 Transactions
                                </h3>

                                {product.movements?.length === 0 ? (
                                    <div className="p-8 text-center bg-white border rounded-lg text-slate-500 shadow-sm">
                                        There is no recorded movement for this product.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {product.movements?.map((movement: any) => (
                                            <div key={movement.id} className="p-4 bg-white border rounded-lg shadow-sm flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        {movement.movementType === 'IN' && <Badge className="bg-emerald-100 text-emerald-800 border-none"><ArrowDownRight className="h-3 w-3 mr-1" /> IN</Badge>}
                                                        {movement.movementType === 'OUT' && <Badge className="bg-rose-100 text-rose-800 border-none"><ArrowUpRight className="h-3 w-3 mr-1" /> OUT</Badge>}
                                                        {movement.movementType === 'TRANSFER' && <Badge className="bg-blue-100 text-blue-800 border-none"><RefreshCw className="h-3 w-3 mr-1" /> TRANS</Badge>}
                                                        <span className="font-bold">{formatNumber(movement.stockQuantity)} pcs</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDateTime(movement.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    {movement.movementType === 'IN' && `To: ${movement.destinationWarehouse?.name}`}
                                                    {movement.movementType === 'OUT' && `From: ${movement.sourceWarehouse?.name}`}
                                                    {movement.movementType === 'TRANSFER' && `${movement.sourceWarehouse?.name} ➡️ ${movement.destinationWarehouse?.name}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}