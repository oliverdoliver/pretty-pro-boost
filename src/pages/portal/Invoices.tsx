import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  FileText,
  ChevronRight,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface Invoice {
  id: string;
  invoice_number: string | null;
  ocr_number: string | null;
  amount: number;
  vat_amount: number | null;
  invoice_date: string;
  due_date: string;
  status: string;
  description: string | null;
  vendors: {
    id: string;
    name: string;
  } | null;
}

type StatusFilter = "all" | "new" | "pending_attestation" | "attested" | "rejected" | "paid";

export default function Invoices() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!profile?.organization_id) return;

      let query = supabase
        .from("invoices")
        .select("*, vendors(id, name)")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching invoices:", error);
      } else {
        setInvoices(data as Invoice[]);
      }

      setIsLoading(false);
    };

    fetchInvoices();
  }, [profile?.organization_id, statusFilter]);

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(search) ||
      invoice.ocr_number?.toLowerCase().includes(search) ||
      invoice.vendors?.name.toLowerCase().includes(search) ||
      invoice.description?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      new: { label: "Ny", className: "bg-blue-100 text-blue-700" },
      pending_attestation: { label: "Under attest", className: "bg-amber-100 text-amber-700" },
      attested: { label: "Attesterad", className: "bg-green-100 text-green-700" },
      rejected: { label: "Avslagen", className: "bg-red-100 text-red-700" },
      paid: { label: "Betald", className: "bg-primary/10 text-primary" },
    };
    const s = statusMap[status] || { label: status, className: "bg-muted text-muted-foreground" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>
        {s.label}
      </span>
    );
  };

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
              Fakturor
            </h1>
            <p className="text-muted-foreground mt-1">
              Hantera och attestera fakturor
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Sök på fakturanummer, leverantör, OCR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrera status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla status</SelectItem>
                  <SelectItem value="new">Nya</SelectItem>
                  <SelectItem value="pending_attestation">Under attest</SelectItem>
                  <SelectItem value="attested">Attesterade</SelectItem>
                  <SelectItem value="rejected">Avslagna</SelectItem>
                  <SelectItem value="paid">Betalda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoice List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Inga fakturor hittades</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredInvoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/portal/invoices/${invoice.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {invoice.vendors?.name || "Okänd leverantör"}
                          </p>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.invoice_number || "Inget fakturanummer"} •{" "}
                          {format(new Date(invoice.invoice_date), "d MMM yyyy", { locale: sv })}
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="font-medium text-foreground">
                          {new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(invoice.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Förfaller {format(new Date(invoice.due_date), "d MMM", { locale: sv })}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
