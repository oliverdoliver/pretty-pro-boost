import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { sv } from "date-fns/locale";

interface InvoiceStats {
  new: number;
  pending_attestation: number;
  attested: number;
  paid: number;
}

interface Invoice {
  id: string;
  invoice_number: string | null;
  amount: number;
  due_date: string;
  status: string;
  vendors: {
    name: string;
  } | null;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<InvoiceStats>({
    new: 0,
    pending_attestation: 0,
    attested: 0,
    paid: 0,
  });
  const [upcomingInvoices, setUpcomingInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.organization_id) return;

      // Fetch invoice counts by status
      const { data: invoices } = await supabase
        .from("invoices")
        .select("status")
        .eq("organization_id", profile.organization_id);

      if (invoices) {
        const newStats: InvoiceStats = {
          new: 0,
          pending_attestation: 0,
          attested: 0,
          paid: 0,
        };
        invoices.forEach((inv) => {
          if (inv.status in newStats) {
            newStats[inv.status as keyof InvoiceStats]++;
          }
        });
        setStats(newStats);
      }

      // Fetch upcoming invoices (next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);

      const { data: upcoming } = await supabase
        .from("invoices")
        .select("id, invoice_number, amount, due_date, status, vendors(name)")
        .eq("organization_id", profile.organization_id)
        .neq("status", "paid")
        .gte("due_date", format(today, "yyyy-MM-dd"))
        .lte("due_date", format(thirtyDaysFromNow, "yyyy-MM-dd"))
        .order("due_date", { ascending: true })
        .limit(5);

      if (upcoming) {
        setUpcomingInvoices(upcoming as Invoice[]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [profile?.organization_id]);

  const statCards = [
    {
      title: "Nya fakturor",
      value: stats.new,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Under attest",
      value: stats.pending_attestation,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Attesterade",
      value: stats.attested,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Betalda",
      value: stats.paid,
      icon: AlertCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

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
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
            Välkommen, {profile?.first_name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Här är en översikt av era fakturor
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-semibold text-foreground mt-1">
                        {isLoading ? "-" : stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Kommande förfall (30 dagar)
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/portal/invoices">
                  Visa alla
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : upcomingInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>Inga kommande förfall de närmaste 30 dagarna</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {upcomingInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      to={`/portal/invoices/${invoice.id}`}
                      className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {invoice.vendors?.name || "Okänd leverantör"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.invoice_number || "Inget fakturanummer"}
                        </p>
                      </div>
                      <div className="text-right">
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
                      <div className="ml-4">
                        {getStatusBadge(invoice.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
