
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { pdfServiceFixed } from "@/services/pdfServiceFixed";

const quoteFormSchema = z.object({
  client: z.string().min(1, { message: "Le client est requis" }),
  date: z.string().min(1, { message: "La date est requise" }),
  amount: z.string().min(1, { message: "Le montant est requis" }),
  advanceAmount: z.string(),
  description: z.string().min(1, { message: "La description est requise" }),
  paymentMethod: z.enum(["Virement", "Chèque", "Espèces", "Carte bancaire"]),
  paymentStatus: z.enum(["En attente", "Partiel", "Payé"]).default("En attente"),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email({ message: "Email invalide" }).optional().or(z.literal('')),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuote?: (quote: QuoteFormValues) => any;
}

export function QuoteForm({ open, onOpenChange, onAddQuote }: QuoteFormProps) {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      client: "",
      date: new Date().toISOString().split('T')[0],
      amount: "",
      advanceAmount: "0",
      description: "",
      paymentMethod: "Virement",
      paymentStatus: "En attente",
      clientPhone: "",
      clientEmail: "",
    },
  });

  // Surveiller les changements de montant et d'avance pour déterminer le statut
  React.useEffect(() => {
    const amount = parseFloat(form.watch("amount") || "0");
    const advanceAmount = parseFloat(form.watch("advanceAmount") || "0");
    
    if (advanceAmount <= 0) {
      form.setValue("paymentStatus", "En attente");
    } else if (advanceAmount >= amount) {
      form.setValue("paymentStatus", "Payé");
    } else {
      form.setValue("paymentStatus", "Partiel");
    }
  }, [form.watch("amount"), form.watch("advanceAmount")]);

  function onSubmit(data: QuoteFormValues) {
    let newQuote;
    
    if (onAddQuote) {
      newQuote = onAddQuote(data);
      
      // Générer PDF optionnel
      if (confirm("Voulez-vous générer un PDF pour ce devis?")) {
        const pdfData = {
          id: newQuote.id,
          client: data.client,
          date: newQuote.date,
          items: [
            {
              description: data.description,
              quantity: 1,
              unitPrice: parseInt(data.amount),
              total: parseInt(data.amount)
            }
          ],
          subtotal: parseInt(data.amount),
          total: parseInt(data.amount)
        };
        pdfServiceFixed.generateQuotePDF(pdfData, 'quote');
      }
    } else {
      toast.success("Devis créé", {
        description: `Le devis pour ${data.client} a été créé avec succès.`,
      });
    }
    form.reset();
    onOpenChange(false);
  }

  const remainingAmount = () => {
    const amount = parseFloat(form.watch("amount") || "0");
    const advanceAmount = parseFloat(form.watch("advanceAmount") || "0");
    return amount - advanceAmount;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un devis</DialogTitle>
          <DialogDescription>
            Créer un nouveau devis pour un client
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone du client</FormLabel>
                    <FormControl>
                      <Input placeholder="+212 661 123 456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email du client</FormLabel>
                    <FormControl>
                      <Input placeholder="client@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant total (MAD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advanceAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avance (MAD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs flex justify-between">
                      <span>
                        {form.watch("advanceAmount") && form.watch("amount") && 
                          `Reste à payer: ${remainingAmount().toLocaleString()} MAD`
                        }
                      </span>
                      <span>
                        {form.watch("amount") && form.watch("advanceAmount") &&
                          `(${Math.round((parseInt(form.watch("advanceAmount")) / parseInt(form.watch("amount"))) * 100)}%)`
                        }
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de paiement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Virement">Virement</SelectItem>
                        <SelectItem value="Chèque">Chèque</SelectItem>
                        <SelectItem value="Espèces">Espèces</SelectItem>
                        <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut du paiement</FormLabel>
                    <div className="h-10 flex items-center">
                      {field.value === "En attente" && (
                        <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                      )}
                      {field.value === "Partiel" && (
                        <Badge className="bg-blue-100 text-blue-800">Paiement partiel</Badge>
                      )}
                      {field.value === "Payé" && (
                        <Badge className="bg-green-100 text-green-800">Payé</Badge>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description du devis..." {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col md:flex-row gap-2">
              <Button type="submit" className="w-full md:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                Créer le devis
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
