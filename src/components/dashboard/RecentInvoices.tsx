
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, MessageSquare, MessageCircle, FileText, Edit, MoreVertical, Search } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { pdfServiceFixed } from "@/services/pdfServiceFixed";
import { useIsMobile } from "@/hooks/use-mobile";

// Données factices pour les factures récentes
const invoices = [
  {
    id: "INV-001",
    client: "Société ABC",
    contact: "+212 661 234 567",
    date: "05/08/2025",
    amount: 15000,
    advanceAmount: 5000,
    status: "Payée",
    paymentMethod: "Virement",
  },
  {
    id: "INV-002",
    client: "Event Pro Services",
    contact: "+212 662 345 678",
    date: "02/08/2025",
    amount: 8500,
    advanceAmount: 3000,
    status: "En attente",
    paymentMethod: "Chèque",
  },
  {
    id: "INV-003",
    client: "Hotel Marrakech",
    contact: "+212 663 456 789",
    date: "29/07/2025",
    amount: 22000,
    advanceAmount: 10000,
    status: "Payée",
    paymentMethod: "Carte bancaire",
  },
];

export function RecentInvoices() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");

  const handleWhatsappContact = (contact: string, invoiceId: string) => {
    // Formatage du numéro pour WhatsApp (enlève les espaces)
    const whatsappNumber = contact.replace(/\s/g, '');
    const message = `Bonjour, je vous contacte au sujet de la facture ${invoiceId}.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Ouvre WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank');
    
    toast.success("WhatsApp ouvert", {
      description: `Message préparé pour ${contact}`
    });
  };

  const handlePhoneCall = (contact: string) => {
    window.location.href = `tel:${contact.replace(/\s/g, '')}`;
    toast.success("Appel en cours", {
      description: `Appel vers ${contact}`
    });
  };

  const handleSMS = (contact: string, invoiceId: string) => {
    const message = `Rappel concernant la facture ${invoiceId}.`;
    window.location.href = `sms:${contact.replace(/\s/g, '')}?body=${encodeURIComponent(message)}`;
    toast.success("SMS préparé", {
      description: `SMS pour ${contact}`
    });
  };

  const handleGeneratePDF = (invoice: any) => {
    const pdfData = {
      id: invoice.id,
      client: invoice.client,
      date: new Date().toLocaleDateString('fr-FR'),
      items: [
        {
          description: invoice.description || 'Service',
          quantity: 1,
          unitPrice: invoice.amount,
          total: invoice.amount
        }
      ],
      subtotal: invoice.amount,
      total: invoice.amount
    };

    pdfServiceFixed.generateQuotePDF(pdfData, 'invoice');
    toast.success("PDF généré", {
      description: `Facture ${invoice.id} pour ${invoice.client}`
    });
  };

  const handleEditInvoice = (invoice: any) => {
    // Redirection vers la page de modification de facture
    window.location.href = `/invoices?edit=${invoice.id}`;
    toast.info("Redirection", {
      description: `Modification de la facture ${invoice.id}`
    });
  };

  // Filtrer les factures selon le terme de recherche
  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Factures récentes</CardTitle>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 h-8 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className={isMobile ? "px-2" : ""}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className={isMobile ? "hidden" : ""}>Date</TableHead>
                <TableHead className={isMobile ? "hidden" : ""}>Montant (MAD)</TableHead>
                <TableHead className={isMobile ? "hidden" : ""}>Avance (MAD)</TableHead>
                <TableHead className={isMobile ? "hidden" : ""}>Mode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell className={isMobile ? "hidden" : ""}>{invoice.date}</TableCell>
                  <TableCell className={isMobile ? "hidden" : ""}>{invoice.amount.toLocaleString()} MAD</TableCell>
                  <TableCell className={isMobile ? "hidden" : ""}>{invoice.advanceAmount.toLocaleString()} MAD</TableCell>
                  <TableCell className={isMobile ? "hidden" : ""}>{invoice.paymentMethod}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${invoice.status === "Payée" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleGeneratePDF(invoice)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Générer PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePhoneCall(invoice.contact)}>
                          <Phone className="mr-2 h-4 w-4" />
                          Appeler
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSMS(invoice.contact, invoice.id)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          SMS
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleWhatsappContact(invoice.contact, invoice.id)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          WhatsApp
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentInvoices;
