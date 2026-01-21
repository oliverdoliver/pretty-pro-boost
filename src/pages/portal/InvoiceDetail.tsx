import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Building2,
  Loader2,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface Invoice {
  id: string;
  invoice_number: string | null;
  ocr_number: string | null;
  amount: number;
  vat_amount: number | null;
  currency: string | null;
  invoice_date: string;
  due_date: string;
  status: string;
  description: string | null;
  vendors: {
    id: string;
    name: string;
    org_number: string | null;
    address: string | null;
    bankgiro: string | null;
    plusgiro: string | null;
  } | null;
}

interface InvoiceLine {
  id: string;
  account_code: string | null;
  cost_center: string | null;
  project: string | null;
  vat_code: string | null;
  amount: number;
  description: string | null;
}

interface InvoiceEvent {
  id: string;
  event_type: string;
  comment: string | null;
  created_at: string;
  user_id: string | null;
}

interface InvoiceAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
}

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isBrfAdmin, isBrfUser, isSuperadmin } = useAuth();
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [events, setEvents] = useState<InvoiceEvent[]>([]);
  const [attachments, setAttachments] = useState<InvoiceAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttesting, setIsAttesting] = useState(false);
  const [comment, setComment] = useState("");

  // Accounting form state
  const [accountCode, setAccountCode] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [project, setProject] = useState("");
  const [vatCode, setVatCode] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;

      const [invoiceRes, linesRes, eventsRes, attachmentsRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("*, vendors(*)")
          .eq("id", id)
          .single(),
        supabase
          .from("invoice_lines")
          .select("*")
          .eq("invoice_id", id),
        supabase
          .from("invoice_events")
          .select("*")
          .eq("invoice_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("invoice_attachments")
          .select("*")
          .eq("invoice_id", id),
      ]);

      if (invoiceRes.data) {
        setInvoice(invoiceRes.data as Invoice);
      }
      if (linesRes.data) {
        setLines(linesRes.data as InvoiceLine[]);
        if (linesRes.data.length > 0) {
          const line = linesRes.data[0];
          setAccountCode(line.account_code || "");
          setCostCenter(line.cost_center || "");
          setProject(line.project || "");
          setVatCode(line.vat_code || "");
        }
      }
      if (eventsRes.data) {
        setEvents(eventsRes.data as InvoiceEvent[]);
      }
      if (attachmentsRes.data) {
        setAttachments(attachmentsRes.data as InvoiceAttachment[]);
      }

      setIsLoading(false);
    };

    fetchInvoice();
  }, [id]);

  const handleAttest = async (approved: boolean) => {
    if (!invoice || !user) return;

    setIsAttesting(true);

    const newStatus = approved ? "attested" : "rejected";
    const eventType = approved ? "attested" : "rejected";

    // Update invoice status
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", invoice.id);

    if (updateError) {
      toast({
        title: "Ett fel uppstod",
        description: updateError.message,
        variant: "destructive",
      });
      setIsAttesting(false);
      return;
    }

    // Create event
    await supabase.from("invoice_events").insert({
      invoice_id: invoice.id,
      event_type: eventType,
      user_id: user.id,
      comment: comment || null,
    } as any);

    toast({
      title: approved ? "Faktura attesterad" : "Faktura avslagen",
      description: approved
        ? "Fakturan har godkänts för betalning."
        : "Fakturan har avslagits.",
    });

    setInvoice({ ...invoice, status: newStatus });
    setIsAttesting(false);
    setComment("");
  };

  const handleSaveAccounting = async () => {
    if (!invoice || !user) return;

    // Check if line exists
    if (lines.length > 0) {
      // Update existing line
      await supabase
        .from("invoice_lines")
        .update({
          account_code: accountCode || null,
          cost_center: costCenter || null,
          project: project || null,
          vat_code: vatCode || null,
        })
        .eq("id", lines[0].id);
    } else {
      // Create new line
      await supabase.from("invoice_lines").insert({
        invoice_id: invoice.id,
        account_code: accountCode || null,
        cost_center: costCenter || null,
        project: project || null,
        vat_code: vatCode || null,
        amount: invoice.amount,
      } as any);
    }

    toast({
      title: "Kontering sparad",
      description: "Konteringsinformationen har uppdaterats.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      new: { label: "Ny", className: "bg-blue-100 text-blue-700", icon: FileText },
      pending_attestation: { label: "Under attest", className: "bg-amber-100 text-amber-700", icon: Clock },
      attested: { label: "Attesterad", className: "bg-green-100 text-green-700", icon: CheckCircle },
      rejected: { label: "Avslagen", className: "bg-red-100 text-red-700", icon: XCircle },
      paid: { label: "Betald", className: "bg-primary/10 text-primary", icon: CheckCircle },
    };
    const s = statusMap[status] || { label: status, className: "bg-muted text-muted-foreground", icon: FileText };
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${s.className}`}>
        <Icon className="w-4 h-4" />
        {s.label}
      </span>
    );
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      created: "Faktura skapad",
      sent: "Skickad för attest",
      attested: "Attesterad",
      rejected: "Avslagen",
      paid: "Markerad som betald",
      comment: "Kommentar",
      updated: "Uppdaterad",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  if (!invoice) {
    return (
      <PortalLayout>
        <div className="p-6 lg:p-8 text-center">
          <p className="text-muted-foreground">Fakturan kunde inte hittas.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/portal/invoices")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till fakturor
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const canAttest = (isBrfUser || isBrfAdmin || isSuperadmin) && 
    (invoice.status === "new" || invoice.status === "pending_attestation");

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/portal/invoices")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif font-semibold text-foreground">
                Faktura {invoice.invoice_number || "#" + invoice.id.slice(0, 8)}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              {invoice.vendors?.name || "Okänd leverantör"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Fakturadetaljer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Leverantör</p>
                      <p className="font-medium">{invoice.vendors?.name || "-"}</p>
                      {invoice.vendors?.org_number && (
                        <p className="text-sm text-muted-foreground">
                          Org.nr: {invoice.vendors.org_number}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fakturanummer</p>
                      <p className="font-medium">{invoice.invoice_number || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">OCR-nummer</p>
                      <p className="font-medium">{invoice.ocr_number || "-"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Belopp</p>
                      <p className="text-2xl font-semibold text-foreground">
                        {new Intl.NumberFormat("sv-SE", {
                          style: "currency",
                          currency: invoice.currency || "SEK",
                        }).format(invoice.amount)}
                      </p>
                      {invoice.vat_amount && (
                        <p className="text-sm text-muted-foreground">
                          Varav moms: {new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: invoice.currency || "SEK",
                          }).format(invoice.vat_amount)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fakturadatum</p>
                      <p className="font-medium">
                        {format(new Date(invoice.invoice_date), "d MMMM yyyy", { locale: sv })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Förfallodatum</p>
                      <p className="font-medium">
                        {format(new Date(invoice.due_date), "d MMMM yyyy", { locale: sv })}
                      </p>
                    </div>
                  </div>
                </div>
                {invoice.description && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">Beskrivning</p>
                    <p className="mt-1">{invoice.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accounting */}
            <Card>
              <CardHeader>
                <CardTitle>Kontering</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountCode">BAS-konto</Label>
                    <Input
                      id="accountCode"
                      placeholder="t.ex. 6210"
                      value={accountCode}
                      onChange={(e) => setAccountCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costCenter">Kostnadsställe</Label>
                    <Input
                      id="costCenter"
                      placeholder="t.ex. 100"
                      value={costCenter}
                      onChange={(e) => setCostCenter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Projekt</Label>
                    <Input
                      id="project"
                      placeholder="t.ex. Renovering 2024"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatCode">Momskod</Label>
                    <Input
                      id="vatCode"
                      placeholder="t.ex. 25%"
                      value={vatCode}
                      onChange={(e) => setVatCode(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="mt-4" onClick={handleSaveAccounting}>
                  Spara kontering
                </Button>
              </CardContent>
            </Card>

            {/* Attest */}
            {canAttest && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Attestera faktura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comment">Kommentar (valfritt)</Label>
                    <Textarea
                      id="comment"
                      placeholder="Lägg till en kommentar..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => handleAttest(true)}
                      disabled={isAttesting}
                    >
                      {isAttesting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Godkänn
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleAttest(false)}
                      disabled={isAttesting}
                    >
                      {isAttesting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Avslå
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Bilagor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inga bilagor</p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                      >
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="flex-1 text-sm truncate">
                          {attachment.file_name}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Aktivitetslogg
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ingen aktivitet ännu</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="text-sm font-medium">
                            {getEventLabel(event.event_type)}
                          </p>
                          {event.comment && (
                            <p className="text-sm text-muted-foreground mt-1">
                              "{event.comment}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.created_at), "d MMM yyyy, HH:mm", { locale: sv })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
